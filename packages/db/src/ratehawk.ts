/**
 * ratehawk.ts — client per l'API B2B RateHawk / WorldOta (ETG)
 *
 * VERSIONE CORRETTA — 2026-07-02 (ticket APIR-50640)
 * Endpoint verificati sulla sandbox con la chiave 646.
 *
 * Correzioni rispetto alla versione precedente:
 *  - searchHotels: non usa più /hotel/search/multicomplete/ (404). Flusso corretto:
 *      /search/multicomplete/  (risolve la destinazione in region_id)
 *      → /search/serp/region/  (ricerca hotel + tariffe)
 *      → /api/content/v1/hotel_content_by_ids/ (nome, stelle, foto, indirizzo)
 *  - getHotelRates: usa /search/hp/ (tariffe reali con book_hash), non /hotel/info/
 *    (che restituisce solo contenuto statico, senza tariffe).
 *  - Mapping campi allineato alle risposte reali:
 *      prezzo EUR = payment_types[].show_amount / show_currency_code
 *      (amount/currency_code sono in USD), meal, room_name, allotment, cancellation_penalties.
 *  - searchFlights: la chiave sandbox NON abilita alcun endpoint aviation.
 *    La funzione resta per compatibilità ma lancia un errore chiaro finché
 *    RateHawk non rilascia l'accesso avia (vedi isRateHawkAviationEnabled()).
 *
 * Base URL configurabile via env RATEHAWK_BASE_URL (default: produzione).
 * Auth: HTTP Basic  RATEHAWK_KEY_ID : RATEHAWK_API_KEY
 */

const RATEHAWK_HOST = (
  process.env.RATEHAWK_BASE_URL ?? "https://api.worldota.net"
).replace(/\/+$/, "");

const B2B_BASE = `${RATEHAWK_HOST}/api/b2b/v3`;
const CONTENT_BASE = `${RATEHAWK_HOST}/api/content/v1`;

/** Dimensione immagini richieste (placeholder {size} nelle URL di RateHawk). */
const IMAGE_SIZE = "1024x768";

// ---------------------------------------------------------------------------
// Tipi pubblici
// ---------------------------------------------------------------------------

export type RateHawkSearchParams = {
  /** Destinazione testuale (città/regione) — risolta in region_id via multicomplete */
  destination?: string;
  /** region_id numerico RateHawk (se noto, evita il passaggio multicomplete) */
  regionId?: number;
  /** id WorldOta di un hotel specifico (ricerca su singolo hotel via /search/hp/) */
  hotelId?: string;
  checkin: string;   // "YYYY-MM-DD"
  checkout: string;  // "YYYY-MM-DD"
  adults: number;
  children?: number[];  // età di ogni bambino
  currency?: string;    // default: EUR
  residency?: string;   // default: it
  language?: string;    // default: it
  /** limite hotel per cui recuperare il contenuto (nome/foto). default 30 */
  contentLimit?: number;
};

export type RateHawkHotel = {
  id: string;
  hid?: number;
  name: string;
  starRating: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  minPrice: number;
  currency: string;
  reviewScore?: number;
  reviewCount?: number;
};

export type RateHawkRate = {
  /** hash per prebook/prenotazione (presente in /search/hp/) */
  bookHash?: string;
  /** hash risultato SERP (presente in /search/serp/*) */
  matchHash?: string;
  roomName: string;
  boardType: string;  // es. "breakfast", "all_inclusive", "nomeal"
  price: number;
  currency: string;
  cancellationPolicy: string;
  freeCancellationUntil?: string; // "YYYY-MM-DD" se rimborsabile
  availableRooms: number;
};

export type RateHawkSearchResult = {
  hotels: RateHawkHotel[];
  regionId?: number;
};

export type RateHawkHotelDetail = {
  hotel: RateHawkHotel;
  rates: RateHawkRate[];
};

// ---------------------------------------------------------------------------
// Helpers interni
// ---------------------------------------------------------------------------

function getAuthHeader(): string {
  const keyId = process.env.RATEHAWK_KEY_ID;
  const apiKey = process.env.RATEHAWK_API_KEY;
  if (!keyId || !apiKey) {
    throw new Error("Variabili RATEHAWK_KEY_ID e RATEHAWK_API_KEY non configurate");
  }
  const token = Buffer.from(`${keyId}:${apiKey}`).toString("base64");
  return `Basic ${token}`;
}

async function ratehawkPost<T>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
    cache: "no-store", // prezzi in tempo reale
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RateHawk API error ${res.status} su ${url}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Tipi raw (struttura reale verificata in sandbox 2026-07-02)
// ---------------------------------------------------------------------------

type RawPaymentType = {
  amount: string;               // in valuta netta (spesso USD)
  currency_code: string;
  show_amount: string;          // in valuta richiesta (EUR)
  show_currency_code: string;
  cancellation_penalties?: {
    policies?: Array<{
      start_at: string | null;
      end_at: string | null;
      amount_charge?: string;
      amount_show?: string;
    }>;
  };
};

type RawRate = {
  book_hash?: string;
  match_hash?: string;
  room_name?: string;
  meal?: string;
  allotment?: number;
  daily_prices?: string[];
  payment_options: { payment_types: RawPaymentType[] };
};

type RawSerpHotel = { id: string; hid: number; rates: RawRate[] };

type RawSerpResponse = {
  data: { hotels: RawSerpHotel[] } | null;
  status: string;
  error?: string | null;
};

type RawMulticompleteResponse = {
  data: {
    hotels: Array<{ id: string; hid: number; name: string; region_id: number }>;
    regions: Array<{ id: number; type: string; name: string }>;
  };
  status: string;
  error?: string | null;
};

type RawContentHotel = {
  id: string;
  hid: number;
  name: string;
  star_rating: number;
  address: string;
  latitude: number;
  longitude: number;
  images_ext?: Array<{ url: string; category_slug?: string }>;
  region?: { name?: string };
};

type RawContentResponse = {
  data: RawContentHotel[];
  status: string;
  error?: string | null;
};

// ---------------------------------------------------------------------------
// Cache in-memory (TTL 5 minuti) per le ricerche
// ---------------------------------------------------------------------------

type CacheEntry<T> = { data: T; expiresAt: number };
const _searchCache = new Map<string, CacheEntry<RateHawkSearchResult>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(p: RateHawkSearchParams): string {
  return JSON.stringify({
    d: p.regionId ?? p.destination ?? p.hotelId,
    ci: p.checkin, co: p.checkout, a: p.adults,
    ch: p.children ?? [], cur: p.currency ?? "EUR",
  });
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Estrae prezzo (EUR) dalla prima payment_type di una tariffa. */
function ratePrice(r: RawRate): { price: number; currency: string } {
  const pt = r.payment_options?.payment_types?.[0];
  if (!pt) return { price: 0, currency: "EUR" };
  return {
    price: parseFloat(pt.show_amount ?? pt.amount ?? "0"),
    currency: pt.show_currency_code ?? pt.currency_code ?? "EUR",
  };
}

/** Deriva la politica di cancellazione leggibile dalle policies. */
function cancellation(r: RawRate): { text: string; freeUntil?: string } {
  const pt = r.payment_options?.payment_types?.[0];
  const policies = pt?.cancellation_penalties?.policies ?? [];
  // policy gratuita = amount_show 0 con una data di fine (end_at)
  const free = policies.find(
    (p) => parseFloat(p.amount_show ?? p.amount_charge ?? "0") === 0 && p.end_at
  );
  if (free?.end_at) {
    const d = free.end_at.slice(0, 10);
    return { text: `Cancellazione gratuita fino al ${d}`, freeUntil: d };
  }
  return { text: "Non rimborsabile" };
}

function mapRate(r: RawRate): RateHawkRate {
  const { price, currency } = ratePrice(r);
  const c = cancellation(r);
  return {
    bookHash: r.book_hash,
    matchHash: r.match_hash,
    roomName: r.room_name ?? "Camera standard",
    boardType: r.meal ?? "nomeal",
    price,
    currency,
    cancellationPolicy: c.text,
    freeCancellationUntil: c.freeUntil,
    availableRooms: r.allotment ?? 1,
  };
}

function contentImages(h: RawContentHotel): string[] {
  return (h.images_ext ?? [])
    .slice(0, 5)
    .map((i) => i.url.replace("{size}", IMAGE_SIZE));
}

/** Recupera il contenuto (nome/stelle/foto) per una lista di hotel id. */
async function fetchContent(
  ids: string[],
  language: string
): Promise<Map<string, RawContentHotel>> {
  const map = new Map<string, RawContentHotel>();
  if (ids.length === 0) return map;
  try {
    const raw = await ratehawkPost<RawContentResponse>(
      `${CONTENT_BASE}/hotel_content_by_ids/`,
      { ids, language }
    );
    for (const h of raw.data ?? []) map.set(h.id, h);
  } catch {
    // il contenuto è best-effort: se fallisce si mostrano comunque id + prezzo
  }
  return map;
}

// ---------------------------------------------------------------------------
// API pubblica
// ---------------------------------------------------------------------------

/** Risolve una destinazione testuale nel primo region_id di tipo città. */
export async function resolveRegionId(
  destination: string,
  language = "it"
): Promise<number | undefined> {
  const lookup = async (lang: string) => {
    const raw = await ratehawkPost<RawMulticompleteResponse>(
      `${B2B_BASE}/search/multicomplete/`,
      { query: destination, language: lang }
    );
    const regions = raw.data?.regions ?? [];
    return (regions.find((r) => r.type === "RT_CITY") ?? regions[0])?.id;
  };
  // Alcune destinazioni sono indicizzate solo in inglese (soprattutto in sandbox):
  // se la lingua richiesta non produce regioni, si ritenta in "en".
  return (await lookup(language)) ?? (language !== "en" ? await lookup("en") : undefined);
}

/**
 * Cerca hotel per destinazione/region_id (o singolo hotel via hotelId).
 * Restituisce hotel con prezzo minimo, arricchiti con nome/stelle/foto dal content API.
 * Risultati cachati 5 minuti.
 */
export async function searchHotels(
  params: RateHawkSearchParams
): Promise<RateHawkSearchResult> {
  const key = cacheKey(params);
  const cached = _searchCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  const language = params.language ?? "it";
  const currency = params.currency ?? "EUR";
  const guests = [{ adults: params.adults, children: params.children ?? [] }];
  const common = {
    checkin: params.checkin,
    checkout: params.checkout,
    guests,
    currency,
    residency: params.residency ?? "it",
    language,
  };

  // Ricerca su singolo hotel → usa /search/hp/
  if (params.hotelId) {
    const detail = await getHotelRates(params.hotelId, params);
    const result: RateHawkSearchResult = { hotels: [detail.hotel] };
    _searchCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  }

  // Risolvi region_id
  let regionId = params.regionId;
  if (!regionId && params.destination) {
    regionId = await resolveRegionId(params.destination, language);
  }
  if (!regionId) {
    throw new Error(
      `RateHawk: destinazione non risolta in un region_id (${params.destination ?? "nessuna destinazione"})`
    );
  }

  const raw = await ratehawkPost<RawSerpResponse>(
    `${B2B_BASE}/search/serp/region/`,
    { ...common, region_id: regionId }
  );
  if (raw.status !== "ok" || raw.error || !raw.data) {
    throw new Error(`RateHawk search error: ${raw.error ?? raw.status}`);
  }

  const rawHotels = raw.data.hotels ?? [];
  const limit = params.contentLimit ?? 30;
  const top = rawHotels.slice(0, limit);
  const content = await fetchContent(top.map((h) => h.id), language);

  const hotels: RateHawkHotel[] = top.map((h) => {
    const prices = (h.rates ?? []).map((r) => ratePrice(r).price).filter((p) => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const c = content.get(h.id);
    return {
      id: h.id,
      hid: h.hid,
      name: c?.name ?? h.id,
      starRating: c?.star_rating ?? 0,
      address: c?.address ?? "",
      city: c?.region?.name ?? "",
      latitude: c?.latitude ?? 0,
      longitude: c?.longitude ?? 0,
      images: c ? contentImages(c) : [],
      minPrice,
      currency,
    };
  });

  const result: RateHawkSearchResult = { hotels, regionId };
  _searchCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

/**
 * Dettaglio di un hotel con tariffe disponibili (HotelPage) e book_hash per prenotare.
 * Endpoint: POST /search/hp/  (verificato). Contenuto statico dal content API.
 */
export async function getHotelRates(
  hotelId: string,
  params: Pick<
    RateHawkSearchParams,
    "checkin" | "checkout" | "adults" | "children" | "currency" | "residency" | "language"
  >
): Promise<RateHawkHotelDetail> {
  const language = params.language ?? "it";
  const currency = params.currency ?? "EUR";
  const guests = [{ adults: params.adults, children: params.children ?? [] }];

  const raw = await ratehawkPost<RawSerpResponse>(`${B2B_BASE}/search/hp/`, {
    id: hotelId,
    checkin: params.checkin,
    checkout: params.checkout,
    guests,
    currency,
    residency: params.residency ?? "it",
    language,
  });
  if (raw.status !== "ok" || raw.error || !raw.data) {
    throw new Error(`RateHawk hotel page error: ${raw.error ?? raw.status}`);
  }

  const rawHotel = raw.data.hotels?.[0];
  const rates: RateHawkRate[] = (rawHotel?.rates ?? []).map(mapRate);

  const content = await fetchContent([hotelId], language);
  const c = content.get(hotelId);
  const prices = rates.map((r) => r.price).filter((p) => p > 0);

  const hotel: RateHawkHotel = {
    id: hotelId,
    hid: rawHotel?.hid,
    name: c?.name ?? hotelId,
    starRating: c?.star_rating ?? 0,
    address: c?.address ?? "",
    city: c?.region?.name ?? "",
    latitude: c?.latitude ?? 0,
    longitude: c?.longitude ?? 0,
    images: c ? contentImages(c) : [],
    minPrice: prices.length ? Math.min(...prices) : 0,
    currency,
  };

  return { hotel, rates };
}

/**
 * Restituisce true se le variabili d'ambiente RateHawk sono configurate.
 */
export function isRateHawkConfigured(): boolean {
  return Boolean(
    process.env.RATEHAWK_KEY_ID &&
      process.env.RATEHAWK_KEY_ID !== "DA_AGGIUNGERE" &&
      process.env.RATEHAWK_API_KEY &&
      process.env.RATEHAWK_API_KEY !== "DA_AGGIUNGERE"
  );
}

// ─── Aviation ────────────────────────────────────────────────────────────────
// ATTENZIONE: la chiave sandbox 646 (APIR-50640) NON abilita alcun endpoint
// aviation (verificato via /overview/ il 2026-07-02: 0 endpoint avia/flight).
// RateHawk avia è un prodotto ETG separato. Finché non viene abilitato,
// il tab "Voli" deve mostrare un fallback (usa isRateHawkAviationEnabled()).

export type RateHawkFlightSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
  max?: number;
};

export type RateHawkFlightOffer = {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
  flightNumbers: string;
  duration: string;
  stops: number;
  adults: number;
  totalPrice: number;
  currency: string;
  bookingClass: string;
};

/** L'aviation è abilitata solo se esplicitamente attivata via env (contratto separato). */
export function isRateHawkAviationEnabled(): boolean {
  return process.env.RATEHAWK_AVIATION_ENABLED === "true";
}

/**
 * Ricerca voli. NON supportata dalla chiave attuale (nessun endpoint aviation).
 * Lancia un errore esplicito finché RateHawk non rilascia l'accesso avia.
 */
export async function searchFlights(
  _params: RateHawkFlightSearchParams
): Promise<RateHawkFlightOffer[]> {
  if (!isRateHawkAviationEnabled()) {
    throw new Error(
      "RateHawk aviation non disponibile su questa chiave (APIR-50640: solo hotel). " +
        "Richiedere l'accesso avia a apisupport@ratehawk.com e impostare RATEHAWK_AVIATION_ENABLED=true."
    );
  }
  // TODO: implementare quando l'endpoint avia sarà fornito e verificato in sandbox.
  throw new Error("RateHawk aviation: endpoint non ancora implementato.");
}

// ---------------------------------------------------------------------------
// Helpers di formattazione
// ---------------------------------------------------------------------------

const BOARD_LABELS: Record<string, string> = {
  nomeal: "Solo pernottamento",
  room_only: "Solo pernottamento",
  breakfast: "Colazione inclusa",
  half_board: "Mezza pensione",
  full_board: "Pensione completa",
  all_inclusive: "All inclusive",
};

export function formatBoardType(meal: string): string {
  return BOARD_LABELS[meal] ?? meal;
}

export function formatStars(n: number): string {
  return "★".repeat(Math.min(n, 5));
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFlightPrice(amount: number, currency: string): string {
  return formatPrice(amount, currency);
}
