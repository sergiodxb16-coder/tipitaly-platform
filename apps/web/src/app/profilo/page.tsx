"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
  const tNav = useTranslations("nav");
  const items = [
    {
      id: "home",
      label: tNav("home"),
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "esplora",
      label: tNav("explore"),
      href: "/dashboard/esplora",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "wallet",
      label: tNav("wallet"),
      href: "/dashboard/wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "tipa",
      label: tNav("concierge"),
      href: "/dashboard/tipa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: "profilo",
      label: tNav("profile"),
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
              item.id === "profilo" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
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

/* ─── Row impostazione ───────────────────────────────────────── */
function SettingRow({
  emoji, label, value, href, onClick, danger = false,
}: {
  emoji: string; label: string; value?: string;
  href?: string; onClick?: () => void; danger?: boolean;
}) {
  const inner = (
    <div className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${danger ? "hover:bg-red-50" : "hover:bg-gray-50"}`}>
      <span className="text-base flex-shrink-0 w-6 text-center">{emoji}</span>
      <span className={`flex-1 text-sm ${danger ? "text-red-500" : "text-gray-700"}`}>{label}</span>
      {value && <span className="text-xs text-gray-400">{value}</span>}
      {!danger && (
        <svg className="h-4 w-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  return inner;
}

/* ─── Sezione ────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="px-4 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

/* ─── Pagina principale ──────────────────────────────────────── */
export default function ProfiloPage() {
  const tp = useTranslations("profile");
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [notifiche, setNotifiche] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  function copyReferral() {
    navigator.clipboard.writeText("TIPA-SERGIO-X9").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleLogout() {
    // In produzione: chiama supabase.auth.signOut()
    router.push("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F3] text-gray-900">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 py-4 bg-orange-600">
        <h1 className="text-base font-semibold text-white flex-1">{tp("title")}</h1>
        <span className="text-xl font-bold italic text-white">TipItaly</span>
      </header>

      <main className="flex-1 pb-28">

        {/* ── Avatar + nome ── */}
        <div className="flex flex-col items-center py-8 px-4">
          <div className="relative mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-3xl shadow-xl">
              👤
            </div>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 text-sm hover:bg-gray-50 transition-colors shadow-sm">
              ✏️
            </button>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Sergio Bragato</h2>
          <p className="text-sm text-gray-500">sergiobragato@yahoo.it</p>

          {/* Card badge */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 px-5 py-3">
            <span className="text-2xl">🥇</span>
            <div>
              <p className="text-xs font-bold text-orange-600">TipItaly GOLD</p>
              <p className="text-[10px] text-gray-500">{tp("activeUntil", { date: "Maggio 2027" })}</p>
            </div>
            <Link href="/abbonamento" className="ml-4 rounded-xl bg-orange-600 border border-orange-600 px-3 py-1.5 text-[11px] text-white font-medium hover:bg-orange-700 transition-colors">
              {tp("manage")}
            </Link>
          </div>
        </div>

        {/* ── Sezioni ── */}
        <div className="px-4">

          <Section title={tp("sectionAccount")}>
            <SettingRow emoji="👤" label={tp("fullName")} value="Sergio Bragato" href="/profilo/dati" />
            <SettingRow emoji="📧" label={tp("email")} value="sergiobragato@yahoo.it" href="/profilo/dati" />
            <SettingRow emoji="📱" label={tp("phone")} value="+39 ···" href="/profilo/dati" />
            <SettingRow emoji="🔒" label={tp("password")} href="/profilo/password" />
          </Section>

          <Section title={tp("sectionPreferences")}>
            <SettingRow emoji="🗺️" label={tp("favDestinations")} value="Sardegna, Toscana" href="/profilo/preferenze" />
            <SettingRow emoji="🧳" label={tp("travelStyle")} value="Coppia · Lusso" href="/profilo/preferenze" />
            <SettingRow emoji="🍽️" label={tp("foodPrefs")} href="/profilo/preferenze" />
          </Section>

          <Section title={tp("sectionNotifications")}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-base w-6 text-center">🔔</span>
              <span className="flex-1 text-sm text-gray-700">{tp("pushNotif")}</span>
              <button
                onClick={() => setNotifiche(!notifiche)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${notifiche ? "bg-orange-600" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${notifiche ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <SettingRow emoji="✉️" label={tp("newsletter")} value={tp("newsletterActive")} href="/profilo/notifiche" />
            <SettingRow emoji="🎯" label={tp("personalizedOffers")} value={tp("personalizedOffersActive")} href="/profilo/notifiche" />
          </Section>

          {/* Referral */}
          <div className="mb-2">
            <p className="px-4 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{tp("sectionInvite")}</p>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-700 mb-1">{tp("inviteTitle")}</p>
              <p className="text-xs text-gray-400 mb-3">{tp("inviteDesc", { amount: "€20" })}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-50 border border-dashed border-orange-300 rounded-xl px-3 py-2 text-sm font-mono text-orange-600">
                  TIPA-SERGIO-X9
                </div>
                <button onClick={copyReferral}
                  className="bg-orange-600 hover:bg-orange-700 transition-colors text-white text-xs px-4 py-2 rounded-xl font-semibold">
                  {copied ? tp("copied") : tp("copy")}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="text-green-500">●</span>
                {tp("invitedCount", { count: 2, earned: "€40" })}
              </div>
            </div>
          </div>

          <Section title={tp("sectionSupport")}>
            <SettingRow emoji="💬" label={tp("support")} href="/dashboard/tipa" />
            <SettingRow emoji="📋" label={tp("faq")} href="https://tipitaly.it/faq" />
            <SettingRow emoji="⭐" label={tp("rate")} />
          </Section>

          <Section title={tp("sectionLegal")}>
            <SettingRow emoji="📄" label={tp("terms")} href="/termini" />
            <SettingRow emoji="🛡️" label={tp("privacy")} href="/privacy" />
            <SettingRow emoji="🍪" label={tp("cookies")} href="/cookie" />
          </Section>

          {/* Logout */}
          <div className="mb-2">
            <p className="px-4 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{tp("sectionSession")}</p>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <SettingRow emoji="🚪" label={tp("logout")} onClick={() => setShowLogout(true)} danger />
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4 mb-6">{tp("version")}</p>

        </div>
      </main>

      <BottomNav />

      {/* ── Modal logout ── */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={() => setShowLogout(false)}>
          <div className="w-full rounded-t-3xl bg-white border-t border-gray-200 p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
            <p className="text-base font-bold text-gray-900 mb-1">{tp("logoutConfirmTitle")}</p>
            <p className="text-sm text-gray-500 mb-6">{tp("logoutConfirmDesc")}</p>
            <button onClick={handleLogout}
              className="w-full rounded-2xl bg-red-50 border border-red-200 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors mb-2">
              {tp("logoutConfirm")}
            </button>
            <button onClick={() => setShowLogout(false)}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              {tp("logoutCancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
