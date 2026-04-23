import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { getCouponById } from "@tip-italy/db/coupons";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

export const metadata = { title: "Dettaglio Coupon — TipItaly Card" };

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

interface CouponDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CouponDetailPage({ params }: CouponDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) redirect("/auth/login");

  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  const redemptionCount = await prisma.couponRedemption.count({
    where: { couponId: id, cardholderId: cardholder.id },
  });

  const isExhausted = coupon.maxRedemptions != null && redemptionCount >= coupon.maxRedemptions;
  const isExpired = coupon.scadenza != null && new Date() > coupon.scadenza;

  const qrPayload = JSON.stringify({
    couponId: id,
    cardholderId: cardholder.id,
    codiceQr: coupon.codiceQr ?? id,
  });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 240, margin: 2 });

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <div className="mb-4">
        <Link href="/dashboard/coupon" className="text-sm text-orange-600 hover:underline">
          ← Tutti i coupon
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          {coupon.partner.nome}
        </p>
        <h1 className="mt-2 text-xl font-bold text-gray-900">{coupon.descrizione}</h1>
        <p className="mt-1 text-3xl font-bold text-orange-600">-{coupon.sconto.toString()}%</p>

        {coupon.scadenza && (
          <p className="mt-2 text-sm text-gray-500">
            Valido fino al {formatDate(coupon.scadenza)}
          </p>
        )}

        {isExpired && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Questo coupon è scaduto.
          </p>
        )}

        {isExhausted && !isExpired && (
          <p className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            Hai già utilizzato questo coupon il numero massimo di volte.
          </p>
        )}

        {!isExpired && !isExhausted && (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-dashed border-orange-200 bg-orange-50 p-6">
            <p className="text-sm font-medium text-gray-700">
              Mostra questo QR code al partner per ottenere lo sconto
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code coupon" width={200} height={200} className="rounded-lg" />
            {coupon.maxRedemptions != null && (
              <p className="text-xs text-gray-500">
                Utilizzi: {redemptionCount} / {coupon.maxRedemptions}
              </p>
            )}
          </div>
        )}

        {coupon.partner.sitoWeb && (
          <a
            href={coupon.partner.sitoWeb}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-orange-600 hover:underline"
          >
            Sito partner →
          </a>
        )}
      </div>
    </div>
  );
}
