/**
 * ratehawk.ts — client per l'API B2B RateHawk / WorldOta
 *
 * Documentazione: https://www.ratehawk.com/my/settings/?tab=api
 * Base URL: https://api.worldota.net/api/b2b/v3/
 * Auth: HTTP Basic (KEY_ID : API_KEY base64-encoded)
 *
 * Variabili d'ambiente richieste:
 *   RATEHAWK_KEY_ID  — Key ID fornito da RateHawk
 *   RATEHAWK_API_KEY — API Key fornita da RateHawk
 */

const RATEHAWK_BASE = "https://api.worldota.net/api/b2b/v3";

// ---------------------------------------------------------------------------
// Tipi pubblici
// ---------------------------------------------------------------------------

export type RateHawkSearchParams = {
  /** Destinazione libera (città, regione, ID) — oppure usa hotelId per hotel singolo */
  destination?: string;
  /** ID WorldOta di un hotel specifico */
  hotelId?: string;
  checkin: string;   // "YYYY-MM-DD"
  checkout: string;  // "YYYY-MM-DD"
  adults: number;
  children?: number[];  // età di ogni bambino
  currency?: string;    // default: EUR
  residency?: string;   // default: it
  language?: string;    // default: it
};

export type RateHawkHotel = {
  id: string;
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
  bookHash: string;
  roomName: string;
  boardType: string;  // es. "breakfast", "all_inclusive"
  price: number;
  currency: string;
  cancellationPolicy: string;
  availableRooms: number;
};

export type RateHawkSearchResult = {
  hotels: RateHawkHotel[];
  searchId: string;
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
    throw new Error(
      "Variabili RATEHAWK_KEY_ID e RATEHAWK_API_KEY non configurate"
    );
  }
  const token = Buffer.from(`${keyId}:${apiKey}`).toString("base64");
  return `Basic ${token}`;
}

async function ratehawkPost<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${RATEHAWK_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
    // nessuna cache — prezzi in tempo reale
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `RateHawk API error ${res.status} su ${endpoint}: ${text.slice(0, 200)}`
    );
  }

  return res.json() as Promise<T>;
}

async function ratehawkGet<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${RATEHAWK_BASE}${endpoint}?${qs}`, {
    headers: { Authorization: getAuthHeader() },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `RateHawk API error ${res.status} su ${endpoint}: ${text.slice(0, 200)}`
    );
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Risposta raw RateHawk (struttura semplificata per il mapping)
// ---------------------------------------------------------------------------

type RawSerpHotel = {
  id: string;
  name: string;
  star_rating: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  min_price: { amount: string; currency_code: string } | null;
  rating: { score: number; count: number } | null;
};

type RawSerpResponse = {
  data: { hotels: RawSerpHotel[]; search_id: string };
  status: string;
  error?: string | null;
};

type RawHotelInfoResponse = {
  data: {
    id: string;
    name: string;
    star_rating: number;
    address: string;
    city_name: string;
    latitude: number;
    longitude: number;
    images: string[];
    rates: Array<{
      book_hash: string;
      room_name: string;
      meal: string;
      payment_options: { payment_types: Array<{ amount: string; currency_code: string }> };
      cancellation_penalty: { policies: Array<{ start_at: string | null; amount: string }> };
      rooms_available: number;
    }>;
    rating: { score: number; count: number } | null;
  };
  status: string;
  error?: string | null;
};

// ---------------------------------------------------------------------------
// In-memory cache (TTL 5 minuti)
// ---------------------------------------------------------------------------

type CacheEntry<T> = { data: T; expiresAt: number };
const _searchCache = new Map<string, CacheEntry<RateHawkSearchResult>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(params: RateHawkSearchParams): string {
  return JSON.stringify({
    d: params.destination ?? params.hotelId,
    ci: params.checkin,
    co: params.checkout,
    a: params.adults,
    cur: params.currency ?? "EUR",
  });
}

// ---------------------------------------------------------------------------
// API pubblica
// ---------------------------------------------------------------------------

/**
 * Cerca hotel per destinazione o hotel singolo.
 * Restituisce una lista di hotel con prezzo minimo.
 * Risultati cachati per 5 minuti per ridurre costi API.
 */
export async function searchHotels(
  params: RateHawkSearchParams
): Promise<RateHawkSearchResult> {
  const key = cacheKey(params);
  const cached = _searchCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const guests: Array<{ adults: number; children: number[] }> = [
    { adults: params.adults, children: params.children ?? [] },
  ];

  const body: Record<string, unknown> = {
    checkin: params.checkin,
    checkout: params.checkout,
    guests,
    currency: params.currency ?? "EUR",
    residency: params.residency ?? "it",
    language: params.language ?? "it",
  };

  if (params.hotelId) {
    body["id"] = params.hotelId;
  } else {
    body["region"] = { name: params.destination ?? "" };
  }

  const raw = await ratehawkPost<RawSerpResponse>(
    "/hotel/search/multicomplete/",
    body
  );

  if (raw.status !== "ok" || raw.error) {
    throw new Error(`RateHawk search error: ${raw.error ?? raw.status}`);
  }

  const hotels: RateHawkHotel[] = (raw.data.hotels ?? []).map((h) => ({
    id: h.id,
    name: h.name,
    starRating: h.star_rating ?? 0,
    address: h.address ?? "",
    city: h.city ?? "",
    latitude: h.latitude ?? 0,
    longitude: h.longitude ?? 0,
    images: h.images?.slice(0, 3) ?? [],
    minPrice: h.min_price ? parseFloat(h.min_price.amount) : 0,
    currency: h.min_price?.currency_code ?? (params.currency ?? "EUR"),
    reviewScore: h.rating?.score,
    reviewCount: h.rating?.count,
  }));

  const result: RateHawkSearchResult = { hotels, searchId: raw.data.search_id };
  _searchCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

/**
 * Recupera dettaglio di un hotel con tariffe disponibili.
 */
export async function getHotelRates(
  hotelId: string,
  params: Pick<RateHawkSearchParams, "checkin" | "checkout" | "adults" | "children" | "currency">
): Promise<RateHawkHotelDetail> {
  const guests = [
    { adults: params.adults, children: params.children ?? [] },
  ];

  const body = {
    id: hotelId,
    checkin: params.checkin,
    checkout: params.checkout,
    guests,
    currency: params.currency ?? "EUR",
    residency: "it",
    language: "it",
  };

  const raw = await ratehawkPost<RawHotelInfoResponse>(
    "/hotel/info/",
    body
  );

  if (raw.status !== "ok" || raw.error) {
    throw new Error(`RateHawk hotel info error: ${raw.error ?? raw.status}`);
  }

  const d = raw.data;

  const hotel: RateHawkHotel = {
    id: d.id,
    name: d.name,
    starRating: d.star_rating ?? 0,
    address: d.address ?? "",
    city: d.city_name ?? "",
    latitude: d.latitude ?? 0,
    longitude: d.longitude ?? 0,
    images: d.images?.slice(0, 5) ?? [],
    minPrice: 0,
    currency: params.currency ?? "EUR",
    reviewScore: d.rating?.score,
    reviewCount: d.rating?.count,
  };

  const rates: RateHawkRate[] = (d.rates ?? []).map((r) => {
    const paymentType = r.payment_options.payment_types?.[0];
    const price = paymentType ? parseFloat(paymentType.amount) : 0;
    const currency = paymentType?.currency_code ?? (params.currency ?? "EUR");

    const firstCancellation = r.cancellation_penalty?.policies?.[0];
    const cancellationPolicy = firstCancellation?.start_at
      ? `Cancellazione gratuita fino al ${firstCancellation.start_at.slice(0, 10)}`
      : "Non rimborsabile";

    return {
      bookHash: r.book_hash,
      roomName: r.room_name,
      boardType: r.meal ?? "room_only",
      price,
      currency,
      cancellationPolicy,
      availableRooms: r.rooms_available ?? 1,
    };
  });

  // Imposta prezzo minimo sul hotel
  if (rates.length > 0) {
    hotel.minPrice = Math.min(...rates.map((r) => r.price));
  }

  return { hotel, rates };
}

/**
 * Restituisce true se le variabili d'ambiente RateHawk sono configurate.
 * Utile per mostrare un fallback UI quando l'API non è ancora attiva.
 */
export function isRateHawkConfigured(): boolean {
  return Boolean(
    process.env.RATEHAWK_KEY_ID &&
      process.env.RATEHAWK_KEY_ID !== "DA_AGGIUNGERE" &&
      process.env.RATEHAWK_API_KEY &&
      process.env.RATEHAWK_API_KEY !== "DA_AGGIUNGERE"
  );
}

// ---------------------------------------------------------------------------
// Helpers di formattazione
// ---------------------------------------------------------------------------

const BOARD_LABELS: Record<string, string> = {
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
