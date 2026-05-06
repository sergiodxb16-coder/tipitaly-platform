import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { getHotelRates, formatPrice, formatBoardType } from "@tip-italy/db/ratehawk";
import { sendTravelBookingEmail } from "@tip-italy/email";
import QRCode from "qrcode";

const TIER_DISCOUNT: Record<string, number> = {
  WHITE: 5,
  GOLD: 10,
  PLATINUM: 15,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cardholder = await prisma.cardholder.findUnique({
      where: { supabaseUid: user.id },
    });
    if (!cardholder) return NextResponse.json({ error: "Cardholder not found" }, { status: 404 });

    const assignment = await prisma.cardAssignment.findFirst({
      where: { cardholderId: cardholder.id },
      include: { card: true },
    });
    if (!assignment || assignment.card.status !== "ACTIVE") {
      return NextResponse.json({ error: "Card non attiva" }, { status: 403 });
    }

    const body = await req.json() as {
      hotelId: string;
      hotelName: string;
      city?: string;
      checkin: string;
      checkout: string;
      adults: number;
      bookHash: string;
      roomName: string;
      boardType: string;
      basePrice: number;
      currency: string;
    };

    const cardLevel = assignment.card.level as "WHITE" | "GOLD" | "PLATINUM";
    const discountPct = TIER_DISCOUNT[cardLevel] ?? 0;
    const discountAmount = (body.basePrice * discountPct) / 100;
    const finalPrice = body.basePrice - discountAmount;

    // Create booking record
    const booking = await prisma.hotelBooking.create({
      data: {
        cardholderId: cardholder.id,
        hotelId: body.hotelId,
        hotelName: body.hotelName,
        city: body.city ?? "",
        checkin: body.checkin,
        checkout: body.checkout,
        adults: body.adults,
        roomName: body.roomName,
        boardType: body.boardType,
        totalPrice: finalPrice,
        currency: body.currency,
        discountApplied: discountPct,
      },
    });

    // Generate QR code as data URL
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/booking/verify/${booking.qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });

    // Send confirmation email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    try {
      await sendTravelBookingEmail({
        to: cardholder.email,
        nome: cardholder.nome,
        bookingType: "hotel",
        hotelName: body.hotelName,
        city: body.city,
        checkin: body.checkin,
        checkout: body.checkout,
        roomName: body.roomName,
        adults: body.adults,
        totalPrice: formatPrice(finalPrice, body.currency),
        discountApplied: discountPct > 0 ? String(discountPct) : undefined,
        cardLevel,
        qrCodeUrl: qrDataUrl,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        manageUrl: `${siteUrl}/dashboard/travel/bookings`,
      });
    } catch (emailErr) {
      console.error("[hotel-book] email error:", emailErr);
    }

    return NextResponse.json({
      bookingId: booking.id,
      bookingRef: booking.id.slice(0, 8).toUpperCase(),
      qrToken: booking.qrToken,
      finalPrice,
      discountApplied: discountPct,
      currency: body.currency,
    });
  } catch (err) {
    console.error("[hotel-book] error:", err);
    return NextResponse.json(
      { error: "Errore durante la prenotazione. Riprova." },
      { status: 500 }
    );
  }
}

// Fetch hotel rates (used by detail page client-side refresh)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = parseInt(searchParams.get("adults") ?? "2", 10);

    if (!hotelId || !checkin || !checkout) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const detail = await getHotelRates(hotelId, { checkin, checkout, adults });

    return NextResponse.json(detail);
  } catch (err) {
    console.error("[hotel-rates] error:", err);
    return NextResponse.json({ error: "Impossibile recuperare le tariffe." }, { status: 500 });
  }
}
