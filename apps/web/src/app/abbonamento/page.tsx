"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Piani ──────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "silver",
    name: "Silver",
    emoji: "🥈",
    price: 19,
    originalPrice: 29,
    color: "from-gray-400 to-gray-600",
    border: "border-gray-600/40",
    highlight: false,
    benefits: [
      "Sconti 20% su hotel selezionati",
      "Accesso a offerte flash",
      "Coupon partner base",
      "Chat con TIPA",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    emoji: "🥇",
    price: 29,
    originalPrice: 49,
    color: "from-yellow-500 to-orange-600",
    border: "border-orange-600/60",
    highlight: true,
    benefits: [
      "Sconti fino al 40% su tutto",
      "Concierge personale 24/7",
      "Coupon partner esclusivi",
      "Prenotazioni prioritarie",
      "Accesso a esperienze riservate",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    emoji: "💎",
    price: 79,
    originalPrice: 129,
    color: "from-purple-400 to-blue-600",
    border: "border-purple-600/40",
    highlight: false,
    benefits: [
      "Tutto di Gold",
      "Maggiordomo dedicato",
      "Transfer privati inclusi",
      "Accesso lounge aeroporti",
      "Esperienze custom su misura",
    ],
  },
];

export default function AbbonamentoPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("gold");
  const [step, setStep] = useState<"choose" | "confirm" | "success">("choose");
  const [loading, setLoading] = useState(false);

  const plan = PLANS.find((p) => p.id === selected)!;

  async function handleActivate() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep("success");
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  /* ── Successo ── */
  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0C0A09] px-6 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${plan.color} text-4xl shadow-2xl mb-6 animate-bounce`}>
          {plan.emoji}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Card attivata!</h1>
        <p className="text-gray-400 text-sm">
          Benvenuto nel mondo TipItaly {plan.name}.<br />
          Accesso al dashboard in corso…
        </p>
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Conferma ── */
  if (step === "confirm") {
    return (
      <div className="flex flex-col min-h-screen bg-[#0C0A09] text-gray-100">
        <header className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
          <button onClick={() => setStep("choose")} className="text-gray-500 hover:text-gray-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-semibold">Riepilogo ordine</h1>
        </header>

        <main className="flex-1 px-4 py-6 space-y-4">
          {/* Card selezionata */}
          <div className={`rounded-2xl bg-gradient-to-br ${plan.color} p-px`}>
            <div className="rounded-2xl bg-[#1A1714] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{plan.emoji}</span>
                <div>
                  <p className="text-lg font-bold text-white">TipItaly {plan.name}</p>
                  <p className="text-xs text-gray-500">Abbonamento mensile · rinnovo automatico</p>
                </div>
              </div>
              <div className="flex items-end justify-between border-t border-white/5 pt-4">
                <div>
                  <p className="text-xs text-gray-600 line-through">€{plan.originalPrice}/mese</p>
                  <p className="text-2xl font-bold text-white">
                    €{plan.price}
                    <span className="text-sm font-normal text-gray-500">/mese</span>
                  </p>
                </div>
                <span className="rounded-full bg-orange-600/20 px-3 py-1 text-xs text-orange-400 font-medium">
                  Primo mese scontato
                </span>
              </div>
            </div>
          </div>

          {/* Benefici inclusi */}
          <div className="rounded-2xl bg-[#1A1714] border border-white/5 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Incluso nel piano</p>
            <div className="space-y-2.5">
              {plan.benefits.map((b) => (
                <div key={b} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="text-orange-400 mt-0.5 flex-shrink-0">✓</span>
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Metodo pagamento */}
          <div className="rounded-2xl bg-[#1A1714] border border-white/5 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pagamento</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-14 items-center justify-center rounded-xl bg-[#2A2520] text-lg">💳</div>
              <div>
                <p className="text-sm text-white">Carta di credito / debito</p>
                <p className="text-xs text-gray-600">Elaborato in modo sicuro via Stripe</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-700 text-center leading-relaxed px-2">
            Abbonamento mensile. Cancellabile in qualsiasi momento. Dopo il primo mese si rinnova a €{plan.originalPrice}/mese.
          </p>
        </main>

        <div className="px-4 pb-10 pt-3 border-t border-white/5">
          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Attivazione in corso…
              </>
            ) : (
              `Attiva TipItaly ${plan.name} — €${plan.price}/mese`
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Scelta piano ── */
  return (
    <div className="flex flex-col min-h-screen bg-[#0C0A09] text-gray-100">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-base font-semibold">Attiva la tua card</h1>
          <p className="text-[11px] text-gray-500">Scegli il piano più adatto a te</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-3 pb-36">
        {/* Banner offerta */}
        <div className="rounded-2xl bg-orange-600/10 border border-orange-600/20 px-5 py-4 mb-2">
          <p className="text-xs text-orange-400 font-medium mb-1">✨ Offerta di benvenuto</p>
          <p className="text-sm text-white font-medium leading-relaxed">
            Primo mese scontato su tutti i piani. Cancellabile in qualsiasi momento.
          </p>
        </div>

        {/* Piani */}
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`w-full text-left rounded-2xl border p-5 transition-all ${
              selected === p.id
                ? `${p.border} bg-[#1E1B17]`
                : "border-white/5 bg-[#1A1714] hover:border-white/10"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">TipItaly {p.name}</p>
                  {p.highlight && (
                    <span className="text-[10px] text-orange-400 font-medium">⭐ Più scelto</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 line-through">€{p.originalPrice}</p>
                <p className="text-lg font-bold text-white">
                  €{p.price}
                  <span className="text-xs font-normal text-gray-500">/mese</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {p.benefits.slice(0, 3).map((b) => (
                <div key={b} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-orange-400 flex-shrink-0">✓</span>
                  {b}
                </div>
              ))}
              {p.benefits.length > 3 && (
                <p className="text-xs text-gray-600 pl-4">+{p.benefits.length - 3} altri vantaggi</p>
              )}
            </div>

            <div className="flex justify-end">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === p.id ? "border-orange-500 bg-orange-500" : "border-gray-700"
              }`}>
                {selected === p.id && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Garanzie */}
        <div className="flex justify-around pt-3">
          {[
            { emoji: "🔒", label: "Pagamento sicuro" },
            { emoji: "↩️", label: "Cancella sempre" },
            { emoji: "🇮🇹", label: "Made in Italy" },
          ].map((g) => (
            <div key={g.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xl">{g.emoji}</span>
              <p className="text-[10px] text-gray-600">{g.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* CTA fisso */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/95 to-transparent">
        <button
          onClick={() => setStep("confirm")}
          className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
        >
          Continua con {plan.name} — €{plan.price}/mese
        </button>
        <p className="mt-2 text-center text-[10px] text-gray-700">
          Nessun impegno · Cancellabile in qualsiasi momento
        </p>
      </div>
    </div>
  );
}
