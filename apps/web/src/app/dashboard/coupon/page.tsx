import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Wallet — TipItaly" };

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav({ labels }: { labels: { home: string; explore: string; wallet: string; concierge: string; profile: string } }) {
  const items = [
    {
      id: "home",
      label: labels.home,
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "esplora",
      label: labels.explore,
      href: "/dashboard/esplora",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "wallet",
      label: labels.wallet,
      href: "/dashboard/wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "tipa",
      label: labels.concierge,
      href: "/dashboard/tipa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: "profilo",
      label: labels.profile,
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

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

const LEVEL_ORDER: Record<string, number> = { WHITE: 0, GOLD: 1, PLATINUM: 2 };

export default async function CouponListPage() {
  const [t, tNav] = await Promise.all([
    getTranslations("coupon"),
    getTranslations("nav"),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // 1. Cardholder
  const { data: cardholder } = await admin
    .from("Cardholder")
    .select("id, email, nome, cognome")
    .eq("supabaseUid", user.id)
    .maybeSingle();

  if (!cardholder) redirect("/onboarding");

  // 2. Card assignment (più recente)
  const { data: assignmentRow } = await admin
    .from("CardAssignment")
    .select("id, Card(id, level, status)")
    .eq("cardholderId", cardholder.id)
    .order("assignedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = assignmentRow?.Card as any;
  const cardActive = card?.status === "ACTIVE";
  const cardLevel: string = card?.level ?? "WHITE";

  // 3. Tutti i coupon attivi con info partner (visibili a tutti)
  const { data: couponsRaw } = await admin
    .from("Coupon")
    .select("id, descrizione, sconto, scadenza, maxRedemptions, minCardLevel, isActive, Partner(id, nome, logoUrl, categoria)")
    .eq("isActive", true)
    .order("scadenza", { ascending: true, nullsFirst: false });

  // 4. Redemptions del cardholder (solo se attivo)
  const redeemedMap = new Map<string, number>();
  if (cardActive) {
    const { data: redemptionsRaw } = await admin
      .from("CouponRedemption")
      .select("couponId")
      .eq("cardholderId", cardholder.id);

    for (const r of (redemptionsRaw ?? [])) {
      redeemedMap.set(r.couponId, (redeemedMap.get(r.couponId) ?? 0) + 1);
    }
  }

  // 5. Arricchisci i coupon — se non attivo, tutti visibili ma locked
  const allCoupons = (couponsRaw ?? []).map((c) => ({
    ...c,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    partner: (c.Partner as any) ?? { nome: "Partner", logoUrl: null, categoria: null },
    sconto: c.sconto,
    scadenza: c.scadenza ? new Date(c.scadenza) : null,
    redeemedByMe: redeemedMap.get(c.id) ?? 0,
    isExhausted: c.maxRedemptions != null && (redeemedMap.get(c.id) ?? 0) >= c.maxRedemptions,
    // Il coupon è accessibile solo se la card è attiva e il livello è sufficiente
    isLocked: !cardActive || (LEVEL_ORDER[cardLevel] ?? 0) < (LEVEL_ORDER[c.minCardLevel] ?? 0),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F3] text-gray-900 pb-24">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-orange-600 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-orange-100 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">{t("title")}</h1>
            <p className="text-[11px] text-orange-100">
              {cardActive ? t("available", { count: allCoupons.filter(c => !c.isLocked).length }) : t("activatePlanToUse")}
            </p>
          </div>
          <span className="text-xl font-bold italic text-white">TipItaly</span>
          {cardActive && (
            <span className="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-[11px] font-bold text-white">
              ✦ {cardLevel}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 space-y-4">

        {/* ── Banner attivazione (solo se non attivo) ── */}
        {!cardActive && (
          <Link
            href="/attivazione"
            className="block rounded-2xl bg-white shadow-sm border border-orange-100 px-4 py-4 hover:border-orange-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">🔑</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-orange-600">{t("activatePlanBannerTitle")}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("activatePlanBannerDesc")}
                </p>
              </div>
              <svg className="h-4 w-4 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* ── Lista coupon ── */}
        {allCoupons.length === 0 ? (
          <p className="text-gray-500 text-sm pt-4">{t("noCoupons")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {allCoupons.map((coupon) => (
              coupon.isLocked ? (
                /* Coupon oscurato — porta ad attivazione */
                <Link
                  key={coupon.id}
                  href="/attivazione"
                  className="block rounded-2xl bg-white shadow-sm border border-gray-100 p-4 relative overflow-hidden hover:border-orange-300 transition-all"
                >
                  {/* Contenuto sfocato */}
                  <div className="blur-[3px] select-none pointer-events-none">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                      {coupon.partner.nome}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900 text-sm leading-snug">{coupon.descrizione}</p>
                    <p className="mt-1 text-2xl font-bold text-orange-600">-{String(coupon.sconto)}%</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {coupon.scadenza ? formatDate(coupon.scadenza) : t("noExpiry")}
                    </p>
                  </div>
                  {/* Overlay lucchetto */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 rounded-2xl">
                    <span className="text-2xl">🔒</span>
                    <span className="text-xs font-semibold text-orange-600">{t("lockLabel")}</span>
                  </div>
                </Link>
              ) : (
                /* Coupon accessibile */
                <Link
                  key={coupon.id}
                  href={`/dashboard/coupon/${coupon.id}`}
                  className={`block rounded-2xl bg-white shadow-sm border border-gray-100 p-4 hover:border-orange-300 transition-all ${coupon.isExhausted ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                        {coupon.partner.nome}
                      </p>
                      <p className="mt-1 font-semibold text-gray-900 text-sm leading-snug">{coupon.descrizione}</p>
                      <p className="mt-1 text-2xl font-bold text-orange-600">-{String(coupon.sconto)}%</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-gray-400">
                        {coupon.scadenza ? formatDate(coupon.scadenza) : t("noExpiry")}
                      </p>
                      {coupon.isExhausted && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{t("exhausted")}</p>
                      )}
                      {!coupon.isExhausted && coupon.redeemedByMe > 0 && (
                        <p className="text-[10px] text-green-600 font-semibold mt-1">{t("usedCount", { count: coupon.redeemedByMe })}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </main>

      <BottomNav labels={{ home: tNav("home"), explore: tNav("explore"), wallet: tNav("wallet"), concierge: tNav("concierge"), profile: tNav("profile") }} />
    </div>
  );
}
