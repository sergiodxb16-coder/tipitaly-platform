"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TicketIcon, BedIcon, PlaneIcon, GiftIcon } from "@/components/icons";
import { useTranslations } from "next-intl";

/* ─── Tipi ───────────────────────────────────────────────────── */
type TabId = "biglietti" | "hotel" | "voli" | "coupon";

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_TICKETS = [
  { id: "t1", type: "Treno", from: "Milano Centrale", to: "Roma Termini", date: "15 Mag 2026", time: "08:05 → 11:35", pnr: "TRN-8821", price: "€42.00", status: "confermato", qr: "TRN8821MIL-ROM" },
  { id: "t2", type: "Bus", from: "Firenze SMN", to: "Siena", date: "18 Mag 2026", time: "10:30 → 12:00", pnr: "BUS-4432", price: "€9.50", status: "confermato", qr: "BUS4432FIR-SIE" },
  { id: "t3", type: "Traghetto", from: "Napoli", to: "Capri", date: "22 Mag 2026", time: "09:00 → 09:50", pnr: "FRY-1109", price: "€21.00", status: "in attesa", qr: "FRY1109NAP-CAP" },
];

const MOCK_HOTELS = [
  { id: "h1", name: "Hotel Bernini Palace", city: "Firenze", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", checkin: "17 Mag 2026", checkout: "20 Mag 2026", nights: 3, guests: 2, room: "Superior Doppia", price: "€324.00", discount: "−10% GOLD", booking: "HB-55821", status: "confermato" },
  { id: "h2", name: "Palazzo Avino", city: "Ravello (SA)", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80", checkin: "23 Mag 2026", checkout: "25 Mag 2026", nights: 2, guests: 2, room: "Deluxe Vista Mare", price: "€510.00", discount: "−10% GOLD", booking: "HB-55990", status: "confermato" },
];

const MOCK_FLIGHTS = [
  { id: "f1", airline: "ITA Airways", from: "LHR", to: "FCO", fromCity: "Londra", toCity: "Roma", date: "14 Mag 2026", dep: "07:30", arr: "11:15", flight: "AZ 204", pnr: "XKMPZA", price: "€189.00", status: "confermato" },
  { id: "f2", airline: "easyJet", from: "MXP", to: "LGW", fromCity: "Milano", toCity: "Londra", date: "26 Mag 2026", dep: "19:45", arr: "21:30", flight: "U2 1872", pnr: "EJT991B", price: "€97.00", status: "confermato" },
];

const MOCK_COUPONS = [
  { id: "c1", title: "Sconto hotel Maggio", value: "−15%", desc: "Valido su qualsiasi hotel partner", expires: "31 Mag 2026", code: "GOLD-MAY15", used: false },
  { id: "c2", title: "Welcome bonus", value: "−€10", desc: "Prima prenotazione ristorante", expires: "30 Giu 2026", code: "WELCOME10", used: false },
  { id: "c3", title: "Bonus referral", value: "−€20", desc: "Hai invitato 2 amici", expires: "31 Lug 2026", code: "REF-SRG2", used: false },
  { id: "c4", title: "Sconto treni Aprile", value: "−5%", desc: "Treni Trenitalia e Italo", expires: "30 Apr 2026", code: "TRAIN5-APR", used: true },
];

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
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
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-sm px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link key={item.id} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              item.id === "wallet" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
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

/* ─── Badge status ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("wallet");
  const colorMap: Record<string, string> = {
    confermato: "bg-green-100 text-green-700 border-green-200",
    "in attesa": "bg-yellow-100 text-yellow-700 border-yellow-200",
    cancellato:  "bg-red-100 text-red-700 border-red-200",
  };
  const labelMap: Record<string, string> = {
    confermato: t("statusConfirmed"),
    "in attesa": t("statusPending"),
    cancellato:  t("statusCancelled"),
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${colorMap[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labelMap[status] ?? status}
    </span>
  );
}

/* ─── QR placeholder ─────────────────────────────────────────── */
function QRPlaceholder({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 border border-gray-200">
        <div className="grid grid-cols-6 gap-0.5 w-full h-full">
          {Array.from({ length: 36 }, (_, i) => (
            <div key={i} className={`rounded-[1px] ${(code.charCodeAt(i % code.length) + i) % 3 === 0 ? "bg-gray-900" : "bg-white"}`} />
          ))}
        </div>
      </div>
      <span className="text-[10px] text-gray-500 font-mono">{code}</span>
    </div>
  );
}

/* ─── Pagina principale ──────────────────────────────────────── */
export default function WalletPage() {
  const tw = useTranslations("wallet");
  const [activeTab, setActiveTab] = useState<TabId>("biglietti");
  const [expandedQr, setExpandedQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const TABS: { id: TabId; label: string; Icon: typeof TicketIcon }[] = [
    { id: "biglietti", label: tw("tabTickets"), Icon: TicketIcon },
    { id: "hotel",     label: tw("tabHotel"),   Icon: BedIcon },
    { id: "voli",      label: tw("tabFlights"), Icon: PlaneIcon },
    { id: "coupon",    label: tw("tabCoupons"), Icon: GiftIcon },
  ];

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F3] text-gray-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-orange-600">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-white">{tw("title")}</h1>
            <p className="text-[11px] text-orange-100">{tw("subtitle")}</p>
          </div>
          <span className="text-xl font-bold italic text-white">TipItaly</span>
          <div className="rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-center">
            <p className="text-[10px] font-semibold text-white">GOLD Card</p>
            <p className="text-[9px] text-orange-100">fino Mag 2027</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-4 pb-0 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "biglietti" && (
                <span className="ml-0.5 bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full">{MOCK_TICKETS.length}</span>
              )}
              {tab.id === "coupon" && (
                <span className="ml-0.5 bg-green-100 text-green-600 text-[10px] px-1.5 py-0.5 rounded-full">{MOCK_COUPONS.filter(c => !c.used).length}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenuto ── */}
      <main className="flex-1 px-4 py-4 pb-28 space-y-3">

        {/* BIGLIETTI */}
        {activeTab === "biglietti" && MOCK_TICKETS.map((t) => (
          <div key={t.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">{t.type}</span>
                  <StatusBadge status={t.status} />
                </div>
                <span className="text-sm font-semibold text-gray-900">{t.price}</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-0.5">{tw("from")}</p>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{t.from}</p>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1 text-gray-300">
                    <div className="w-6 border-t border-dashed border-gray-300" />
                    <span className="text-xs">→</span>
                    <div className="w-6 border-t border-dashed border-gray-300" />
                  </div>
                  <p className="text-[10px] text-gray-400">{t.time}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-gray-400 mb-0.5">{tw("to")}</p>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{t.to}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-500">{t.date}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{t.pnr}</p>
                </div>
                <button onClick={() => setExpandedQr(expandedQr === t.id ? null : t.id)}
                  className="text-[11px] text-orange-600 font-medium hover:text-orange-700 transition-colors">
                  {expandedQr === t.id ? tw("hideQR") : tw("showQR")}
                </button>
              </div>
            </div>

            {expandedQr === t.id && (
              <div className="border-t border-gray-100 bg-gray-50 py-4 flex justify-center">
                <QRPlaceholder code={t.qr} />
              </div>
            )}
          </div>
        ))}

        {/* HOTEL */}
        {activeTab === "hotel" && MOCK_HOTELS.map((h) => (
          <div key={h.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-28">
              <Image src={h.image} alt={h.name} fill className="object-cover" sizes="100vw" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{h.name}</h3>
                  <p className="text-xs text-gray-500">{h.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{h.price}</p>
                  <p className="text-[10px] text-green-600 font-medium">{h.discount}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">{tw("checkin")}</p>
                  <p className="text-xs font-medium text-gray-700">{h.checkin}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{tw("nights", { count: h.nights })}</p>
                  <p className="text-xs font-medium text-gray-700">{h.nights}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 mb-0.5">{tw("checkout")}</p>
                  <p className="text-xs font-medium text-gray-700">{h.checkout}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>👥 {tw("guests", { count: h.guests })}</span>
                  <span>🛏 {h.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={h.status} />
                  <span className="text-[10px] font-mono text-gray-400">{h.booking}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* VOLI */}
        {activeTab === "voli" && MOCK_FLIGHTS.map((f) => (
          <div key={f.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">✈️ {f.airline}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{f.flight}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{f.price}</p>
                  <StatusBadge status={f.status} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{f.dep}</p>
                  <p className="text-xs font-bold text-gray-500">{f.from}</p>
                  <p className="text-[10px] text-gray-400">{f.fromCity}</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="text-gray-400">✈</span>
                    <div className="flex-1 border-t border-gray-200" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{f.date}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{f.arr}</p>
                  <p className="text-xs font-bold text-gray-500">{f.to}</p>
                  <p className="text-[10px] text-gray-400">{f.toCity}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">🪑 {tw("economy")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">PNR:</span>
                  <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{f.pnr}</span>
                </div>
                <button onClick={() => setExpandedQr(expandedQr === f.id ? null : f.id)}
                  className="text-[11px] text-orange-600 font-medium hover:text-orange-700 transition-colors">
                  {tw("qrBoarding")} {expandedQr === f.id ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {expandedQr === f.id && (
              <div className="border-t border-gray-100 bg-gray-50 py-4 flex justify-center">
                <QRPlaceholder code={f.pnr} />
              </div>
            )}
          </div>
        ))}

        {/* COUPON */}
        {activeTab === "coupon" && (
          <>
            <p className="text-[11px] text-gray-500">
              {tw("activeCount", { active: MOCK_COUPONS.filter(c => !c.used).length, used: MOCK_COUPONS.filter(c => c.used).length })}
            </p>
            {MOCK_COUPONS.map((c) => (
              <div key={c.id} className={`rounded-2xl border overflow-hidden transition-opacity ${c.used ? "opacity-40" : ""} ${c.used ? "border-gray-100 bg-gray-50" : "border-orange-100 bg-white shadow-sm"}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${c.used ? "bg-gray-100" : "bg-orange-50"}`}>
                    <span className={`text-base font-bold ${c.used ? "text-gray-400" : "text-orange-600"}`}>{c.value}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{c.title}</h3>
                      {c.used && <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">{tw("used")}</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 mb-1.5">{c.desc}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono bg-orange-50 border border-dashed border-orange-300 px-2 py-0.5 rounded text-orange-600">{c.code}</span>
                      <span className="text-[10px] text-gray-400">scade {c.expires}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Referral box */}
            <div className="rounded-2xl border border-orange-100 bg-white shadow-sm p-4 mt-2">
              <p className="text-sm font-semibold text-gray-900 mb-1">{tw("inviteFriend")}</p>
              <p className="text-xs text-gray-500 mb-3">{tw("inviteFriendDesc")}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm font-mono text-orange-600">
                  TIPA-SERGIO-X9
                </div>
                <button onClick={() => copyCode("TIPA-SERGIO-X9")}
                  className="bg-orange-600 hover:bg-orange-700 transition-colors text-white text-xs px-4 py-2 rounded-xl font-medium">
                  {copied ? tw("copied") : tw("copy")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* CTA esplora */}
        <Link
          href="/dashboard/esplora"
          className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 px-4 py-3.5 transition-colors hover:bg-orange-50"
        >
          <div>
            <p className="text-sm font-semibold text-orange-700">Scopri nuove esperienze</p>
            <p className="text-[11px] text-orange-600/80">Hotel, voli e cene esclusive con sconto GOLD</p>
          </div>
          <span className="text-orange-600 text-lg">→</span>
        </Link>
      </main>

      <BottomNav />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
