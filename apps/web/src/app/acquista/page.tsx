"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type CardLevel = "WHITE" | "GOLD" | "PLATINUM";
type Country = "IT" | "GB" | "CH";

interface Pricing {
  cardLevel: CardLevel;
  priceAmount: number;
  currency: string;
}

const COUNTRY_OPTIONS: { value: Country; label: string; flag: string; currency: string }[] = [
  { value: "IT", label: "Italia", flag: "🇮🇹", currency: "EUR" },
  { value: "GB", label: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { value: "CH", label: "Svizzera / Switzerland", flag: "🇨🇭", currency: "CHF" },
];

const CARD_LABELS: Record<CardLevel, { name: string; tagline: string; benefits: string[] }> = {
  WHITE: {
    name: "WHITE",
    tagline: "Inizia a risparmiare",
    benefits: ["Travel Advantage (fino -80%)", "Coupon partner esclusivi"],
  },
  GOLD: {
    name: "GOLD",
    tagline: "Il più popolare",
    benefits: ["Travel Advantage (fino -80%)", "Coupon partner esclusivi", "Tutela Legale 24/7"],
  },
  PLATINUM: {
    name: "PLATINUM",
    tagline: "Massima protezione",
    benefits: [
      "Travel Advantage (fino -80%)",
      "Coupon partner esclusivi",
      "Tutela Legale 24/7",
      "Soccorso Stradale 24/7",
    ],
  },
};

function formatPrice(amount: number, currency: string, country: Country): string {
  const localeMap: Record<Country, string> = { IT: "it-IT", GB: "en-GB", CH: "de-CH" };
  return new Intl.NumberFormat(localeMap[country], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export default function AcquistaPage() {
  return (
    <Suspense fallback={null}>
      <AcquistaContent />
    </Suspense>
  );
}

function AcquistaContent() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "true";

  const [country, setCountry] = useState<Country>("IT");
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<CardLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect country from browser locale as default
    const lang = navigator.language;
    if (lang.startsWith("en-GB") || lang === "en-gb") setCountry("GB");
    else if (lang.startsWith("de-CH") || lang.startsWith("fr-CH") || lang.startsWith("it-CH")) setCountry("CH");
    else setCountry("IT");
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/pricing?country=${country}`)
      .then((r) => r.json())
      .then((data) => setPricing(data.pricing ?? []))
      .catch(() => setError("Errore nel caricamento dei prezzi"))
      .finally(() => setLoading(false));
  }, [country]);

  async function handleCheckout(cardLevel: CardLevel) {
    setCheckoutLoading(cardLevel);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardLevel, country }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Errore durante il checkout");
      }
    } catch {
      setError("Errore di rete — riprova");
    } finally {
      setCheckoutLoading(null);
    }
  }

  const selectedCountryOption = COUNTRY_OPTIONS.find((o) => o.value === country)!;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-4xl font-bold text-orange-600">Scegli la tua Card</h1>
        <p className="mt-2 text-center text-gray-500">
          Accedi a vantaggi esclusivi — Travel, Coupon, Protezione legale e molto altro.
        </p>

        {/* Country selector */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm text-gray-500">Paese:</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as Country)}
              className="rounded-lg border-0 bg-transparent text-sm font-medium text-gray-800 focus:outline-none"
            >
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.flag} {opt.label} ({opt.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {cancelled && (
          <div className="mt-4 rounded-lg bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-700">
            Checkout annullato — puoi riprovare quando vuoi.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(["WHITE", "GOLD", "PLATINUM"] as CardLevel[]).map((level) => {
            const info = CARD_LABELS[level];
            const priceData = pricing.find((p) => p.cardLevel === level);
            const isPopular = level === "GOLD";

            return (
              <div
                key={level}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                  isPopular ? "border-orange-400 ring-2 ring-orange-300" : "border-gray-200"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    Più popolare
                  </span>
                )}
                <h2 className="text-lg font-bold text-gray-900">{info.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{info.tagline}</p>

                <div className="mt-4 text-3xl font-extrabold text-orange-600">
                  {loading ? (
                    <span className="text-lg text-gray-400">…</span>
                  ) : priceData ? (
                    formatPrice(priceData.priceAmount, priceData.currency, country)
                  ) : (
                    <span className="text-lg text-gray-400">N/D</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  IVA inclusa · {selectedCountryOption.flag} {selectedCountryOption.label}
                </p>

                <ul className="mt-4 space-y-2 flex-1">
                  {info.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 text-orange-500">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(level)}
                  disabled={!priceData || checkoutLoading !== null}
                  className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${
                    isPopular
                      ? "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                  }`}
                >
                  {checkoutLoading === level ? "Reindirizzamento…" : "Acquista ora"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Pagamento sicuro con Stripe · Nessun abbonamento · IVA applicata in base al paese
        </p>
      </div>
    </main>
  );
}
