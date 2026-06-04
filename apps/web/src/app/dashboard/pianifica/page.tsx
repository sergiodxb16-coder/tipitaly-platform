"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

/* ─── Città di partenza suggerite ─────────────────────────────── */
const CITTA_PARTENZA = [
  "Milano", "Roma", "Torino", "Bologna", "Firenze",
  "Venezia", "Verona", "Trieste", "Pordenone", "Udine",
  "Padova", "Treviso", "Brescia", "Bergamo", "Genova",
  "Napoli", "Bari", "Palermo", "Catania", "Cagliari",
];

/* ─── Destinazioni rapide ─────────────────────────────────────── */
const QUICK_DEST = [
  { label: "Venezia",  emoji: "🚤" },
  { label: "Roma",     emoji: "🏛️" },
  { label: "Toscana",  emoji: "🍷" },
  { label: "Amalfi",   emoji: "🌊" },
  { label: "Sardegna", emoji: "🏖️" },
  { label: "Sicilia",  emoji: "🌋" },
  { label: "Dolomiti", emoji: "⛰️" },
  { label: "Puglia",   emoji: "🫒" },
];

/* ─── Chi viaggia ─────────────────────────────────────────────── */
const CHI_VIAGGIA = [
  { id: "solo",     label: "Solo/a",   emoji: "🧍" },
  { id: "coppia",   label: "Coppia",   emoji: "👫" },
  { id: "famiglia", label: "Famiglia", emoji: "👨‍👩‍👧‍👦" },
  { id: "amici",    label: "Amici",    emoji: "👥" },
];

/* ─── Offerte TipItaly per destinazione ──────────────────────── */
const OFFERS: Record<string, { emoji: string; title: string; subtitle: string; price: number; discount: number }[]> = {
  venezia: [
    { emoji: "🕯️", title: "Cena al Palazzo Dandolo",  subtitle: "Menu degustazione 7 portate + gondola privata", price: 380, discount: 40 },
    { emoji: "🏛️", title: "Tour privato dei Musei",    subtitle: "Gallerie dell'Accademia + Palazzo Ducale",      price: 120, discount: 30 },
  ],
  roma: [
    { emoji: "🏛️", title: "Hotel de Russie",           subtitle: "5★ · Via del Babuino · Giardino segreto",       price: 560, discount: 40 },
    { emoji: "🍝", title: "Cena privata a Villa Borghese", subtitle: "Chef stellato · Solo 10 ospiti",            price: 290, discount: 35 },
  ],
  toscana: [
    { emoji: "🍷", title: "Borgo San Felice",           subtitle: "Relais & Châteaux · Cantina privata nel Chianti", price: 420, discount: 40 },
    { emoji: "♨️", title: "Terme di Saturnia",          subtitle: "Sorgenti naturali a 37°C · Fango terapeutico",  price: 380, discount: 40 },
  ],
  amalfi: [
    { emoji: "🌊", title: "Monastero Santa Rosa",       subtitle: "Hotel & Spa · Ex convento del 1600 sulla scogliera", price: 640, discount: 40 },
    { emoji: "⛵", title: "Tour in barca privata",       subtitle: "Costiera Amalfitana + grotta smeraldo + aperitivo", price: 320, discount: 30 },
  ],
  sardegna: [
    { emoji: "🏖️", title: "Mezzatorre Resort & Spa",   subtitle: "5★ · Spiaggia privata · Porto Cervo",           price: 480, discount: 40 },
    { emoji: "🌅", title: "Is Morus Relais",             subtitle: "Boutique sul Golfo · Architettura sarda autentica", price: 310, discount: 36 },
  ],
  sicilia: [
    { emoji: "🏛️", title: "Cena in Villa del Settecento", subtitle: "Palazzo barocco · Chef stellato · Solo 8 ospiti", price: 290, discount: 40 },
    { emoji: "🌋", title: "Tour Etna privato",           subtitle: "Jeep 4x4 + degustazione vini Etna DOC",        price: 180, discount: 25 },
  ],
  dolomiti: [
    { emoji: "⛰️", title: "Rosa Alpina Hotel & Spa",    subtitle: "San Cassiano · Ristorante St. Hubertus · UNESCO", price: 510, discount: 40 },
    { emoji: "🎿", title: "Sci + wellness package",      subtitle: "Skipass 3 giorni + spa illimitata",             price: 420, discount: 30 },
  ],
  puglia: [
    { emoji: "🏛️", title: "Borgo Egnazia",              subtitle: "Masseria di lusso · Golf & Spa · Fasano",       price: 680, discount: 35 },
    { emoji: "🫒", title: "Esperienza masseria",          subtitle: "Cucina pugliese + oliveto + cantina",           price: 160, discount: 30 },
  ],
};

function getOffers(dest: string) {
  const key = dest.toLowerCase().trim();
  for (const [k, v] of Object.entries(OFFERS)) {
    if (key.includes(k)) return v;
  }
  return [];
}

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
  const items = [
    { id: "home",    label: "Home",      emoji: "🏠", href: "/dashboard" },
    { id: "esplora", label: "Esplora",   emoji: "🔍", href: "/dashboard/esplora" },
    { id: "wallet",  label: "Wallet",    emoji: "🎟️", href: "/dashboard/wallet" },
    { id: "tipa",    label: "Concierge", emoji: "✨", href: "/dashboard/tipa" },
    { id: "profilo", label: "Profilo",   emoji: "👤", href: "/profilo" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#0C0A09]/95 backdrop-blur-md px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link key={item.id} href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-gray-600 hover:text-gray-400"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ─── Componente principale ───────────────────────────────────── */
export default function PianificaPage() {
  const [dest, setDest]               = useState("");
  const [partenza, setPartenza]       = useState("");
  const [partenzaInput, setPartenzaInput] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [checkin, setCheckin]         = useState("");
  const [checkout, setCheckout]       = useState("");
  const [persone, setPersone]         = useState(2);
  const [gruppo, setGruppo]           = useState("coppia");
  const [note, setNote]               = useState("");
  const [itinerary, setItinerary]     = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const abortRef = useRef<AbortController | null>(null);

  /* Carica/salva città di partenza da localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tipitaly_citta_partenza");
      if (saved) { setPartenza(saved); setPartenzaInput(saved); }
    } catch { /* noop */ }
  }, []);

  function savePartenza(city: string) {
    setPartenza(city);
    setPartenzaInput(city);
    setShowSuggest(false);
    try { localStorage.setItem("tipitaly_citta_partenza", city); } catch { /* noop */ }
  }

  const cittaSuggerite = partenzaInput.length >= 2
    ? CITTA_PARTENZA.filter((c) => c.toLowerCase().startsWith(partenzaInput.toLowerCase())).slice(0, 5)
    : [];

  const todayStr = new Date().toISOString().split("T")[0];

  const generate = useCallback(async () => {
    const destClean = dest.trim();
    if (!destClean || !checkin || !checkout) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setItinerary("");
    setError("");

    const gruppoLabel = CHI_VIAGGIA.find((c) => c.id === gruppo)?.label ?? gruppo;

    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinazione: destClean,
          cittaPartenza: partenza.trim() || undefined,
          checkin,
          checkout,
          persone,
          gruppo: gruppoLabel,
          note: note.trim(),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(`Errore ${res.status}${txt ? ": " + txt : ""}`);
        return;
      }
      if (!res.body) { setError("Nessuna risposta dal server."); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setItinerary(acc);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Connessione interrotta. Riprova.");
    } finally {
      setLoading(false);
    }
  }, [dest, checkin, checkout, persone, gruppo, note]);

  const offers = getOffers(dest);
  const gruppoLabel = CHI_VIAGGIA.find((c) => c.id === gruppo)?.label ?? "";

  const sofiaUrl = dest
    ? `/dashboard/tipa?dest=${encodeURIComponent(dest)}&checkin=${checkin}&checkout=${checkout}&pax=${persone}&gruppo=${encodeURIComponent(gruppoLabel)}`
    : "/dashboard/tipa";

  const canGenerate = dest.trim().length > 0 && checkin && checkout && !loading;

  return (
    <div className="flex flex-col min-h-screen bg-[#0C0A09] text-gray-100 pb-24">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[#0C0A09]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/esplora" className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-bold text-white">Pianifica il viaggio</h1>
            <p className="text-[11px] text-gray-500">Itinerario personalizzato da Sofia</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 space-y-6">

        {/* ── 1. Destinazione ── */}
        <section>
          <p className="mb-2.5 text-[11px] text-gray-500 font-medium uppercase tracking-wider">Destinazione</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {QUICK_DEST.map((d) => (
              <button
                key={d.label}
                onClick={() => setDest(d.label)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                  dest === d.label
                    ? "border-orange-500 bg-orange-600/20 text-orange-400"
                    : "border-white/10 bg-[#1A1714] text-gray-400 hover:border-orange-600/30"
                }`}
              >
                <span>{d.emoji}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="…o scrivi una città (es. Capri, Lago di Garda)"
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#1A1714] px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-orange-600/60"
          />
        </section>

        {/* ── 2. Città di partenza ── */}
        <section className="relative">
          <p className="mb-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
            Da dove parti?
          </p>
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1A1714] px-4 py-2.5 focus-within:border-orange-600/60">
              <span className="text-base">✈️</span>
              <input
                type="text"
                value={partenzaInput}
                onChange={(e) => {
                  setPartenzaInput(e.target.value);
                  setPartenza(e.target.value);
                  setShowSuggest(true);
                  try { localStorage.setItem("tipitaly_citta_partenza", e.target.value); } catch { /* noop */ }
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                placeholder="es. Pordenone, Milano, Torino…"
                className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none"
              />
              {partenza && (
                <button
                  onClick={() => { setPartenza(""); setPartenzaInput(""); try { localStorage.removeItem("tipitaly_citta_partenza"); } catch { /* noop */ } }}
                  className="text-gray-600 hover:text-gray-400 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Suggerimenti autocomplete */}
            {showSuggest && cittaSuggerite.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#1E1B18] shadow-xl overflow-hidden">
                {cittaSuggerite.map((c) => (
                  <button
                    key={c}
                    onMouseDown={() => savePartenza(c)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    ✈️ {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          {partenza && (
            <p className="mt-1.5 text-[11px] text-gray-600">
              Sofia includerà volo o treno da <span className="text-orange-400">{partenza}</span> nell'itinerario
            </p>
          )}
        </section>

        {/* ── 3. Date ── */}
        <section className="grid grid-cols-2 gap-3">

          <div>
            <label className="mb-1.5 block text-[11px] text-gray-500 font-medium uppercase tracking-wider">Arrivo</label>
            <input
              type="date"
              value={checkin}
              min={todayStr}
              onChange={(e) => setCheckin(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1A1714] px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-orange-600/60 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-gray-500 font-medium uppercase tracking-wider">Partenza</label>
            <input
              type="date"
              value={checkout}
              min={checkin || todayStr}
              onChange={(e) => setCheckout(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1A1714] px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-orange-600/60 [color-scheme:dark]"
            />
          </div>
        </section>

        {/* ── 3. Chi viaggia ── */}
        <section>
          <p className="mb-2.5 text-[11px] text-gray-500 font-medium uppercase tracking-wider">Chi viaggia</p>
          <div className="grid grid-cols-4 gap-2">
            {CHI_VIAGGIA.map((c) => (
              <button
                key={c.id}
                onClick={() => setGruppo(c.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition-all ${
                  gruppo === c.id
                    ? "border-orange-500 bg-orange-600/20 text-orange-400"
                    : "border-white/10 bg-[#1A1714] text-gray-400 hover:border-orange-600/30"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Numero persone */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setPersone((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1A1714] text-gray-300 hover:border-orange-600/40 transition-all"
            >
              −
            </button>
            <p className="flex-1 text-center text-sm text-gray-300">
              <span className="font-bold text-white text-base">{persone}</span>
              <span className="text-gray-500 ml-1">{persone === 1 ? "persona" : "persone"}</span>
            </p>
            <button
              onClick={() => setPersone((p) => Math.min(20, p + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1A1714] text-gray-300 hover:border-orange-600/40 transition-all"
            >
              +
            </button>
          </div>
        </section>

        {/* ── 4. Note opzionali ── */}
        <section>
          <p className="mb-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
            Interessi o preferenze <span className="normal-case text-gray-700">(opzionale)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="es. figli di 10 e 14 anni, amiamo il mare e la buona cucina, evitiamo le folle…"
            className="w-full rounded-xl border border-white/10 bg-[#1A1714] px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-orange-600/60 resize-none"
          />
        </section>

        {/* ── CTA genera ── */}
        <button
          onClick={generate}
          disabled={!canGenerate}
          className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-sm font-bold text-white shadow-lg hover:from-orange-700 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Sofia sta preparando l'itinerario…" : "✨ Genera itinerario con Sofia"}
        </button>

        {/* ── Offerte TipItaly partner ── */}
        {dest && offers.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Offerte TipItaly a {dest}</p>
              <span className="text-[10px] text-orange-500 font-semibold">GOLD</span>
            </div>
            <div className="space-y-3">
              {offers.map((o) => (
                <div
                  key={o.title}
                  className="flex items-center gap-3 rounded-2xl bg-[#1A1714] border border-white/5 p-3.5"
                >
                  <span className="text-2xl flex-shrink-0">{o.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight">{o.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{o.subtitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-600 line-through">€{o.price}</p>
                    <p className="text-sm font-bold text-yellow-400">€{Math.round(o.price * (1 - o.discount / 100))}</p>
                    <p className="text-[10px] text-green-500">-{o.discount}%</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Itinerario generato ── */}
        {(itinerary || loading || error) && (
          <section className="rounded-2xl bg-[#1A1714] border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-sm flex-shrink-0">
                👩‍💼
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sofia</p>
                <p className="text-[10px] text-gray-500">
                  {dest ? `Itinerario per ${dest}${gruppoLabel ? ` · ${gruppoLabel}` : ""}` : "Itinerario personale"}
                </p>
              </div>
            </div>

            {loading && !itinerary && (
              <div className="flex items-center gap-1.5 py-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {itinerary && (
              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                {itinerary}
                {loading && (
                  <span className="inline-block w-0.5 h-3.5 bg-orange-400 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Chiedi a Sofia ── */}
        {dest && (
          <Link
            href={sofiaUrl}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#1A1714] px-4 py-3.5 hover:border-orange-600/30 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-base flex-shrink-0">
              👩‍💼
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Chiedi a Sofia</p>
              <p className="text-[11px] text-gray-500 truncate">
                Domande su {dest}? Sofia conosce già il tuo viaggio.
              </p>
            </div>
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
