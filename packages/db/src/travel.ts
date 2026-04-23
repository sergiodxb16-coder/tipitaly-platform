import { prisma } from "./index";
import { CardLevel } from "../generated/client";

const LEVEL_ORDER: Record<CardLevel, number> = { WHITE: 0, GOLD: 1, PLATINUM: 2 };

export async function getFeaturedTravelOffers(cardLevel: CardLevel) {
  return prisma.travelOffer.findMany({
    where: {
      isActive: true,
      OR: [{ scadenza: null }, { scadenza: { gt: new Date() } }],
    },
    orderBy: [{ scadenza: "asc" }, { createdAt: "desc" }],
    take: 6,
  });
}
