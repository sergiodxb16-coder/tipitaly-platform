"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─── Tipi ───────────────────────────────────────────────────── */
interface Item {
  id: string;
  type: "hotel" | "experience" | "restaurant" | "flight";
  title: string;
  subtitle: string;
  location: string;
  emoji: string;
  image: string;
  originalPrice: number;
  goldPrice: number;
  discountPct: number;
  badge?: string;
  tags: string[];
}

/* ─── Categorie ──────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "tutti",      label: "Tutti",      emoji: "✨" },
  { id: "hotel",      label: "Hotel",      emoji: "🏨" },
  { id: "experience", label: "Esperienze", emoji: "🎭" },
  { id: "restaurant", label: "Ristoranti", emoji: "🍽️" },
  { id: "flight",     label: "Voli",       emoji: "✈️" },
];

const DESTINATIONS = [
  "Tutte", "Sardegna", "Sicilia", "Toscana", "Venezia",
  "Roma", "Amalfi", "Dolomiti", "Puglia", "Liguria",
];

/* ─── Catalogo mock ──────────────────────────────────────────── */
const CATALOG: Item[] = [
  {
    id: "1", type: "hotel",
    title: "Villa Certosa",
    subtitle: "Resort 5★ con spa privata e spiaggia esclusiva",
    location: "Porto Cervo, Sardegna", emoji: "🏨",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    originalPrice: 890, goldPrice: 534, discountPct: 40,
    badge: "Top Pick", tags: ["Sardegna", "Lusso", "Spa"],
  },
  {
    id: "2", type: "experience",
    title: "Cena al Tramonto in Barca",
    subtitle: "Aperitivo + cena a bordo nel golfo",
    location: "Portofino, Liguria", emoji: "⛵",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    originalPrice: 280, goldPrice: 196, discountPct: 30,
    tags: ["Liguria", "Mare", "Gastronomia"],
  },
  {
    id: "3", type: "restaurant",
    title: "Osteria Francescana",
    subtitle: "3 stelle Michelin · Massimo Bottura",
    location: "Modena, Emilia-Romagna", emoji: "🍝",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    originalPrice: 340, goldPrice: 238, discountPct: 30,
    badge: "Michelin ⭐⭐⭐", tags: ["Emilia", "Gastronomia", "Lusso"],
  },
  {
    id: "4", type: "hotel",
    title: "Borgo Egnazia",
    subtitle: "Masseria di lusso con golf & spa",
    location: "Fasano, Puglia", emoji: "🏛️",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    originalPrice: 720, goldPrice: 504, discountPct: 30,
    tags: ["Puglia", "Lusso", "Spa"],
  },
  {
    id: "5", type: "flight",
    title: "Milano → Palermo",
    subtitle: "Volo diretto · 1h 50m · ITA Airways",
    location: "Sicilia", emoji: "✈️",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    originalPrice: 189, goldPrice: 113, discountPct: 40,
    badge: "Miglior prezzo", tags: ["Sicilia", "Voli"],
  },
  {
    id: "6", type: "experience",
    title: "Tour Privato Cinque Terre",
    subtitle: "Guida esclusiva + barca privata",
    location: "Cinque Terre, Liguria", emoji: "🚤",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    originalPrice: 450, goldPrice: 315, discountPct: 30,
    tags: ["Liguria", "Mare", "Cultura"],
  },
  {
    id: "7", type: "hotel",
    title: "Belmond Hotel Caruso",
    subtitle: "Vista panoramica sul golfo di Amalfi",
    location: "Ravello, Costiera Amalfitana", emoji: "🌊",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    originalPrice: 1100, goldPrice: 770, discountPct: 30,
    badge: "Esclusivo", tags: ["Amalfi", "Lusso", "Mare"],
  },
  {
    id: "8", type: "restaurant",
    title: "Da Vittorio",
    subtitle: "Cucina bergamasca · 3 stelle Michelin",
    location: "Brusaporto, Bergamo", emoji: "🫕",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
    originalPrice: 290, goldPrice: 203, discountPct: 30,
    tags: ["Lombardia", "Gastronomia", "Lusso"],
  },
  {
    id: "9", type: "experience",
    title: "Degustazione Brunello",
    subtitle: "Cantina storica · Tour + 6 vini + pranzo",
    location: "Montalcino, Toscana", emoji: "🍷",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80",
    originalPrice: 180, goldPrice: 126, discountPct: 30,
    tags: ["Toscana", "Vino", "Gastronomia"],
  },
  {
    id: "10", type: "hotel",
    title: "Hotel Cipriani",
    subtitle: "L'icona di Venezia dal 1958",
    location: "Giudecca, Venezia", emoji: "🛶",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
    originalPrice: 1400, goldPrice: 980, discountPct: 30,
    badge: "Leggendario", tags: ["Venezia", "Lusso", "Cultura"],
  },
  {
    id: "11", type: "flight",
    title: "Roma → Cagliari",
    subtitle: "Volo diretto · 1h 10m · Ryanair",
    location: "Sardegna", emoji: "✈️",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    originalPrice: 89, goldPrice: 53, discountPct: 40,
    tags: ["Sardegna", "Voli"],
  },
  {
    id: "12", type: "experience",
    title: "Sci sulle Dolomiti",
    subtitle: "Skipass 3 giorni + istruttore privato",
    location: "Cortina d'Ampezzo", emoji: "⛷️",
    image: "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=800&q=80",
    originalPrice: 520, goldPrice: 364, discountPct: 30,
    tags: ["Dolomiti", "Montagna", "Sport"],
  },
];

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
  const items = [
    {
      id: "home",
      label: "Home",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "esplora",
      label: "Esplora",
      href: "/dashboard/esplora",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "wallet",
      label: "Wallet",
      href: "/dashboard/wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "tipa",
      label: "Concierge",
      href: "/dashboard/tipa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: "profilo",
      label: "Profilo",
      href: "/profilo",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-sm px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              item.id === "esplora" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ─── Card Hero (prima card, full width) ─────────────────────── */
function HeroCard({ item, onUnlock }: { item: Item; onUnlock: () => void }) {
  return (
    <div
      className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group"
      onClick={onUnlock}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="100vw"
        unoptimized
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {item.badge && (
          <span className="rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-bold text-white shadow">
            {item.badge}
          </span>
        )}
        <span className="rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white border border-white/10">
          -{item.discountPct}% GOLD
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[11px] text-orange-300 font-medium mb-1">{item.location}</p>
        <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.title}</h3>
        <p className="text-xs text-gray-300 mb-3">{item.subtitle}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 line-through mr-2">€{item.originalPrice}</span>
            <span className="text-base font-bold text-orange-400">€{item.goldPrice}</span>
          </div>
          <button className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-orange-500 transition-colors">
            Sblocca →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Card standard (griglia 2 colonne) ──────────────────────── */
function ItemCard({ item, onUnlock }: { item: Item; onUnlock: () => void }) {
  return (
    <div
      className="relative h-52 rounded-2xl overflow-hidden cursor-pointer group"
      onClick={onUnlock}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="50vw"
        unoptimized
      />
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Badge */}
      {item.badge && (
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[9px] font-bold text-white">
            {item.badge}
          </span>
        </div>
      )}
      <div className="absolute top-2 right-2">
        <span className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-semibold text-white border border-white/10">
          -{item.discountPct}%
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-[10px] text-orange-300 font-medium leading-none mb-0.5 truncate">{item.location}</p>
        <h3 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{item.title}</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 line-through">€{item.originalPrice}</span>
            <span className="block text-sm font-bold text-orange-400">€{item.goldPrice}</span>
          </div>
          <button
            className="rounded-lg bg-orange-600/90 px-2.5 py-1.5 text-[10px] font-bold text-white"
            onClick={(e) => { e.stopPropagation(); onUnlock(); }}
          >
            Sblocca
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal attivazione ──────────────────────────────────────── */
function ActivationModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-white border-t border-gray-200 p-6 pb-10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-2xl shadow-lg">
            💳
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Richiede</p>
            <p className="text-base font-bold text-gray-900">TipItaly GOLD Card</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Con la card GOLD accedi a prezzi esclusivi su hotel, esperienze e ristoranti selezionati in tutta Italia — con sconti fino al 40%.
        </p>
        <div className="mb-6 space-y-2.5">
          {["Prezzi GOLD su oltre 500 strutture", "Concierge personale 24/7", "Coupon partner esclusivi", "Prenotazioni prioritarie"].map((b) => (
            <div key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="text-orange-600">✓</span>
              {b}
            </div>
          ))}
        </div>
        <Link
          href="/attivazione"
          className="block w-full rounded-2xl bg-orange-600 py-3.5 text-center text-sm font-semibold text-white shadow-lg hover:bg-orange-700 transition-colors"
        >
          Attiva la card — da €29/mese
        </Link>
        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Non ora
        </button>
      </div>
    </div>
  );
}

/* ─── Pagina principale ──────────────────────────────────────── */
export default function EsploraPage() {
  const [category, setCategory]     = useState("tutti");
  const [destination, setDestination] = useState("Tutte");
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);

  const filtered = CATALOG.filter((item) => {
    const matchCat  = category === "tutti" || item.type === category;
    const matchDest = destination === "Tutte" || item.tags.some((t) => t === destination);
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDest && matchSearch;
  });

  const [hero, ...rest] = filtered;

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F3] text-gray-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-orange-600">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-base font-semibold text-white">Esplora</h1>
            <span className="ml-auto text-xl font-bold italic text-white">TipItaly</span>
            <span className="text-xs text-orange-200">{filtered.length} risultati</span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/20 border border-white/30 px-4 py-2.5 focus-within:bg-white/30 transition-colors">
            <svg className="h-4 w-4 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hotel, esperienze, ristoranti…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/60 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/70 hover:text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categorie */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                category === cat.id
                  ? "bg-white text-orange-600"
                  : "bg-white/20 text-white border border-white/20 hover:bg-white/30"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Destinazioni */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest}
              onClick={() => setDestination(dest)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                destination === dest
                  ? "bg-white/30 text-white border border-white/40"
                  : "text-orange-100 hover:text-white"
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenuto ── */}
      <main className="flex-1 px-4 py-4 pb-28 space-y-3">

        {/* Banner pianifica viaggio */}
        <Link
          href="/dashboard/pianifica"
          className="flex items-center gap-3 rounded-2xl bg-white shadow-sm border border-orange-100 px-4 py-3 hover:border-orange-300 transition-all"
        >
          <span className="text-2xl">🗺️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Pianifica il viaggio</p>
            <p className="text-[11px] text-gray-500">Sofia crea il tuo itinerario personalizzato</p>
          </div>
          <svg className="h-4 w-4 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-sm font-medium text-gray-500">Nessun risultato</p>
            <p className="text-xs text-gray-400 mt-1">Prova a cambiare categoria o destinazione</p>
          </div>
        ) : (
          <>
            {/* Hero card */}
            {hero && <HeroCard item={hero} onUnlock={() => setShowModal(true)} />}

            {/* Griglia 2 colonne */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {rest.map((item) => (
                  <ItemCard key={item.id} item={item} onUnlock={() => setShowModal(true)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />

      {showModal && <ActivationModal onClose={() => setShowModal(false)} />}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
