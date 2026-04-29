import { Prisma, PartnerCategory } from "../generated/client";
import { prisma } from "./index";

export interface PartnerSearchParams {
  q?: string;
  categoria?: PartnerCategory;
  citta?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function searchPartners(params: PartnerSearchParams) {
  const { q, categoria, citta, lat, lng, radiusKm, featured, limit = 50, offset = 0 } = params;

  const where: Prisma.PartnerWhereInput = {
    isActive: true,
    ...(categoria ? { categoria } : {}),
    ...(citta ? { citta: { contains: citta, mode: "insensitive" } } : {}),
    ...(featured ? { isFeatured: true } : {}),
    ...(q
      ? {
          OR: [
            { nome: { contains: q, mode: "insensitive" } },
            { descrizione: { contains: q, mode: "insensitive" } },
            { citta: { contains: q, mode: "insensitive" } },
            { indirizzo: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const partners = await prisma.partner.findMany({
    where,
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      ratings: { select: { stelle: true } },
      _count: { select: { coupons: true } },
    },
    orderBy: featured
      ? [{ featuredOrder: "asc" }, { nome: "asc" }]
      : [{ isFeatured: "desc" }, { nome: "asc" }],
    take: limit + (lat != null ? 200 : 0), // over-fetch for geo filtering
    skip: offset,
  });

  const now = Date.now();
  let results = partners.map((p) => {
    const totalStelle = p.ratings.reduce((s, r) => s + r.stelle, 0);
    const ratingCount = p.ratings.length;
    const ratingMedia = ratingCount > 0 ? totalStelle / ratingCount : null;
    const isNew = now - p.createdAt.getTime() < THIRTY_DAYS_MS;

    let distanceKm: number | null = null;
    if (lat != null && lng != null && p.latitudine != null && p.longitudine != null) {
      distanceKm = haversineKm(lat, lng, p.latitudine, p.longitudine);
    }

    return { ...p, ratingMedia, ratingCount, isNew, distanceKm };
  });

  if (lat != null && radiusKm != null) {
    results = results.filter((p) => p.distanceKm == null || p.distanceKm <= radiusKm);
  }
  if (lat != null) {
    results = results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  return results.slice(0, limit);
}

export async function getPartnerBySlugOrId(slugOrId: string) {
  const partner = await prisma.partner.findFirst({
    where: {
      isActive: true,
      OR: [{ slug: slugOrId }, { id: slugOrId }],
    },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      ratings: { select: { stelle: true } },
      coupons: {
        where: { isActive: true },
        orderBy: { scadenza: "asc" },
      },
    },
  });

  if (!partner) return null;

  const ratingCount = partner.ratings.length;
  const ratingMedia =
    ratingCount > 0 ? partner.ratings.reduce((s, r) => s + r.stelle, 0) / ratingCount : null;
  const isNew = Date.now() - partner.createdAt.getTime() < THIRTY_DAYS_MS;

  return { ...partner, ratingMedia, ratingCount, isNew };
}

export type RatingResult =
  | { success: true; ratingMedia: number; ratingCount: number }
  | { success: false; error: "invalid_stelle" | "no_card" };

export async function upsertPartnerRating(
  partnerId: string,
  cardholderId: string,
  stelle: number
): Promise<RatingResult> {
  if (stelle < 1 || stelle > 5 || !Number.isInteger(stelle)) {
    return { success: false, error: "invalid_stelle" };
  }

  await prisma.partnerRating.upsert({
    where: { partnerId_cardholderId: { partnerId, cardholderId } },
    create: { partnerId, cardholderId, stelle },
    update: { stelle },
  });

  const ratings = await prisma.partnerRating.findMany({
    where: { partnerId },
    select: { stelle: true },
  });
  const ratingCount = ratings.length;
  const ratingMedia = ratings.reduce((s, r) => s + r.stelle, 0) / ratingCount;

  return { success: true, ratingMedia, ratingCount };
}

export async function getMyRatingForPartner(
  partnerId: string,
  cardholderId: string
): Promise<number | null> {
  const r = await prisma.partnerRating.findUnique({
    where: { partnerId_cardholderId: { partnerId, cardholderId } },
    select: { stelle: true },
  });
  return r?.stelle ?? null;
}

export async function getFeaturedPartners(limit = 6) {
  return searchPartners({ featured: true, limit });
}
