"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FlightBookPage() {
  return (
    <Suspense fallback={null}>
      <FlightBookContent />
    </Suspense>
  );
}

function FlightBookContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const offerId = sp.get("offerId") ?? "";
  const origin = sp.get("origin") ?? "";
  const destination = sp.get("destination") ?? "";
  const departureDate = sp.get("departureDate") ?? "";
  const returnDate = sp.get("returnDate") ?? undefined;
  const airline = sp.get("airline") ?? "";
  const flightNumbers = sp.get("flightNumbers") ?? "";
  const adults = parseInt(sp.get("adults") ?? "1", 10);
  const basePrice = parseFloat(sp.get("basePrice") ?? "0");
  const currency = sp.get("currency") ?? "EUR";

  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleBook() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/travel/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerId,
            origin,
            destination,
            departureDate,
            returnDate: returnDate || undefined,
            airline,
            flightNumbers,
            adults,
            basePrice,
            currency,
          }),
        });
        const data = await res.json() as {
          bookingRef?: string;
          finalPrice?: number;
          discountApplied?: number;
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "Errore durante la prenotazione");
        } else {
          setBookingRef(data.bookingRef ?? null);
          setFinalPrice(data.finalPrice ?? basePrice);
          setDiscountApplied(data.discountApplied ?? 0);
          setConfirmed(true);
        }
      } catch {
        setError("Errore di rete. Riprova.");
      }
    });
  }

  if (confirmed && bookingRef) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Volo confermato!</h1>
        <p className="text-gray-600 text-sm mb-4">
          Riferimento prenotazione: <strong>{bookingRef}</strong>
        </p>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-left mb-6">
          <p className="text-sm font-semibold text-green-800 mb-2">Dettagli volo</p>
          <p className="text-sm text-gray-700">✈️ {origin} → {destination}</p>
          <p className="text-sm text-gray-700 mt-1">
            {departureDate}
            {returnDate ? ` · Ritorno ${returnDate}` : " (solo andata)"}
          </p>
          <p className="text-sm text-gray-700 mt-1">{airline} · {flightNumbers}</p>
          <p className="text-sm font-bold text-gray-900 mt-2">
            Totale: {formatPrice(finalPrice, currency)}
            {discountApplied > 0 && (
              <span className="text-green-600 font-normal ml-2 text-xs">
                (sconto -{discountApplied}% applicato)
              </span>
            )}
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Riceverai la conferma via email con QR code entro pochi secondi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/travel/bookings"
            className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Le mie prenotazioni
          </Link>
          <Link
            href="/dashboard/travel?tab=flights"
            className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cerca altri voli
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-orange-600 hover:underline">
          ← Torna ai risultati
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conferma prenotazione volo</h1>

      {/* Flight summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Riepilogo volo</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>✈️ Rotta</span>
            <span className="font-semibold">{origin} → {destination}</span>
          </div>
          <div className="flex justify-between">
            <span>📅 Partenza</span>
            <span className="font-semibold">{departureDate}</span>
          </div>
          {returnDate && (
            <div className="flex justify-between">
              <span>↩ Ritorno</span>
              <span className="font-semibold">{returnDate}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>✈ Volo</span>
            <span className="font-semibold">{airline} · {flightNumbers}</span>
          </div>
          <div className="flex justify-between">
            <span>👥 Passeggeri</span>
            <span className="font-semibold">
              {adults} {adults === 1 ? "passeggero" : "passeggeri"}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
            <span className="font-medium">Tariffa base</span>
            <span className="font-semibold">{formatPrice(basePrice, currency)}</span>
          </div>
          <div className="flex justify-between text-orange-600 text-xs">
            <span>Sconto TipItaly Card (applicato al checkout)</span>
            <span>incluso</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-6 text-sm text-blue-700">
        ℹ️ Il tuo sconto TipItaly Card verrà applicato automaticamente. Riceverai un&apos;email di conferma con QR code entro 30 secondi dalla prenotazione.
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={isPending}
        className="w-full rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Prenotando…" : "Conferma e prenota"}
      </button>

      <p className="mt-3 text-xs text-center text-gray-400">
        Cliccando confermi di aver letto i termini della prenotazione. La cancellazione è disponibile nelle tue prenotazioni.
      </p>
    </div>
  );
}
