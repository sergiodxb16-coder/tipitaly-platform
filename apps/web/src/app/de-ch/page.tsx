import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TipItaly Card — Exklusive Vorteile für die Schweiz",
  description: "Reiserabatte bis -80%, Partner-Coupons, Rechtsschutz und Pannenhilfe. Bezahlen Sie in CHF.",
  alternates: {
    languages: {
      "it": "/",
      "en-GB": "/en-gb",
      "de-CH": "/de-ch",
      "fr-CH": "/fr-ch",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "TipItaly Card — Schweiz",
    description: "Ihre Vorteilskarte — exklusive Vorteile, Bezahlung in CHF.",
    locale: "de_CH",
    alternateLocale: ["fr_CH"],
    type: "website",
  },
};

const VORTEILE = [
  {
    icon: "✈️",
    titel: "Travel Advantage",
    beschreibung: "Bis zu 80% Rabatt auf ausgewählte Hotels und Aufenthalte in Italien und Europa.",
  },
  {
    icon: "🎟️",
    titel: "Exklusive Coupons",
    beschreibung: "Rabatte bei ausgewählten Partner-Restaurants, Spas und Geschäften.",
  },
  {
    icon: "⚖️",
    titel: "Rechtsschutz 24/7",
    beschreibung: "Zugang zu Rechtsberatung — GOLD- und PLATINUM-Karte.",
  },
  {
    icon: "🚗",
    titel: "Pannenhilfe 24/7",
    beschreibung: "Pannenhilfe in Italien und Europa — PLATINUM-Karte.",
  },
];

export default function DeChLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center">
        <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          🇨🇭 Verfügbar in der Schweiz
        </span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-gray-900">
          Ihre Karte für <span className="text-orange-500">exklusive Vorteile</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Reiserabatte, Partner-Coupons, Rechtsschutz und Pannenhilfe — alles in einer Karte.
          Bezahlen Sie sicher in <strong>CHF</strong>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/acquista?country=CH"
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600"
          >
            Karte kaufen →
          </Link>
          <Link
            href="/fr-ch"
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Français →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">Ihre Vorteile</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {VORTEILE.map((v) => (
            <div key={v.titel} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{v.icon}</div>
              <h3 className="mt-3 font-semibold text-gray-900">{v.titel}</h3>
              <p className="mt-1 text-sm text-gray-600">{v.beschreibung}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
        Alle Preise inkl. Schweizer MWST (8,1%). Sichere Zahlung via Stripe. Kein Abonnement.
      </div>
    </main>
  );
}
