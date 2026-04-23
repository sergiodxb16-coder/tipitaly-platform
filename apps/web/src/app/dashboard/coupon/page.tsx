import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { getCouponsForCardholder } from "@tip-italy/db/coupons";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Coupon — TipItaly Card" };

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function CouponListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) redirect("/auth/login");

  const assignment = await prisma.cardAssignment.findFirst({
    where: { cardholderId: cardholder.id },
    include: { card: true },
  });

  if (!assignment || assignment.card.status !== "ACTIVE") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-gray-500">Attiva la tua card per accedere ai coupon.</p>
        <Link href="/attivazione" className="mt-2 inline-block text-orange-600 underline text-sm">Attiva ora →</Link>
      </div>
    );
  }

  const coupons = await getCouponsForCardholder(cardholder.id, assignment.card.level);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupon Partner</h1>
        <Link href="/dashboard" className="text-sm text-orange-600 hover:underline">← Dashboard</Link>
      </div>

      {coupons.length === 0 ? (
        <p className="text-gray-500 text-sm">Nessun coupon disponibile al momento.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <Link
              key={coupon.id}
              href={`/dashboard/coupon/${coupon.id}`}
              className={`block rounded-xl border bg-white p-5 shadow-sm transition-colors hover:border-orange-300 ${coupon.isExhausted ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                    {coupon.partner.nome}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 text-sm leading-snug">{coupon.descrizione}</p>
                  <p className="mt-1 text-2xl font-bold text-orange-600">-{coupon.sconto.toString()}%</p>
                </div>
                <div className="shrink-0 text-right text-xs text-gray-400">
                  {coupon.scadenza ? formatDate(coupon.scadenza) : "Senza scadenza"}
                  {coupon.isExhausted && <p className="text-red-500 font-medium">Esaurito</p>}
                  {!coupon.isExhausted && coupon.redeemedByMe > 0 && (
                    <p className="text-green-600 font-medium">Usato {coupon.redeemedByMe}×</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
