import { prisma } from "./index";
import { CardLevel } from "../generated/client";

const LEVEL_ORDER: Record<CardLevel, number> = { WHITE: 0, GOLD: 1, PLATINUM: 2 };

export async function getCouponsForCardholder(cardholderId: string, cardLevel: CardLevel) {
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    include: { partner: true },
    orderBy: [{ scadenza: "asc" }, { createdAt: "asc" }],
  });

  const redemptionCounts = await prisma.couponRedemption.groupBy({
    by: ["couponId"],
    where: { cardholderId },
    _count: { id: true },
  });
  const redeemedMap = new Map(redemptionCounts.map((r) => [r.couponId, r._count.id]));

  return coupons
    .filter((c) => LEVEL_ORDER[cardLevel] >= LEVEL_ORDER[c.minCardLevel])
    .map((c) => ({
      ...c,
      redeemedByMe: redeemedMap.get(c.id) ?? 0,
      isExhausted: c.maxRedemptions != null && (redeemedMap.get(c.id) ?? 0) >= c.maxRedemptions,
    }));
}

export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
    include: { partner: true },
  });
}

export type RedeemResult =
  | { success: true }
  | { success: false; error: "not_found" | "max_reached" | "expired" | "no_active_card" };

export async function redeemCoupon(couponId: string, cardholderId: string): Promise<RedeemResult> {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || !coupon.isActive) return { success: false, error: "not_found" };
  if (coupon.scadenza && new Date() > coupon.scadenza) return { success: false, error: "expired" };

  if (coupon.maxRedemptions != null) {
    const count = await prisma.couponRedemption.count({ where: { couponId, cardholderId } });
    if (count >= coupon.maxRedemptions) return { success: false, error: "max_reached" };
  }

  await prisma.couponRedemption.create({ data: { couponId, cardholderId } });
  return { success: true };
}
