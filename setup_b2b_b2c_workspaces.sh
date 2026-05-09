#!/bin/bash
# Crea i workspace per B2B Dev e B2C Dev
B2B_ID="c65895f0-41a4-403d-a162-9d100bb687ba"
B2C_ID="95262b2a-5747-4189-81e6-83d3a7497784"
WS_BASE="$HOME/.paperclip/instances/default/workspaces"
MONO="$WS_BASE/f92dc4b4-bd5e-4c26-a419-25574f550b98"

mkdir -p "$WS_BASE/$B2B_ID"
cat > "$WS_BASE/$B2B_ID/AGENTS.md" << 'EOF'
# B2B Dev — TIP ITALY

## Ruolo
Sviluppi il portale gestionale B2B. Riporti al CTO.
Monorepo: /Users/sergiobragato/.paperclip/instances/default/workspaces/f92dc4b4-bd5e-4c26-a419-25574f550b98

## Scope
- apps/b2b/ — portale agenzie partner
- Membership tiers Silver/Gold/Platinum
- Dashboard prenotazioni e fatturazione
- Auth Supabase ruolo "agency"
- RateHawk hotel + voli via packages/db

## Regole
1. Lavora SOLO in apps/b2b/
2. Non toccare apps/web, apps/b2c, packages/ (solo lettura)
3. Per cambi DB → crea migration in packages/db/prisma/
4. Ogni feature → issue TIPA-xxx
EOF

mkdir -p "$WS_BASE/$B2C_ID"
cat > "$WS_BASE/$B2C_ID/AGENTS.md" << 'EOF'
# B2C Dev — TIP ITALY

## Ruolo
Sviluppi l'app consumer B2C. Riporti al CTO.
Monorepo: /Users/sergiobragato/.paperclip/instances/default/workspaces/f92dc4b4-bd5e-4c26-a419-25574f550b98

## Scope
- apps/b2c/ — app consumer viaggiatori
- Booking flow ricerca → checkout → conferma
- Pagamenti Stripe + webhook /api/stripe/webhook
- Programma referral (STRIPE_REFERRAL_COUPON_ID)
- Auth Supabase ruolo "user"
- RateHawk hotel + voli via packages/db

## Env vars richieste (da aggiungere su Vercel)
- STRIPE_B2C_WEBHOOK_SECRET
- STRIPE_REFERRAL_COUPON_ID
- RATEHAWK_KEY_ID + RATEHAWK_API_KEY

## Regole
1. Lavora SOLO in apps/b2c/
2. Non toccare apps/web, apps/b2b, packages/ (solo lettura)
3. Per cambi DB → crea migration in packages/db/prisma/
4. Ogni feature → issue TIPA-xxx
EOF

echo "✅ B2B workspace: $WS_BASE/$B2B_ID/AGENTS.md"
echo "✅ B2C workspace: $WS_BASE/$B2C_ID/AGENTS.md"
