"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Rate = {
  bookHash: string;
  roomName: string;
  boardType: string;
  price: number;
  currency: string;
  cancellationPolicy: string;
  availableRooms: number;
};

type Hotel = {
  id: string;
  name: string;
  starRating: number;
  address: string;
  city: string;
  images: string[];
  minPrice: number;
  currency: string;
  reviewScore?: number;
  reviewCount?: number;
};

type HotelDetail = {
  hotel: Hotel;
  rates: Rate[];
};

const TIER_DISCOUNT: Record<string, number> = {
  WHITE: 5,
  GOLD: 10,
  PLATINUM: 15,
};

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const BOARD_LABELS: Record<string, string> = {
  room_only: "Solo pernottamento",
  breakfast: "Colazione inclusa",
  half_board: "Mezza pensione",
  full_board: "Pensione completa",
  all_inclusive: "All inclusive",
};

export default function HotelDetailPage() {
  return (
    <Suspense fallback={null}>
      <HotelDetailContent />
    </Suspense>
  );
}

function HotelDetailContent() {
  const params = useParams();
  const sp = useSearchParams();
  const router = useRouter();

  const hotelId = params.hotelId as string;
  const checkin = sp.get("checkin") ?? "";
  const checkout = sp.get("checkout") ?? "";
  const adults = parseInt(sp.get("adults") ?? "2", 10);

  const [detail, setDetail] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingRate, setBookingRate] = useState<Rate | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // We read cardLevel from a cookie or just use the lowest for display — real discount applied server-side
  // For client-side display we can't read card level easily; show base price and note discount on checkout
  const displayDiscount = 0; // discount shown server-side in confirmation

  useEffect(() => {
    if (!hotelId || !checkin || !checkout) return;
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, checkin, checkout, adults]);

  async function fetchRates() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ hotelId, checkin, checkout, adults: String(adults) });
      const res = await fetch(`/api/travel/hotels?${qs}`);
      if (!res.ok) throw new Error("Errore caricamento tariffe");
      setDetail(await res.json());
    } catch {
      setError("Impossibile caricare le tariffe. Torna indietro e riprova.");
    } finally {
      setLoading(false);
    }
  }

  function handleBook(rate: Rate) {
    if (!detail) return;
    startTransition(async () => {
      setBookingError(null);
      try {
        const res = await fetch("/api/travel/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotelId: detail.hotel.id,
            hotelName: detail.hotel.name,
            city: detail.hotel.city,
            checkin,
            checkout,
            adults,
            bookHash: rate.bookHash,
            roomName: rate.roomName,
            boardType: rate.boardType,
            basePrice: rate.price,
            currency: rate.currency,
          }),
        });
        const data = await res.json() as {
          bookingRef?: string;
          finalPrice?: number;
          currency?: string;
          discountApplied?: number;
          error?: string;
        };
        if (!res.ok) {
          setBookingError(data.error ?? "Errore durante la prenotazione");
        } else {
          setBookingSuccess(
            `Prenotazione confermata! Ref: ${data.bookingRef}. Riceverai la conferma via email con QR code.${data.discountApplied ? ` Sconto card -${data.discountApplied}% applicato.` : ""}`
          );
          setBookingRate(null);
        }
      } catch {
        setBookingError("Errore di rete. Riprova.");
      }
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8 text-center text-sm text-gray-500">
        Caricamento tariffe…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Link href="/dashboard/travel" className="text-sm text-orange-600 hover:underline">
          ← Torna alla ricerca
        </Link>
      </div>
    );
  }

  if (!detail) return null;

  const { hotel, rates } = detail;
  const thumb = hotel.images[0] ?? "https://placehold.co/800x400/e2e8f0/64748b?text=Hotel";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Back link */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-orange-600 hover:underline"
        >
          ← Torna ai risultati
        </button>
      </div>

      {/* Hotel hero */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt={hotel.name} className="w-full h-56 object-cover rounded-xl mb-4" />

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-amber-500 font-semibold">
              {"★".repeat(Math.min(hotel.starRating, 5))}
            </p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{hotel.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              📍 {hotel.address}, {hotel.city}
            </p>
          </div>
          {hotel.reviewScore && (
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold text-blue-600">{hotel.reviewScore.toFixed(1)}</p>
              <p className="text-xs text-gray-400">
                {hotel.reviewCount?.toLocaleString("it-IT")} rec.
              </p>
            </div>
          )}
        </div>

        {/* Stay summary */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
          <span>📅 Check-in: <strong>{checkin}</strong></span>
          <span>📅 Check-out: <strong>{checkout}</strong></span>
          <span>👥 <strong>{adults}</strong> {adults === 1 ? "adulto" : "adulti"}</span>
        </div>
      </div>

      {/* Booking success */}
      {bookingSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 mb-6">
          <p className="text-green-800 font-semibold text-sm">✅ {bookingSuccess}</p>
          <Link
            href="/dashboard/travel/bookings"
            className="mt-3 inline-block text-sm text-orange-600 hover:underline"
          >
            Vai alle mie prenotazioni →
          </Link>
        </div>
      )}

      {bookingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4 text-sm text-red-700">
          ⚠️ {bookingError}
        </div>
      )}

      {/* Rates */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Tariffe disponibili</h2>

      {rates.length === 0 && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            Nessuna tariffa disponibile per le date selezionate.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {rates.map((rate) => (
          <div
            key={rate.bookHash}
            className={`rounded-xl border p-4 bg-white shadow-sm transition-all ${bookingRate?.bookHash === rate.bookHash ? "ring-2 ring-orange-400" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{rate.roomName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {BOARD_LABELS[rate.boardType] ?? rate.boardType}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{rate.cancellationPolicy}</p>
                {rate.availableRooms <= 3 && (
                  <p className="text-xs text-red-600 font-medium mt-0.5">
                    Solo {rate.availableRooms} {rate.availableRooms === 1 ? "camera" : "camere"} disponibili
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(rate.price, rate.currency)}
                </p>
                <p className="text-xs text-gray-400">/ notte</p>
                <p className="text-xs text-orange-600 font-medium mt-1">
                  + sconto card in checkout
                </p>
              </div>
            </div>

            {bookingRate?.bookHash === rate.bookHash ? (
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => handleBook(rate)}
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Prenotando…" : "Conferma prenotazione"}
                </button>
                <button
                  onClick={() => setBookingRate(null)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setBookingRate(rate)}
                  className="rounded-lg border border-orange-600 px-4 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Seleziona →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
