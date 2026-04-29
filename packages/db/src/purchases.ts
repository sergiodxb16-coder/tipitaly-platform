import { prisma } from "./index";
import { CardLevel, CardStatus, SupportedCountry, SupportedCurrency } from "../generated/client";

export type CountryConfig = {
  country: SupportedCountry;
  currency: SupportedCurrency;
  stripeLocale: string;
  /** IETF locale for Intl formatting */
  intlLocale: string;
};

export const COUNTRY_CONFIG: Record<SupportedCountry, CountryConfig> = {
  IT: { country: "IT", currency: "EUR", stripeLocale: "it", intlLocale: "it-IT" },
  GB: { country: "GB", currency: "GBP", stripeLocale: "en-GB", intlLocale: "en-GB" },
  CH: { country: "CH", currency: "CHF", stripeLocale: "de", intlLocale: "de-CH" },
};

export async function getCountryPricing(country: SupportedCountry) {
  return prisma.countryPricing.findMany({
    where: { country },
    orderBy: { cardLevel: "asc" },
  });
}

export async function getAllCountryPricing() {
  return prisma.countryPricing.findMany({
    orderBy: [{ country: "asc" }, { cardLevel: "asc" }],
  });
}

export type CreatePurchaseInput = {
  stripeSessionId: string;
  cardLevel: CardLevel;
  country: SupportedCountry;
  currency: SupportedCurrency;
  amountTotal: number;
  amountSubtotal: number;
  taxAmount: number;
  taxRate?: number;
  stripeLocale?: string;
  customerEmail: string;
  customerName?: string;
  cardholderId?: string;
};

export async function fulfillB2CPurchase(input: CreatePurchaseInput) {
  return prisma.$transaction(async (tx) => {
    // Idempotency guard — webhook can fire multiple times
    const existing = await tx.cardPurchase.findUnique({
      where: { stripeSessionId: input.stripeSessionId },
      include: { card: true },
    });
    if (existing) return existing;

    // Upsert cardholder from Stripe customer email
    const [firstName, ...rest] = (input.customerName ?? "").split(" ");
    const cardholder = await tx.cardholder.upsert({
      where: { email: input.customerEmail },
      update: {},
      create: {
        supabaseUid: `stripe_${input.stripeSessionId}`,
        email: input.customerEmail,
        nome: firstName || "—",
        cognome: rest.join(" ") || "—",
      },
    });

    // Create card (INACTIVE, 30-day activation window)
    const activationDeadline = new Date();
    activationDeadline.setDate(activationDeadline.getDate() + 30);

    const card = await tx.card.create({
      data: {
        serialNumber: `B2C-${input.stripeSessionId.slice(-12).toUpperCase()}`,
        level: input.cardLevel,
        status: CardStatus.INACTIVE,
        activationDeadline,
      },
    });

    // Link card to cardholder
    await tx.cardAssignment.create({
      data: {
        cardId: card.id,
        cardholderId: cardholder.id,
        source: "B2C_PURCHASE",
      },
    });

    // Record the purchase
    const purchase = await tx.cardPurchase.create({
      data: {
        stripeSessionId: input.stripeSessionId,
        cardId: card.id,
        cardholderId: cardholder.id,
        cardLevel: input.cardLevel,
        country: input.country,
        currency: input.currency,
        amountTotal: input.amountTotal,
        amountSubtotal: input.amountSubtotal,
        taxAmount: input.taxAmount,
        taxRate: input.taxRate,
        stripeLocale: input.stripeLocale,
      },
      include: { card: true, cardholder: true },
    });

    return purchase;
  });
}

export type RevenueByCountry = {
  country: SupportedCountry;
  currency: SupportedCurrency;
  orders: number;
  grossRevenue: number;
  totalTax: number;
  netRevenue: number;
};

export async function getRevenueByCountry(fromDate?: Date): Promise<RevenueByCountry[]> {
  const where = fromDate ? { createdAt: { gte: fromDate } } : {};

  const rows = await prisma.cardPurchase.groupBy({
    by: ["country", "currency"],
    where,
    _count: { id: true },
    _sum: { amountTotal: true, taxAmount: true, amountSubtotal: true },
  });

  return rows.map((r) => ({
    country: r.country,
    currency: r.currency,
    orders: r._count.id,
    grossRevenue: r._sum.amountTotal ?? 0,
    totalTax: r._sum.taxAmount ?? 0,
    netRevenue: r._sum.amountSubtotal ?? 0,
  }));
}
