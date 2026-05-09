import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfillB2CPurchase } from "@tip-italy/db/purchases";
import { CardLevel, SupportedCountry, SupportedCurrency } from "@tip-italy/db";
import { sendCardPurchasedEmail } from "@tip-italy/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const secret =
    process.env.STRIPE_B2C_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, secret);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;

  const cardLevel = (session.metadata?.cardLevel ?? "WHITE") as CardLevel;
  const country = (session.metadata?.country ?? "IT") as SupportedCountry;
  const currency = (session.metadata?.currency ?? "EUR") as SupportedCurrency;

  const details = session.total_details;
  const taxAmount = details?.amount_tax ?? 0;
  const amountTotal = session.amount_total ?? 0;
  const amountSubtotal = amountTotal - taxAmount;

  const customerEmail = session.customer_details?.email ?? "";
  const customerName = session.customer_details?.name ?? undefined;

  if (!customerEmail) {
    return NextResponse.json({ error: "No customer email" }, { status: 400 });
  }

  const purchase = await fulfillB2CPurchase({
    stripeSessionId: session.id,
    cardLevel,
    country,
    currency,
    amountTotal,
    amountSubtotal,
    taxAmount,
    taxRate: taxAmount > 0 ? taxAmount / amountSubtotal : undefined,
    stripeLocale: session.locale ?? undefined,
    customerEmail,
    customerName,
  });

  if (purchase.card && purchase.cardholderId) {
    await sendCardPurchasedEmail({
      to: customerEmail,
      cardLevel,
      serialNumber: purchase.card.serialNumber,
    }).catch(() => {
      // Non-blocking — email failure should not fail webhook
    });
  }

  return NextResponse.json({ received: true });
}
