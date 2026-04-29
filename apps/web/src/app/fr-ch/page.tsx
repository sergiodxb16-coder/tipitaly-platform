import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TipItaly Card — Avantages exclusifs pour la Suisse",
  description: "Réductions voyages jusqu'à -80%, coupons partenaires, protection juridique et assistance routière. Paiement en CHF.",
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
    title: "TipItaly Card — Suisse",
    description: "Votre carte d'avantages — paiement en CHF.",
    locale: "fr_CH",
    alternateLocale: ["de_CH"],
    type: "website",
  },
};

const AVANTAGES = [
  {
    icon: "✈️",
    titre: "Travel Advantage",
    description: "Jusqu'à 80% de réduction sur des hôtels et séjours sélectionnés en Italie et en Europe.",
  },
  {
    icon: "🎟️",
    titre: "Coupons exclusifs",
    description: "Réductions chez nos partenaires restaurants, spas et boutiques.",
  },
  {
    icon: "⚖️",
    titre: "Protection juridique 24/7",
    description: "Accès à des conseils juridiques — cartes GOLD et PLATINUM.",
  },
  {
    icon: "🚗",
    titre: "Assistance routière 24/7",
    description: "Assistance en cas de panne en Italie et en Europe — carte PLATINUM.",
  },
];

export default function FrChLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center">
        <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          🇨🇭 Disponible en Suisse
        </span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-gray-900">
          Votre carte pour des <span className="text-orange-500">avantages exclusifs</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Réductions voyages, coupons partenaires, protection juridique et assistance routière — tout en une carte.
          Paiement sécurisé en <strong>CHF</strong>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/acquista?country=CH"
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600"
          >
            Acheter ma carte →
          </Link>
          <Link
            href="/de-ch"
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Deutsch →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">Vos avantages</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {AVANTAGES.map((a) => (
            <div key={a.titre} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{a.icon}</div>
              <h3 className="mt-3 font-semibold text-gray-900">{a.titre}</h3>
              <p className="mt-1 text-sm text-gray-600">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
        Tous les prix incluent la TVA suisse (8,1%). Paiement sécurisé via Stripe. Sans abonnement.
      </div>
    </main>
  );
}
