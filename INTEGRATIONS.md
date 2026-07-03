# Integrazioni Esterne — TipItaly Platform

## RateHawk / WorldOta (ETG) — Soggiorni & Hotel

| Stato | Sandbox integrata, in attesa certificazione |
|-------|---------------------------------------------|
| Ticket | APIR-50640 |
| Aggiornato | 2026-07-03 |

**Endpoint produzione:** `https://api.worldota.net`  
**Endpoint sandbox:** `https://api-sandbox.worldota.net` (KEY_ID 646)

### Flusso hotel verificato in sandbox
1. `POST /api/b2b/v3/search/multicomplete/` — risolve destinazione in `region_id`
2. `POST /api/b2b/v3/search/serp/region/` — ricerca hotel con tariffe
3. `POST /api/content/v1/hotel_content_by_ids/` — nome, stelle, foto, indirizzo

Tariffe singolo hotel: `POST /api/b2b/v3/search/hp/` (restituisce `book_hash` per prenotazione).  
Prezzo EUR: `payment_types[].show_amount` / `show_currency_code`.

### Aviation
La chiave sandbox 646 **non abilita** endpoint aviation (verificato via `/overview/` il 2026-07-02).  
Il tab "Voli" mostra fallback finché non viene richiesto l'accesso avia a `apisupport@ratehawk.com` e impostato `RATEHAWK_AVIATION_ENABLED=true`.

### Env var (Vercel Production + Preview)
- `RATEHAWK_KEY_ID` — Key ID (646 in sandbox)
- `RATEHAWK_API_KEY` — API Key
- `RATEHAWK_BASE_URL` — override base URL (sandbox: `https://api-sandbox.worldota.net`)

### Prossimi passi
- Richiedere certificazione account produzione a RateHawk
- Validare prenotazione end-to-end (prebook + book) in sandbox
- Richiedere accesso aviation se richiesto dal business

---

## Stripe — Pagamenti

| Stato | Integrato in produzione |
|-------|------------------------|

---

## Supabase — Auth & Database

| Stato | In produzione |
|-------|--------------|
