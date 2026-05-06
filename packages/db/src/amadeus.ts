/**
 * amadeus.ts — client per l'API Amadeus (voli)
 *
 * Documentazione: https://developers.amadeus.com/self-service/category/flights
 * Auth: OAuth2 client-credentials, token endpoint:
 *   POST https://api.amadeus.com/v1/security/oauth2/token
 *
 * Variabili d'ambiente richieste:
 *   AMADEUS_CLIENT_ID     — Client ID da Amadeus Developer Portal
 *   AMADEUS_CLIENT_SECRET — Client Secret da Amadeus Developer Portal
 *   AMADEUS_ENV           — "test" oppure "production" (default: "test")
 */

const BASE_TEST = "https://test.api.amadeus.com";
const BASE_PROD = "https://api.amadeus.com";

function getBase(): string {
  return process.env.AMADEUS_ENV === "production" ? BASE_PROD : BASE_TEST;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AmadeusFlightOffer = {
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

export type AmadeusSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
  nonStop?: boolean;
  max?: number;
};

// ---------------------------------------------------------------------------
// OAuth2 token cache (in-memory, 29-min TTL)
// ---------------------------------------------------------------------------

type TokenCache = { token: string; expiresAt: number };
let _tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AMADEUS_CLIENT_ID e AMADEUS_CLIENT_SECRET non configurate");
  }

  const res = await fetch(`${getBase()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus token error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return _tokenCache.token;
}

// ---------------------------------------------------------------------------
// IATA airline name mapping (partial)
// ---------------------------------------------------------------------------

const AIRLINE_NAMES: Record<string, string> = {
  AZ: "ITA Airways", FR: "Ryanair", U2: "easyJet", VY: "Vueling",
  LH: "Lufthansa", AF: "Air France", BA: "British Airways", KL: "KLM",
  IB: "Iberia", TP: "TAP Air Portugal", EK: "Emirates", TK: "Turkish Airlines",
  W6: "Wizz Air", EN: "Air Dolomiti", EW: "Eurowings",
};

function airlineName(code: string): string {
  return AIRLINE_NAMES[code] ?? code;
}

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ? `${m[1]}h` : "";
  const min = m[2] ? ` ${m[2]}m` : "";
  return `${h}${min}`.trim();
}

// ---------------------------------------------------------------------------
// Raw Amadeus response types
// ---------------------------------------------------------------------------

type RawItinerary = {
  duration: string;
  segments: Array<{
    departure: { iataCode: string; at: string };
    arrival: { iataCode: string; at: string };
    carrierCode: string;
    number: string;
    numberOfStops: number;
  }>;
};

type RawOffer = {
  id: string;
  itineraries: RawItinerary[];
  price: { total: string; currency: string };
  travelerPricings: Array<{ fareDetailsBySegment: Array<{ cabin: string }> }>;
};

type RawSearchResponse = {
  data: RawOffer[];
  errors?: Array<{ title: string; detail: string }>;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function searchFlights(
  params: AmadeusSearchParams
): Promise<AmadeusFlightOffer[]> {
  const token = await getAccessToken();

  const qs = new URLSearchParams({
    originLocationCode: params.origin.toUpperCase(),
    destinationLocationCode: params.destination.toUpperCase(),
    departureDate: params.departureDate,
    adults: String(params.adults ?? 1),
    currencyCode: params.currency ?? "EUR",
    nonStop: String(params.nonStop ?? false),
    max: String(params.max ?? 10),
  });
  if (params.returnDate) qs.set("returnDate", params.returnDate);

  const res = await fetch(
    `${getBase()}/v2/shopping/flight-offers?${qs}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus flight search error ${res.status}: ${text.slice(0, 200)}`);
  }

  const raw = await res.json() as RawSearchResponse;
  if (raw.errors?.length) {
    throw new Error(`Amadeus error: ${raw.errors[0].detail}`);
  }

  return (raw.data ?? []).map((offer): AmadeusFlightOffer => {
    const outbound = offer.itineraries[0];
    const firstSeg = outbound.segments[0];
    const lastSeg = outbound.segments[outbound.segments.length - 1];
    const returnItinerary = offer.itineraries[1];

    const flightNums = outbound.segments
      .map((s) => `${s.carrierCode}${s.number}`)
      .join(", ");

    const returnDate = returnItinerary
      ? returnItinerary.segments[0].departure.at.slice(0, 10)
      : undefined;

    const cabin =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? "ECONOMY";

    return {
      id: offer.id,
      origin: firstSeg.departure.iataCode,
      destination: lastSeg.arrival.iataCode,
      departureDate: firstSeg.departure.at.slice(0, 10),
      returnDate,
      airline: airlineName(firstSeg.carrierCode),
      flightNumbers: flightNums,
      duration: parseDuration(outbound.duration),
      stops: outbound.segments.length - 1,
      adults: params.adults ?? 1,
      totalPrice: parseFloat(offer.price.total),
      currency: offer.price.currency,
      bookingClass: cabin,
    };
  });
}

export function isAmadeusConfigured(): boolean {
  return Boolean(
    process.env.AMADEUS_CLIENT_ID &&
      process.env.AMADEUS_CLIENT_ID !== "DA_AGGIUNGERE" &&
      process.env.AMADEUS_CLIENT_SECRET &&
      process.env.AMADEUS_CLIENT_SECRET !== "DA_AGGIUNGERE"
  );
}

export function formatFlightPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
