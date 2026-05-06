import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cardholder = await prisma.cardholder.findUnique({
      where: { supabaseUid: user.id },
    });
    if (!cardholder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [hotels, flights] = await Promise.all([
      prisma.hotelBooking.findMany({
        where: { cardholderId: cardholder.id },
        orderBy: { bookedAt: "desc" },
      }),
      prisma.flightBooking.findMany({
        where: { cardholderId: cardholder.id },
        orderBy: { bookedAt: "desc" },
      }),
    ]);

    const mapHotel = (b: typeof hotels[number]) => ({
      id: b.id,
      bookingRef: b.id.slice(0, 8).toUpperCase(),
      hotelName: b.hotelName,
      city: b.city,
      checkin: b.checkin,
      checkout: b.checkout,
      adults: b.adults,
      roomName: b.roomName,
      totalPrice: Number(b.totalPrice),
      currency: b.currency,
      discountApplied: Number(b.discountApplied),
      status: b.status,
      bookedAt: b.bookedAt.toISOString(),
    });

    const mapFlight = (b: typeof flights[number]) => ({
      id: b.id,
      bookingRef: b.id.slice(0, 8).toUpperCase(),
      origin: b.origin,
      destination: b.destination,
      departureDate: b.departureDate,
      returnDate: b.returnDate ?? undefined,
      airline: b.airline,
      flightNumbers: b.flightNumbers,
      adults: b.adults,
      totalPrice: Number(b.totalPrice),
      currency: b.currency,
      discountApplied: Number(b.discountApplied),
      status: b.status,
      bookedAt: b.bookedAt.toISOString(),
    });

    return NextResponse.json({
      hotels: hotels.map(mapHotel),
      flights: flights.map(mapFlight),
    });
  } catch (err) {
    console.error("[travel-bookings] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
