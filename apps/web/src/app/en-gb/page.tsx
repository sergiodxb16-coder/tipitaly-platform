import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TipItaly Card — Exclusive Benefits for UK Members",
  description: "Access exclusive travel discounts, partner coupons, legal protection and roadside assistance. Pay in GBP.",
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
    title: "TipItaly Card — UK",
    description: "Exclusive benefits card for UK members. Pay in GBP.",
    locale: "en_GB",
    type: "website",
  },
};

const BENEFITS = [
  {
    icon: "✈️",
    title: "Travel Advantage",
    body: "Up to 80% off on selected hotels and stays across Italy and Europe.",
  },
  {
    icon: "🎟️",
    title: "Exclusive Coupons",
    body: "Discounts from our curated network of partner restaurants, spas, and shops.",
  },
  {
    icon: "⚖️",
    title: "24/7 Legal Protection",
    body: "Access to legal advice and assistance whenever you need it — GOLD and PLATINUM cards.",
  },
  {
    icon: "🚗",
    title: "Roadside Assistance",
    body: "24/7 breakdown cover across Italy and Europe — PLATINUM card.",
  },
];

export default function EnGbLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center">
        <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          🇬🇧 Available in the United Kingdom
        </span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-gray-900">
          Your card for <span className="text-orange-500">exclusive benefits</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Travel discounts, partner coupons, legal cover and roadside assistance — all in one card.
          Pay securely in <strong>GBP</strong>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/acquista?country=GB"
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600"
          >
            Buy your card →
          </Link>
          <Link
            href="#benefits"
            className="rounded-xl border border-orange-300 px-6 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">What you get</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-3 font-semibold text-gray-900">{b.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VAT notice */}
      <div className="bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
        All prices include UK VAT (20%). Secure payment via Stripe. No subscription.
      </div>
    </main>
  );
}
