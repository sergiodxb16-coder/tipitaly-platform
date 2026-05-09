#!/usr/bin/env node
/**
 * stripe-setup.mjs — crea prodotti e prezzi TipItaly su Stripe
 * Usa solo moduli built-in Node (https, querystring) — nessuna dipendenza esterna.
 *
 * Eseguire con:
 *   source ~/.nvm/nvm.sh && node scripts/stripe-setup.mjs
 */

import https from "https";
import querystring from "querystring";

const SK = process.env.STRIPE_SECRET_KEY;

function stripePost(path, data) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify(data);
    const options = {
      hostname: "api.stripe.com",
      path,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SK}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("Parse error: " + raw)); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const PRODUCTS = [
  {
    level: "WHITE",
    name: "TipItaly Card WHITE",
    description: "Card TipItaly livello WHITE — accesso ai benefit base della rete partner",
    prices: [
      { country: "IT", currency: "eur", amount: 2900 },
      { country: "GB", currency: "gbp", amount: 2500 },
      { country: "CH", currency: "chf", amount: 2700 },
    ],
  },
  {
    level: "GOLD",
    name: "TipItaly Card GOLD",
    description: "Card TipItaly livello GOLD — accesso ai benefit premium della rete partner",
    prices: [
      { country: "IT", currency: "eur", amount: 5900 },
      { country: "GB", currency: "gbp", amount: 4900 },
      { country: "CH", currency: "chf", amount: 5500 },
    ],
  },
  {
    level: "PLATINUM",
    name: "TipItaly Card PLATINUM",
    description: "Card TipItaly livello PLATINUM — accesso completo a tutti i benefit esclusivi",
    prices: [
      { country: "IT", currency: "eur", amount: 9900 },
      { country: "GB", currency: "gbp", amount: 8500 },
      { country: "CH", currency: "chf", amount: 9200 },
    ],
  },
];

async function main() {
  console.log("🚀 Avvio setup Stripe per TipItaly...\n");
  const envLines = [];

  for (const product of PRODUCTS) {
    console.log(`📦 Creo prodotto: ${product.name}`);

    const stripeProduct = await stripePost("/v1/products", {
      name: product.name,
      description: product.description,
      "metadata[card_level]": product.level,
    });

    if (stripeProduct.error) {
      console.error("❌ Errore prodotto:", stripeProduct.error.message);
      process.exit(1);
    }
    console.log(`   ✅ Product ID: ${stripeProduct.id}`);

    for (const price of product.prices) {
      const stripePrice = await stripePost("/v1/prices", {
        product: stripeProduct.id,
        currency: price.currency,
        unit_amount: price.amount,
        "metadata[card_level]": product.level,
        "metadata[country]": price.country,
      });

      if (stripePrice.error) {
        console.error("❌ Errore prezzo:", stripePrice.error.message);
        process.exit(1);
      }

      const envKey = `STRIPE_PRICE_${price.country}_${product.level}`;
      const display = (price.amount / 100).toFixed(2);
      console.log(`   💶 ${price.country} ${price.currency.toUpperCase()} ${display} → ${stripePrice.id}`);
      envLines.push(`${envKey}=${stripePrice.id}`);
    }
    console.log();
  }

  console.log("=".repeat(60));
  console.log("✅ Copia queste righe nel .env.local:\n");
  console.log(envLines.join("\n"));
  console.log("\n" + "=".repeat(60));
}

main().catch((err) => {
  console.error("❌ Errore:", err.message);
  process.exit(1);
});
