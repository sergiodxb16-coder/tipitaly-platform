import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { prisma } from "@tip-italy/db";
import { SupportedCountry } from "@tip-italy/db";
import { COUNTRY_CONFIG } from "@tip-italy/db/purchases";

const CheckoutBody = z.object({
  cardLevel: z.enum(["WHITE", "GOLD", "PLATINUM"]),
  country: z.enum(["IT", "GB", "CH"]).default("IT"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = CheckoutBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { cardLevel, country } = parsed.data;
  const countryEnum = country as SupportedCountry;
  const config = COUNTRY_CONFIG[countryEnum];

  const pricing = await prisma.countryPricing.findUnique({
    where: { cardLevel_country: { cardLevel, country: countryEnum } },
  });

  if (!pricing) {
    return NextResponse.json({ error: "Pricing not configured for this market" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: pricing.stripePriceId, quantity: 1 }],
    locale: config.stripeLocale as Stripe.Checkout.SessionCreateParams["locale"],
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    metadata: {
      cardLevel,
      country,
      currency: pricing.currency,
    },
    success_url: `${baseUrl}/acquista/successo?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/acquista?cancelled=true`,
  });

  return NextResponse.json({ url: session.url });
}
