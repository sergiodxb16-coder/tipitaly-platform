# Go-Live Checklist — TipItaly Platform

## RateHawk / Hotel Booking

- [x] Client `packages/db/src/ratehawk.ts` corretto (endpoint sandbox verificati — APIR-50640, 2026-07-03)
- [x] Env var `RATEHAWK_KEY_ID`, `RATEHAWK_API_KEY`, `RATEHAWK_BASE_URL` configurate su Vercel (Production + Preview)
- [x] Fallback tab "Voli" (aviation non abilitata su chiave sandbox — `RATEHAWK_AVIATION_ENABLED` non impostata)
- [ ] Verifica /dashboard/travel in produzione con ricerca hotel reale (es. "Los Angeles")
- [ ] Certificazione account produzione RateHawk (da richiedere)
- [ ] Validazione prenotazione end-to-end (prebook → book → conferma email)
- [ ] Accesso aviation (se richiesto dal business)

**Stato complessivo RateHawk:** sandbox integrata, in attesa certificazione

---

## Stripe — Pagamenti

- [x] Chiave produzione configurata su Vercel
- [x] Webhook configurato
- [x] Lazy-init Stripe client (no crash a build-time)

---

## Auth (Supabase)

- [x] Configurato in produzione
- [x] Demo login abilitato su preview Vercel (`VERCEL_ENV=preview`)

---

## Deploy

- [x] Build Vercel senza errori TypeScript
- [x] Prisma generate in `postinstall`
