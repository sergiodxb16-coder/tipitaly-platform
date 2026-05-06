import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cardholder = await prisma.cardholder.findUnique({
      where: { supabaseUid: user.id },
    });
    if (!cardholder) return NextResponse.json({ error: "Cardholder not found" }, { status: 404 });

    const { bookingId, bookingType } = await req.json() as {
      bookingId: string;
      bookingType: "hotel" | "flight";
    };

    if (bookingType === "hotel") {
      const booking = await prisma.hotelBooking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.cardholderId !== cardholder.id) {
        return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
      }
      if (booking.status === "CANCELLED") {
        return NextResponse.json({ error: "Già cancellata" }, { status: 409 });
      }
      await prisma.hotelBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
    } else {
      const booking = await prisma.flightBooking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.cardholderId !== cardholder.id) {
        return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
      }
      if (booking.status === "CANCELLED") {
        return NextResponse.json({ error: "Già cancellata" }, { status: 409 });
      }
      await prisma.flightBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cancel-booking] error:", err);
    return NextResponse.json({ error: "Errore durante la cancellazione." }, { status: 500 });
  }
}
