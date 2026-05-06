"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

type HotelBooking = {
  id: string;
  bookingRef: string;
  hotelName: string;
  city: string;
  checkin: string;
  checkout: string;
  adults: number;
  roomName: string;
  totalPrice: number;
  currency: string;
  discountApplied: number;
  status: "CONFIRMED" | "CANCELLED";
  bookedAt: string;
};

type FlightBooking = {
  id: string;
  bookingRef: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
  flightNumbers: string;
  adults: number;
  totalPrice: number;
  currency: string;
  discountApplied: number;
  status: "CONFIRMED" | "CANCELLED";
  bookedAt: string;
};

type BookingsData = {
  hotels: HotelBooking[];
  flights: FlightBooking[];
};

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BookingsPage() {
  const [data, setData] = useState<BookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/travel/bookings");
      if (!res.ok) throw new Error("Errore caricamento prenotazioni");
      setData(await res.json());
    } catch {
      setError("Impossibile caricare le prenotazioni.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel(bookingId: string, bookingType: "hotel" | "flight") {
    if (!confirm("Sei sicuro di voler cancellare questa prenotazione?")) return;
    setCancellingId(bookingId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/travel/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, bookingType }),
        });
        if (!res.ok) {
          const d = await res.json() as { error?: string };
          alert(d.error ?? "Errore cancellazione");
        } else {
          await fetchBookings();
        }
      } finally {
        setCancellingId(null);
      }
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-gray-500">
        Caricamento prenotazioni…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const hotels = data?.hotels ?? [];
  const flights = data?.flights ?? [];
  const isEmpty = hotels.length === 0 && flights.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Le mie prenotazioni</h1>
        <Link href="/dashboard/travel" className="text-sm text-orange-600 hover:underline">
          ← Ricerca
        </Link>
      </div>

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-3xl mb-3">🧳</p>
          <p className="text-sm text-gray-500">
            Nessuna prenotazione ancora. Cerca un hotel o un volo per iniziare.
          </p>
          <Link
            href="/dashboard/travel"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Esplora viaggi
          </Link>
        </div>
      )}

      {/* Hotel bookings */}
      {hotels.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">🏨 Hotel</h2>
          <div className="space-y-3">
            {hotels.map((b) => (
              <div
                key={b.id}
                className={`rounded-xl border p-4 bg-white shadow-sm ${b.status === "CANCELLED" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{b.hotelName}</span>
                      {b.status === "CANCELLED" && (
                        <span className="rounded-full bg-red-100 text-red-700 text-xs px-2 py-0.5">
                          Cancellata
                        </span>
                      )}
                      {b.status === "CONFIRMED" && (
                        <span className="rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5">
                          Confermata
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{b.city}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {b.checkin} → {b.checkout} · {b.adults} {b.adults === 1 ? "adulto" : "adulti"} · {b.roomName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Prenotato il {formatDate(b.bookedAt)} · Ref {b.bookingRef ?? b.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {formatPrice(b.totalPrice, b.currency)}
                    </p>
                    {b.discountApplied > 0 && (
                      <p className="text-xs text-green-600">-{b.discountApplied}% card</p>
                    )}
                  </div>
                </div>
                {b.status === "CONFIRMED" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCancel(b.id, "hotel")}
                      disabled={cancellingId === b.id || isPending}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {cancellingId === b.id ? "Cancellando…" : "Cancella prenotazione"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flight bookings */}
      {flights.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">✈️ Voli</h2>
          <div className="space-y-3">
            {flights.map((b) => (
              <div
                key={b.id}
                className={`rounded-xl border p-4 bg-white shadow-sm ${b.status === "CANCELLED" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {b.origin} → {b.destination}
                      </span>
                      {b.status === "CANCELLED" && (
                        <span className="rounded-full bg-red-100 text-red-700 text-xs px-2 py-0.5">
                          Cancellato
                        </span>
                      )}
                      {b.status === "CONFIRMED" && (
                        <span className="rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5">
                          Confermato
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {b.departureDate}
                      {b.returnDate ? ` → ritorno ${b.returnDate}` : " (solo andata)"}
                      {" · "}
                      {b.airline} {b.flightNumbers}
                      {" · "}
                      {b.adults} {b.adults === 1 ? "passeggero" : "passeggeri"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Prenotato il {formatDate(b.bookedAt)} · Ref {b.bookingRef ?? b.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {formatPrice(b.totalPrice, b.currency)}
                    </p>
                    {b.discountApplied > 0 && (
                      <p className="text-xs text-green-600">-{b.discountApplied}% card</p>
                    )}
                  </div>
                </div>
                {b.status === "CONFIRMED" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCancel(b.id, "flight")}
                      disabled={cancellingId === b.id || isPending}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {cancellingId === b.id ? "Cancellando…" : "Cancella prenotazione"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
