import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { formatFlightPrice } from "@tip-italy/db/amadeus";
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
      offerId: string;
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      airline: string;
      flightNumbers: string;
      adults: number;
      basePrice: number;
      currency: string;
    };

    const cardLevel = assignment.card.level as "WHITE" | "GOLD" | "PLATINUM";
    const discountPct = TIER_DISCOUNT[cardLevel] ?? 0;
    const discountAmount = (body.basePrice * discountPct) / 100;
    const finalPrice = body.basePrice - discountAmount;

    const booking = await prisma.flightBooking.create({
      data: {
        cardholderId: cardholder.id,
        externalRef: body.offerId,
        origin: body.origin,
        destination: body.destination,
        departureDate: body.departureDate,
        returnDate: body.returnDate,
        airline: body.airline,
        flightNumbers: body.flightNumbers,
        adults: body.adults,
        totalPrice: finalPrice,
        currency: body.currency,
        discountApplied: discountPct,
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/booking/verify/${booking.qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    try {
      await sendTravelBookingEmail({
        to: cardholder.email,
        nome: cardholder.nome,
        bookingType: "flight",
        origin: body.origin,
        destination: body.destination,
        departureDate: body.departureDate,
        returnDate: body.returnDate,
        airline: body.airline,
        flightNumbers: body.flightNumbers,
        adults: body.adults,
        totalPrice: formatFlightPrice(finalPrice, body.currency),
        discountApplied: discountPct > 0 ? String(discountPct) : undefined,
        cardLevel,
        qrCodeUrl: qrDataUrl,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        manageUrl: `${siteUrl}/dashboard/travel/bookings`,
      });
    } catch (emailErr) {
      console.error("[flight-book] email error:", emailErr);
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
    console.error("[flight-book] error:", err);
    return NextResponse.json(
      { error: "Errore durante la prenotazione. Riprova." },
      { status: 500 }
    );
  }
}
