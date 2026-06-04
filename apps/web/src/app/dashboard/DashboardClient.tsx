"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BedIcon,
  PlaneIcon,
  TrainIcon,
  ForkKnifeIcon,
  SparklesIcon,
  WavesIcon,
} from "@/components/icons";
import { useTranslations } from "next-intl";

/* ─── Tipi ─────────────────────────────────────────────────── */
export interface Suggestion {
  id: string;
  type: "hotel" | "experience" | "restaurant" | "flight";
  title: string;
  subtitle: string;
  location: string;
  emoji: string;
  image?: string;
  reason: string;
  originalPrice: number;
  goldPrice: number;
  discountPct: number;
  spotsLeft?: number;
  badge?: string;
}

export interface FlashDeal extends Suggestion {
  deadlineIso: string;
}

export interface DashboardClientProps {
  nome: string;
  genere: string | null;
  tasteProfile: {
    destinazioni?: string;
    luoghi?: string[] | string;
    esperienze?: string | string[];
    compagnia?: string;
    budget?: string;
  };
  cardActive: boolean;
  cardLevel: string | null;
  suggestions: Suggestion[];
  featured: Suggestion;
  flash: FlashDeal;
}

/* ─── Concierge ─────────────────────────────────────────────── */
function getConcierge(genere: string | null) {
  const isFemale = genere?.toLowerCase() !== "f" && genere?.toLowerCase() !== "donna";
  return isFemale
    ? { name: "Sofia", emoji: "👩‍💼", color: "bg-pink-600" }
    : { name: "Marco", emoji: "👨‍💼", color: "bg-blue-600" };
}

/* ─── Countdown hook ────────────────────────────────────────── */
function useCountdown(deadlineIso: string) {
  const calc = () => {
    const diff = new Date(deadlineIso).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1_000);
    return () => clearInterval(id);
  });
  return t;
}

/* ─── Modal attivazione card ────────────────────────────────── */
function ActivationModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("activation");
  const nav = useTranslations("nav");
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-t-3xl bg-white p-6 pb-10 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
        <div className="mb-5 text-center">
          <span className="text-3xl">💳</span>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{t("title")}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("desc")}</p>
        </div>
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider">{t("planName")}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {t("price")}<span className="text-sm font-normal text-gray-500">{t("perYear")}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 line-through">{t("originalPrice")}</p>
              <p className="text-sm font-semibold text-green-600">{t("savings")}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {([t("benefit1"), t("benefit2"), t("benefit3"), t("benefit4")] as string[]).map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs text-gray-700">
                <span className="text-orange-600">✓</span> {b}
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/attivazione"
          className="block w-full rounded-2xl bg-orange-600 py-4 text-center text-sm font-bold text-white shadow-lg hover:bg-orange-700 transition-colors"
        >
          {t("activateNow")}
        </Link>
        <button onClick={onClose} className="mt-3 block w-full text-center text-xs text-gray-400 hover:text-gray-600">
          {t("maybeLater")}
        </button>
      </div>
      {/* suppress unused var warning */}
      <span className="hidden">{nav("home")}</span>
    </div>
  );
}

/* ─── Card suggerimento ─────────────────────────────────────── */
function SuggestionCard({
  s,
  cardActive,
  onUnlock,
}: {
  s: Suggestion;
  cardActive: boolean;
  onUnlock: () => void;
}) {
  const t = useTranslations("dashboard");
  return (
    <div className="flex-shrink-0 w-64 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-4xl overflow-hidden">
        {s.image ? (
          <Image src={s.image} alt={s.title} fill className="object-cover" sizes="256px" />
        ) : (
          s.emoji
        )}
      </div>
      <div className="p-3.5">
        {s.badge && (
          <span className="mb-1.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
            {s.badge}
          </span>
        )}
        <p className="text-sm font-semibold text-gray-900 leading-tight">{s.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{s.location}</p>
        <p className="mt-2 text-[11px] text-gray-500 italic leading-relaxed line-clamp-2">
          &ldquo;{s.reason}&rdquo;
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 line-through">€{s.originalPrice}</p>
            {cardActive ? (
              <p className="text-base font-bold text-orange-600">€{s.goldPrice}</p>
            ) : (
              <p className="text-base font-bold text-orange-400 flex items-center gap-1">
                🔒 €{s.goldPrice}
                <span className="text-[9px] font-normal text-gray-400">GOLD</span>
              </p>
            )}
          </div>
          <span className="text-[10px] font-semibold text-green-600">-{s.discountPct}%</span>
        </div>
        {!cardActive && (
          <button
            onClick={onUnlock}
            className="mt-2.5 w-full rounded-xl border border-orange-300 bg-orange-50 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition-all"
          >
            {t("unlockWithGold")}
          </button>
        )}
        {cardActive && (
          <button className="mt-2.5 w-full rounded-xl bg-orange-600 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 transition-colors">
            {t("bookNow")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Bottom nav ────────────────────────────────────────────── */
export function BottomNav({ active }: { active: "home" | "esplora" | "wallet" | "tipa" | "profilo" }) {
  const t = useTranslations("nav");
  const items = [
    {
      id: "home",
      label: t("home"),
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "esplora",
      label: t("explore"),
      href: "/dashboard/esplora",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "wallet",
      label: t("wallet"),
      href: "/dashboard/wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "tipa",
      label: t("concierge"),
      href: "/dashboard/tipa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: "profilo",
      label: t("profile"),
      href: "/profilo",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-sm px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              active === item.id ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
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

/* ─── Componente principale ─────────────────────────────────── */
export function DashboardClient({
  nome,
  genere,
  tasteProfile,
  cardActive,
  cardLevel,
  suggestions,
  featured,
  flash,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const concierge = getConcierge(genere);
  const countdown = useCountdown(flash.deadlineIso);

  /* Greeting localizzato */
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return t("greetingMorning");
    if (h < 18) return t("greetingAfternoon");
    return t("greetingEvening");
  }

  /* Categorie localizzate */
  const CATEGORIES = [
    { label: t("catHotel"),       Icon: BedIcon,       href: "/dashboard/esplora?cat=hotel" },
    { label: t("catFlights"),     Icon: PlaneIcon,     href: "/dashboard/esplora?cat=voli" },
    { label: t("catTrains"),      Icon: TrainIcon,     href: "/dashboard/esplora?cat=treni" },
    { label: t("catFood"),        Icon: ForkKnifeIcon, href: "/dashboard/esplora?cat=ristoranti" },
    { label: t("catExperiences"), Icon: SparklesIcon,  href: "/dashboard/esplora?cat=esperienze" },
    { label: t("catWellness"),    Icon: WavesIcon,     href: "/dashboard/esplora?cat=spa" },
  ];

  const dest = tasteProfile.destinazioni ?? (Array.isArray(tasteProfile.luoghi) ? tasteProfile.luoghi.join(", ") : tasteProfile.luoghi) ?? "Italia";
  const compagnia = tasteProfile.compagnia ?? "";

  // Messaggio concierge (rimane in italiano — Sofia parla sempre in italiano sul dashboard)
  const tipaMessage = compagnia.includes("figli") || compagnia.includes("famig")
    ? `Ho trovato 3 resort family-friendly ${dest ? `in ${dest}` : "in Italia"} con camere comunicanti e parco giochi — perfetti per la famiglia. Vuoi che li confronti?`
    : compagnia.includes("coppia") || compagnia.includes("partner")
    ? `C'è ancora un posto per il weekend romantico ${dest ? `in ${dest}` : ""} che avevi nel radar. Ti è rimasto poco tempo prima che si esaurisca.`
    : `Ho selezionato 4 esperienze ${dest ? `in ${dest}` : "in Italia"} basandomi sui tuoi gusti. Tutto pronto per te qui sotto.`;

  function handleUnlock() {
    if (!cardActive) setShowModal(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F3] text-gray-900 pb-20">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-orange-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base shadow`}>
              {concierge.emoji}
            </div>
            <div>
              <p className="text-[11px] text-orange-100">{concierge.name} · {t("yourConcierge")}</p>
              <p className="text-sm font-semibold text-white leading-tight">
                {getGreeting()}, {nome || "benvenuto"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold italic text-white">TipItaly</span>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
              cardActive
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/10 text-orange-100 border border-white/20"
            }`}>
              {cardActive ? `✦ ${cardLevel ?? "GOLD"}` : `🔒 ${t("preview")}`}
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenuto ── */}
      <main className="flex-1 px-4 pt-5 space-y-7">

        {/* ── TIPA bubble ── */}
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${concierge.color} text-sm`}>
            {concierge.emoji}
          </div>
          <div className="relative rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-700 leading-relaxed">{tipaMessage}</p>
            <span className="mt-1 block text-right text-[10px] text-gray-400">Ora</span>
          </div>
        </div>

        {/* ── Banner anteprima ── */}
        {!cardActive && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3 text-left hover:border-orange-300 transition-all"
          >
            <p className="text-xs font-semibold text-orange-600">🔒 {t("previewBanner")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t("previewBannerDesc")}</p>
          </button>
        )}

        {/* ── Scelto per te ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">{t("chosenForYou")}</h2>
            <Link href="/dashboard/esplora" className="text-[11px] text-orange-600 hover:text-orange-700">
              {t("seeAll")}
            </Link>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {suggestions.map((s) => (
              <div key={s.id} style={{ scrollSnapAlign: "start" }}>
                <SuggestionCard s={s} cardActive={cardActive} onUnlock={handleUnlock} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Questo weekend ── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">{t("thisWeekend")}</h2>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center text-6xl relative overflow-hidden">
              {featured.image ? (
                <Image src={featured.image} alt={featured.title} fill className="object-cover" sizes="100vw" />
              ) : (
                featured.emoji
              )}
              {featured.spotsLeft !== undefined && (
                <span className="absolute top-3 right-3 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("spotsLeft", { count: featured.spotsLeft })}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-gray-900">{featured.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{featured.location}</p>
              <p className="mt-2 text-xs text-gray-500 italic">&ldquo;{featured.reason}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 line-through">€{featured.originalPrice} {t("perPerson")}</p>
                  {cardActive ? (
                    <p className="text-lg font-bold text-orange-600">€{featured.goldPrice}<span className="text-xs font-normal text-gray-500"> {t("perPerson")}</span></p>
                  ) : (
                    <p className="text-lg font-bold text-orange-400 flex items-center gap-1">
                      🔒 €{featured.goldPrice}
                      <span className="text-xs font-normal text-gray-400"> GOLD</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={cardActive ? undefined : handleUnlock}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    cardActive
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-orange-50 border border-orange-300 text-orange-600 hover:bg-orange-100"
                  }`}
                >
                  {cardActive ? t("bookNow") : t("unlock")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Flash deal ── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">{t("flashDeal")}</h2>
          <div className="rounded-2xl bg-white shadow-sm border border-red-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl flex-shrink-0">{flash.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{flash.title}</p>
                  <p className="text-xs text-gray-500">{flash.location}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-[10px] text-gray-400 line-through">€{flash.originalPrice}</p>
                    <p className="text-sm font-bold text-red-600">€{flash.goldPrice}</p>
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">-{flash.discountPct}%</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="text-[9px] text-gray-400 uppercase mb-1">{t("expiresIn")}</p>
                <div className="flex items-center gap-0.5">
                  {[
                    { v: countdown.h, label: "h" },
                    { v: countdown.m, label: "m" },
                    { v: countdown.s, label: "s" },
                  ].map(({ v, label }) => (
                    <div key={label} className="flex flex-col items-center">
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-bold text-red-600 tabular-nums">
                        {String(v).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={cardActive ? undefined : handleUnlock}
              className={`mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                cardActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              {cardActive ? t("grabNow") : t("unlockWithGoldFlash")}
            </button>
          </div>
        </section>

        {/* ── Categorie ── */}
        <section className="pb-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">{t("exploreByCategory")}</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white shadow-sm border border-gray-100 py-4 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <cat.Icon className="h-6 w-6 text-orange-600" />
                <span className="text-[11px] font-medium text-gray-600">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <BottomNav active="home" />
      {showModal && <ActivationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
