import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

// Default pricing — update stripePriceId with real Stripe Price IDs before going live
const COUNTRY_PRICING = [
  // Italy — EUR
  { cardLevel: "WHITE" as const, country: "IT" as const, currency: "EUR" as const, priceAmount: 2900, stripePriceId: process.env.STRIPE_PRICE_IT_WHITE ?? "price_placeholder_it_white" },
  { cardLevel: "GOLD" as const, country: "IT" as const, currency: "EUR" as const, priceAmount: 5900, stripePriceId: process.env.STRIPE_PRICE_IT_GOLD ?? "price_placeholder_it_gold" },
  { cardLevel: "PLATINUM" as const, country: "IT" as const, currency: "EUR" as const, priceAmount: 9900, stripePriceId: process.env.STRIPE_PRICE_IT_PLATINUM ?? "price_placeholder_it_platinum" },
  // United Kingdom — GBP
  { cardLevel: "WHITE" as const, country: "GB" as const, currency: "GBP" as const, priceAmount: 2500, stripePriceId: process.env.STRIPE_PRICE_GB_WHITE ?? "price_placeholder_gb_white" },
  { cardLevel: "GOLD" as const, country: "GB" as const, currency: "GBP" as const, priceAmount: 4900, stripePriceId: process.env.STRIPE_PRICE_GB_GOLD ?? "price_placeholder_gb_gold" },
  { cardLevel: "PLATINUM" as const, country: "GB" as const, currency: "GBP" as const, priceAmount: 8500, stripePriceId: process.env.STRIPE_PRICE_GB_PLATINUM ?? "price_placeholder_gb_platinum" },
  // Switzerland — CHF
  { cardLevel: "WHITE" as const, country: "CH" as const, currency: "CHF" as const, priceAmount: 2700, stripePriceId: process.env.STRIPE_PRICE_CH_WHITE ?? "price_placeholder_ch_white" },
  { cardLevel: "GOLD" as const, country: "CH" as const, currency: "CHF" as const, priceAmount: 5500, stripePriceId: process.env.STRIPE_PRICE_CH_GOLD ?? "price_placeholder_ch_gold" },
  { cardLevel: "PLATINUM" as const, country: "CH" as const, currency: "CHF" as const, priceAmount: 9200, stripePriceId: process.env.STRIPE_PRICE_CH_PLATINUM ?? "price_placeholder_ch_platinum" },
];

async function main() {
  for (const pricing of COUNTRY_PRICING) {
    await prisma.countryPricing.upsert({
      where: { cardLevel_country: { cardLevel: pricing.cardLevel, country: pricing.country } },
      update: { priceAmount: pricing.priceAmount, currency: pricing.currency, stripePriceId: pricing.stripePriceId },
      create: pricing,
    });
  }
  console.log(`Seeded ${COUNTRY_PRICING.length} country pricing entries`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
