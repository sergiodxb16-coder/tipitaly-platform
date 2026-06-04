import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isRateHawkConfigured,
  searchHotels,
  searchFlights,
  formatPrice,
  formatFlightPrice,
  formatStars,
  type RateHawkHotel,
  type RateHawkFlightOffer,
} from "@tip-italy/db/ratehawk";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Soggiorni e Viaggi — TipItaly Card" };
export const dynamic = "force-dynamic";

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
  const items = [
    { id: "home",    label: "Home",    emoji: "🏠", href: "/dashboard" },
    { id: "esplora", label: "Esplora", emoji: "🔍", href: "/dashboard/esplora" },
    { id: "wallet",  label: "Wallet",  emoji: "🎟️", href: "/dashboard/wallet" },
    { id: "tipa",    label: "Concierge", emoji: "✨", href: "/dashboard/tipa" },
    { id: "profilo", label: "Profilo", emoji: "👤", href: "/profilo" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link key={item.id} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              item.id === "esplora" ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Tier discounts
// ---------------------------------------------------------------------------

const TIER_DISCOUNT: Record<string, number> = {
  WHITE: 5,
  GOLD: 10,
  PLATINUM: 15,
};

function applyDiscount(price: number, level: string): number {
  const pct = TIER_DISCOUNT[level] ?? 0;
  return price * (1 - pct / 100);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function defaultCheckin(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function defaultCheckout(checkin: string): string {
  const d = new Date(checkin);
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}

function defaultDeparture(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function TierBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    WHITE: "bg-gray-100 text-gray-700",
    GOLD: "bg-amber-100 text-amber-800",
    PLATINUM: "bg-blue-100 text-blue-800",
  };
  const pct = TIER_DISCOUNT[level] ?? 0;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[level] ?? "bg-gray-100 text-gray-700"}`}>
      {level} {pct > 0 ? `· -${pct}%` : ""}
    </span>
  );
}

function HotelCard({
  hotel,
  cardLevel,
  checkin,
  checkout,
  adults,
}: {
  hotel: RateHawkHotel;
  cardLevel: string;
  checkin: string;
  checkout: string;
  adults: number;
}) {
  const thumbUrl =
    hotel.images[0] ?? "https://placehold.co/400x240/e2e8f0/64748b?text=Hotel";
  const discountedPrice = applyDiscount(hotel.minPrice, cardLevel);
  const discountPct = TIER_DISCOUNT[cardLevel] ?? 0;

  const params = new URLSearchParams({
    checkin,
    checkout,
    adults: String(adults),
    back: "1",
  }).toString();

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbUrl} alt={hotel.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <p className="text-xs text-amber-500 font-semibold tracking-wide">
          {formatStars(hotel.starRating)}
        </p>
        <p className="mt-1 font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {hotel.name}
        </p>
        <p className="mt-1 text-xs text-gray-500">{hotel.city}</p>
        {hotel.reviewScore && (
          <p className="mt-1 text-xs text-blue-600">
            ⭐ {hotel.reviewScore.toFixed(1)}
            {hotel.reviewCount
              ? ` · ${hotel.reviewCount.toLocaleString("it-IT")} rec.`
              : ""}
          </p>
        )}
        {hotel.minPrice > 0 && (
          <div className="mt-3">
            {discountPct > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(hotel.minPrice, hotel.currency)}
              </p>
            )}
            <p className="text-lg font-bold text-orange-600">
              {formatPrice(discountedPrice, hotel.currency)}
              <span className="text-xs font-normal text-gray-400 ml-1">/ notte</span>
            </p>
            {discountPct > 0 && (
              <p className="text-xs text-green-600 font-medium">
                Sconto {cardLevel} -{discountPct}% incluso
              </p>
            )}
          </div>
        )}
        <Link
          href={`/dashboard/travel/hotels/${hotel.id}?${params}`}
          className="mt-3 block text-center rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
        >
          Vedi tariffe →
        </Link>
      </div>
    </div>
  );
}

function FlightCard({
  offer,
  cardLevel,
}: {
  offer: RateHawkFlightOffer;
  cardLevel: string;
}) {
  const discountPct = TIER_DISCOUNT[cardLevel] ?? 0;
  const discountedPrice = applyDiscount(offer.totalPrice, cardLevel);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {offer.origin} → {offer.destination}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {offer.airline} · {offer.flightNumbers}
          </p>
        </div>
        <div className="text-right">
          {discountPct > 0 && (
            <p className="text-xs text-gray-400 line-through">
              {formatFlightPrice(offer.totalPrice, offer.currency)}
            </p>
          )}
          <p className="font-bold text-orange-600 text-base">
            {formatFlightPrice(discountedPrice, offer.currency)}
          </p>
          {discountPct > 0 && (
            <p className="text-xs text-green-600">-{discountPct}%</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 text-xs text-gray-600 mb-3">
        <span>📅 {offer.departureDate}</span>
        <span>⏱ {offer.duration}</span>
        <span>{offer.stops === 0 ? "Diretto" : `${offer.stops} scalo`}</span>
        {offer.returnDate && <span>↩ ritorno {offer.returnDate}</span>}
      </div>
      <BookFlightButton offer={offer} discountedPrice={discountedPrice} discountPct={discountPct} />
    </div>
  );
}

// Client component for flight booking button
function BookFlightButton({
  offer,
  discountedPrice,
  discountPct,
}: {
  offer: RateHawkFlightOffer;
  discountedPrice: number;
  discountPct: number;
}) {
  // We use a form action since this is a server component tree
  // Client interaction is handled via the API route
  return (
    <form action="/api/travel/flights" method="POST" className="flex justify-end">
      <input type="hidden" name="offerId" value={offer.id} />
      <input type="hidden" name="origin" value={offer.origin} />
      <input type="hidden" name="destination" value={offer.destination} />
      <input type="hidden" name="departureDate" value={offer.departureDate} />
      {offer.returnDate && <input type="hidden" name="returnDate" value={offer.returnDate} />}
      <input type="hidden" name="airline" value={offer.airline} />
      <input type="hidden" name="flightNumbers" value={offer.flightNumbers} />
      <input type="hidden" name="adults" value={String(offer.adults)} />
      <input type="hidden" name="basePrice" value={String(offer.totalPrice)} />
      <input type="hidden" name="currency" value={offer.currency} />
      <Link
        href={`/dashboard/travel/flights/book?offerId=${encodeURIComponent(offer.id)}&origin=${offer.origin}&destination=${offer.destination}&departureDate=${offer.departureDate}${offer.returnDate ? `&returnDate=${offer.returnDate}` : ""}&airline=${encodeURIComponent(offer.airline)}&flightNumbers=${encodeURIComponent(offer.flightNumbers)}&adults=${offer.adults}&basePrice=${offer.totalPrice}&currency=${offer.currency}`}
        className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
      >
        Prenota →
      </Link>
    </form>
  );
}

function HotelSearchForm({
  destination,
  checkin,
  checkout,
  adults,
}: {
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
}) {
  return (
    <form method="GET" className="rounded-xl border border-gray-200 bg-white p-4 mb-6 shadow-sm">
      <input type="hidden" name="tab" value="hotels" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Destinazione</label>
          <input
            name="destination"
            defaultValue={destination}
            placeholder="es. Roma, Venezia, Milano…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
          <input
            type="date"
            name="checkin"
            defaultValue={checkin}
            min={todayStr()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
          <input
            type="date"
            name="checkout"
            defaultValue={checkout}
            min={tomorrowStr()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Adulti</label>
          <select
            name="adults"
            defaultValue={adults}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "adulto" : "adulti"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="mt-3 w-full sm:w-auto rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
      >
        Cerca hotel →
      </button>
    </form>
  );
}

function FlightSearchForm({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
}: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
}) {
  return (
    <form method="GET" className="rounded-xl border border-gray-200 bg-white p-4 mb-6 shadow-sm">
      <input type="hidden" name="tab" value="flights" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Partenza (IATA)</label>
          <input
            name="origin"
            defaultValue={origin}
            placeholder="es. FCO, MXP, VCE"
            maxLength={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Destinazione (IATA)</label>
          <input
            name="flightDest"
            defaultValue={destination}
            placeholder="es. CDG, LHR, BCN"
            maxLength={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data partenza</label>
          <input
            type="date"
            name="departureDate"
            defaultValue={departureDate}
            min={todayStr()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data ritorno (opz.)</label>
          <input
            type="date"
            name="returnDate"
            defaultValue={returnDate}
            min={tomorrowStr()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Passeggeri</label>
          <select
            name="flightAdults"
            defaultValue={adults}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "passeggero" : "passeggeri"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="mt-3 w-full sm:w-auto rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
      >
        Cerca voli →
      </button>
    </form>
  );
}

type EditorialOffer = {
  id: string;
  titolo: string;
  destinazione: string;
  scontoPercent: string | number;
  travelAdvantageUrl?: string | null;
  scadenza?: Date | null;
};

function EditorialOffers({ offers, cardLevel }: { offers: EditorialOffer[]; cardLevel: string }) {
  if (offers.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        ✨ Offerte curate per te
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {offers.map((o) => {
          const scontoNum = Number(o.scontoPercent);
          const tierPct = TIER_DISCOUNT[cardLevel] ?? 0;
          const totalDiscount = Math.min(scontoNum + tierPct, 80);
          return (
            <div
              key={o.id}
              className="rounded-xl border border-amber-100 bg-amber-50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{o.titolo}</p>
                  <p className="text-xs text-gray-600 mt-0.5">📍 {o.destinazione}</p>
                </div>
                <span className="shrink-0 rounded-full bg-orange-600 text-white text-xs font-bold px-2.5 py-0.5">
                  -{totalDiscount}%
                </span>
              </div>
              {o.scadenza && (
                <p className="text-xs text-gray-400 mt-2">
                  Fino al{" "}
                  {new Date(o.scadenza).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
              )}
              {o.travelAdvantageUrl && (
                <a
                  href={o.travelAdvantageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center rounded-lg border border-orange-600 px-4 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Scopri l&apos;offerta →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type SearchParams = {
  tab?: string;
  destination?: string;
  checkin?: string;
  checkout?: string;
  adults?: string;
  origin?: string;
  flightDest?: string;
  departureDate?: string;
  returnDate?: string;
  flightAdults?: string;
};

export default async function TravelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // 1. Cardholder
  const { data: cardholder } = await admin
    .from("Cardholder")
    .select("id, email, nome, cognome")
    .eq("supabaseUid", user.id)
    .maybeSingle();

  if (!cardholder) redirect("/onboarding");

  // 2. Card assignment (più recente)
  const { data: assignmentRow } = await admin
    .from("CardAssignment")
    .select("id, Card(id, level, status)")
    .eq("cardholderId", cardholder.id)
    .order("assignedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = assignmentRow?.Card as any;
  const isCardActive = card?.status === "ACTIVE";
  const cardLevel = (card?.level ?? "WHITE") as string;
  const discountPct = TIER_DISCOUNT[cardLevel] ?? 0;

  const sp = await searchParams;
  const activeTab = sp.tab ?? "hotels";

  // Hotel search params
  const destination = sp.destination?.trim() ?? "";
  const checkin = sp.checkin ?? defaultCheckin();
  const checkout = sp.checkout ?? defaultCheckout(checkin);
  const adults = Math.max(1, parseInt(sp.adults ?? "2", 10) || 2);

  // Flight search params
  const flightOrigin = (sp.origin ?? "").toUpperCase().trim();
  const flightDest = (sp.flightDest ?? "").toUpperCase().trim();
  const departureDate = sp.departureDate ?? defaultDeparture();
  const returnDate = sp.returnDate ?? "";
  const flightAdults = Math.max(1, parseInt(sp.flightAdults ?? "1", 10) || 1);

  const hotelApiReady = isRateHawkConfigured();
  const flightApiReady = isRateHawkConfigured();

  // Hotel search
  let hotels: RateHawkHotel[] = [];
  let hotelError: string | null = null;
  const didHotelSearch = isCardActive && hotelApiReady && destination.length > 0;

  if (didHotelSearch) {
    try {
      const result = await searchHotels({ destination, checkin, checkout, adults, currency: "EUR" });
      hotels = result.hotels;
    } catch (err) {
      console.error("[RateHawk] Errore ricerca:", err);
      hotelError = "Impossibile recuperare i risultati. Riprova tra qualche istante.";
    }
  }

  // Flight search
  let flights: RateHawkFlightOffer[] = [];
  let flightError: string | null = null;
  const didFlightSearch =
    isCardActive &&
    flightApiReady &&
    flightOrigin.length === 3 &&
    flightDest.length === 3;

  if (didFlightSearch) {
    try {
      flights = await searchFlights({
        origin: flightOrigin,
        destination: flightDest,
        departureDate,
        returnDate: returnDate || undefined,
        adults: flightAdults,
        currency: "EUR",
        max: 10,
      });
    } catch (err) {
      console.error("[RateHawk avia] Errore ricerca:", err);
      flightError = "Impossibile recuperare i voli. Riprova tra qualche istante.";
    }
  }

  // Editorial offers (fallback + curated section)
  const { data: editorialOffersRaw } = await admin
    .from("TravelOffer")
    .select("id, titolo, destinazione, scontoPercent, travelAdvantageUrl, scadenza, minCardLevel, isActive")
    .eq("isActive", true)
    .or(`scadenza.is.null,scadenza.gt.${new Date().toISOString()}`)
    .order("scadenza", { ascending: true, nullsFirst: false })
    .limit(6);

  const editorialOffers = (editorialOffersRaw ?? []).map((o) => ({
    ...o,
    scadenza: o.scadenza ? new Date(o.scadenza) : null,
    scontoPercent: o.scontoPercent,
  }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
    <div className="mx-auto max-w-5xl px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soggiorni e Viaggi</h1>
          {isCardActive && (
            <div className="mt-1 flex items-center gap-2">
              <TierBadge level={cardLevel} />
              {discountPct > 0 && (
                <span className="text-xs text-green-600">
                  I prezzi mostrati includono il tuo sconto esclusivo -{discountPct}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isCardActive && (
            <Link
              href="/dashboard/travel/bookings"
              className="text-sm text-orange-600 hover:underline"
            >
              Le mie prenotazioni
            </Link>
          )}
          <Link href="/dashboard" className="text-sm text-gray-400 hover:underline">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Card non attiva */}
      {!isCardActive && (
        <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-8 text-center">
          <p className="font-semibold text-orange-700">Card non attiva</p>
          <p className="mt-2 text-sm text-orange-600">
            Attiva la tua card per accedere ai vantaggi di viaggio.
          </p>
          <Link
            href="/attivazione"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Attiva la card →
          </Link>
        </div>
      )}

      {isCardActive && (
        <>
          {/* Banner */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✈️</span>
              <div>
                <h2 className="font-semibold text-blue-900 text-base">
                  Soggiorni e voli esclusivi per i titolari TipItaly
                </h2>
                <p className="mt-1 text-sm text-blue-700">
                  Hotel in oltre 2,9 milioni di strutture + voli da tutti i principali aeroporti italiani — a tariffe riservate ai cardholder{discountPct > 0 ? `, con sconto ${cardLevel} -${discountPct}% già applicato` : ""}.
                </p>
                {cardLevel === "PLATINUM" && (
                  <p className="mt-1 text-xs text-blue-600 font-medium">
                    🛋️ Accesso lounge aeroportuale incluso con la tua card Platinum
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            <Link
              href="?tab=hotels"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "hotels"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🏨 Hotel
            </Link>
            <Link
              href="?tab=flights"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "flights"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              ✈️ Voli
            </Link>
          </div>

          {/* ─── Hotels tab ─── */}
          {activeTab === "hotels" && (
            <>
              {!hotelApiReady && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center mb-6">
                  <p className="text-sm font-semibold text-amber-800">
                    🔧 Motore di ricerca hotel in fase di attivazione
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    Stiamo ultimando la configurazione con il nostro partner. Nel frattempo puoi esplorare le offerte curate qui sotto.
                  </p>
                </div>
              )}

              {hotelApiReady && (
                <HotelSearchForm
                  destination={destination}
                  checkin={checkin}
                  checkout={checkout}
                  adults={adults}
                />
              )}

              {hotelError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700">
                  ⚠️ {hotelError}
                </div>
              )}

              {hotels.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    <strong>{hotels.length}</strong> strutture trovate per &ldquo;{destination}&rdquo; ·{" "}
                    {checkin} → {checkout} · {adults} {adults === 1 ? "adulto" : "adulti"}
                    {discountPct > 0 && (
                      <span className="text-green-600 ml-1">
                        · Sconto -{discountPct}% già applicato
                      </span>
                    )}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {hotels.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        cardLevel={cardLevel}
                        checkin={checkin}
                        checkout={checkout}
                        adults={adults}
                      />
                    ))}
                  </div>
                </>
              )}

              {didHotelSearch && hotels.length === 0 && !hotelError && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Nessuna struttura trovata per &ldquo;{destination}&rdquo; nelle date selezionate.
                    <br />
                    Prova con una destinazione diversa o modifica le date.
                  </p>
                </div>
              )}

              {hotelApiReady && !destination && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
                  <p className="text-3xl mb-3">🏨</p>
                  <p className="text-sm text-gray-500">
                    Inserisci una destinazione per trovare hotel disponibili.
                  </p>
                </div>
              )}

              <EditorialOffers offers={editorialOffers} cardLevel={cardLevel} />
            </>
          )}

          {/* ─── Flights tab ─── */}
          {activeTab === "flights" && (
            <>
              {!flightApiReady && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center mb-6">
                  <p className="text-sm font-semibold text-amber-800">
                    🔧 Motore di ricerca voli in fase di attivazione
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    Stiamo ultimando la configurazione con il nostro partner aereo. Nel frattempo puoi esplorare le offerte curate qui sotto.
                  </p>
                </div>
              )}

              {flightApiReady && (
                <FlightSearchForm
                  origin={flightOrigin}
                  destination={flightDest}
                  departureDate={departureDate}
                  returnDate={returnDate}
                  adults={flightAdults}
                />
              )}

              {flightError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700">
                  ⚠️ {flightError}
                </div>
              )}

              {flights.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    <strong>{flights.length}</strong> voli trovati: {flightOrigin} → {flightDest} ·{" "}
                    {departureDate}
                    {returnDate ? ` · ritorno ${returnDate}` : ""}
                    {" · "}
                    {flightAdults} {flightAdults === 1 ? "passeggero" : "passeggeri"}
                    {discountPct > 0 && (
                      <span className="text-green-600 ml-1">
                        · Sconto -{discountPct}% già applicato
                      </span>
                    )}
                  </p>
                  <div className="space-y-3">
                    {flights.map((f) => (
                      <FlightCard key={f.id} offer={f} cardLevel={cardLevel} />
                    ))}
                  </div>
                </>
              )}

              {didFlightSearch && flights.length === 0 && !flightError && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Nessun volo trovato per {flightOrigin} → {flightDest} in data {departureDate}.
                    <br />
                    Prova con date diverse o aeroporti alternativi.
                  </p>
                </div>
              )}

              {flightApiReady && (!flightOrigin || !flightDest) && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
                  <p className="text-3xl mb-3">✈️</p>
                  <p className="text-sm text-gray-500">
                    Inserisci aeroporto di partenza e destinazione (codice IATA, es. FCO, CDG) per cercare i voli disponibili.
                  </p>
                </div>
              )}

              <EditorialOffers offers={editorialOffers} cardLevel={cardLevel} />
            </>
          )}
        </>
      )}
    </div>
    <BottomNav />
    </>
  );
}
