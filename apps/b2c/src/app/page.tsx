import Link from "next/link";

// ---------------------------------------------------------------------------
// Mock RateHawk data
// ---------------------------------------------------------------------------

type MockHotel = {
  id: string;
  name: string;
  city: string;
  starRating: number;
  image: string;
  minPrice: number;
  currency: string;
  reviewScore: number;
  reviewCount: number;
  tags: string[];
};

type MockFlight = {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
};

const MOCK_HOTELS: MockHotel[] = [
  {
    id: "rh-roma-01",
    name: "Hotel Colosseo Roma",
    city: "Roma",
    starRating: 4,
    image: "https://placehold.co/400x240/f8c171/7c3909?text=Roma",
    minPrice: 120,
    currency: "EUR",
    reviewScore: 8.6,
    reviewCount: 2341,
    tags: ["Centro storico", "Vista Colosseo"],
  },
  {
    id: "rh-firenze-01",
    name: "Grand Hotel Firenze",
    city: "Firenze",
    starRating: 5,
    image: "https://placehold.co/400x240/d4a017/5a3e10?text=Firenze",
    minPrice: 195,
    currency: "EUR",
    reviewScore: 9.1,
    reviewCount: 1876,
    tags: ["Luxury", "Spa", "Vista Arno"],
  },
  {
    id: "rh-venezia-01",
    name: "Ca' Dei Dogi Venezia",
    city: "Venezia",
    starRating: 4,
    image: "https://placehold.co/400x240/4a90d9/1a3a5c?text=Venezia",
    minPrice: 165,
    currency: "EUR",
    reviewScore: 8.9,
    reviewCount: 1423,
    tags: ["Canal Grande", "Palazzo storico"],
  },
  {
    id: "rh-milano-01",
    name: "Excelsior Hotel Gallia Milano",
    city: "Milano",
    starRating: 5,
    image: "https://placehold.co/400x240/6c757d/343a40?text=Milano",
    minPrice: 210,
    currency: "EUR",
    reviewScore: 9.3,
    reviewCount: 3210,
    tags: ["Business", "Luxury", "Centrale FS"],
  },
  {
    id: "rh-napoli-01",
    name: "Grand Hotel Vesuvio Napoli",
    city: "Napoli",
    starRating: 4,
    image: "https://placehold.co/400x240/e74c3c/7b241c?text=Napoli",
    minPrice: 98,
    currency: "EUR",
    reviewScore: 8.4,
    reviewCount: 987,
    tags: ["Vista golfo", "Lungomare"],
  },
  {
    id: "rh-capri-01",
    name: "La Palma Hotel Capri",
    city: "Capri",
    starRating: 5,
    image: "https://placehold.co/400x240/27ae60/145a32?text=Capri",
    minPrice: 280,
    currency: "EUR",
    reviewScore: 9.5,
    reviewCount: 654,
    tags: ["Isola", "Piscina infinity", "Luxury"],
  },
  {
    id: "rh-sardegna-01",
    name: "Su Gologone Resort Sardegna",
    city: "Oliena",
    starRating: 4,
    image: "https://placehold.co/400x240/16a085/0e6655?text=Sardegna",
    minPrice: 145,
    currency: "EUR",
    reviewScore: 9.0,
    reviewCount: 521,
    tags: ["Resort", "Natura", "Piscina"],
  },
  {
    id: "rh-amalfi-01",
    name: "Luna Convento Amalfi",
    city: "Amalfi",
    starRating: 4,
    image: "https://placehold.co/400x240/8e44ad/4a235a?text=Amalfi",
    minPrice: 175,
    currency: "EUR",
    reviewScore: 8.8,
    reviewCount: 789,
    tags: ["Costiera", "Storico", "Vista mare"],
  },
];

const MOCK_FLIGHTS: MockFlight[] = [
  {
    id: "rh-flt-01",
    origin: "FCO",
    destination: "CDG",
    airline: "ITA Airways",
    flightNumber: "AZ318",
    departureTime: "08:20",
    duration: "2h 15m",
    stops: 0,
    price: 89,
    currency: "EUR",
  },
  {
    id: "rh-flt-02",
    origin: "MXP",
    destination: "LHR",
    airline: "easyJet",
    flightNumber: "EZY1234",
    departureTime: "06:45",
    duration: "2h 05m",
    stops: 0,
    price: 64,
    currency: "EUR",
  },
  {
    id: "rh-flt-03",
    origin: "VCE",
    destination: "BCN",
    airline: "Vueling",
    flightNumber: "VY1890",
    departureTime: "11:30",
    duration: "2h 30m",
    stops: 0,
    price: 72,
    currency: "EUR",
  },
  {
    id: "rh-flt-04",
    origin: "NAP",
    destination: "AMS",
    airline: "KLM",
    flightNumber: "KL1604",
    departureTime: "14:10",
    duration: "3h 10m",
    stops: 0,
    price: 118,
    currency: "EUR",
  },
  {
    id: "rh-flt-05",
    origin: "FCO",
    destination: "ATH",
    airline: "Aegean Airlines",
    flightNumber: "A3604",
    departureTime: "09:55",
    duration: "2h 45m",
    stops: 0,
    price: 96,
    currency: "EUR",
  },
  {
    id: "rh-flt-06",
    origin: "MXP",
    destination: "MAD",
    airline: "Iberia",
    flightNumber: "IB3246",
    departureTime: "16:25",
    duration: "2h 20m",
    stops: 0,
    price: 83,
    currency: "EUR",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStars(n: number): string {
  return "★".repeat(Math.min(n, 5));
}

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
// Sub-components
// ---------------------------------------------------------------------------

function HotelCard({ hotel }: { hotel: MockHotel }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hotel.image} alt={hotel.name} className="w-full h-44 object-cover" />
      <div className="p-4">
        <p className="text-xs text-amber-500 font-bold tracking-wide">{formatStars(hotel.starRating)}</p>
        <p className="mt-1 font-semibold text-gray-900 text-sm leading-snug">{hotel.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">📍 {hotel.city}</p>
        <p className="text-xs text-indigo-500 mt-1">
          ⭐ {hotel.reviewScore.toFixed(1)}{" "}
          <span className="text-gray-400">· {hotel.reviewCount.toLocaleString("it-IT")} rec.</span>
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {hotel.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-brand-50 text-brand-700 text-xs px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-brand-600">
              {formatPrice(hotel.minPrice, hotel.currency)}
            </p>
            <p className="text-xs text-gray-400">/ notte</p>
          </div>
          <Link
            href="/auth/login"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Prenota →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FlightCard({ flight }: { flight: MockFlight }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{flight.origin}</p>
              <p className="text-xs text-gray-400">{flight.departureTime}</p>
            </div>
            <div className="flex-1 flex flex-col items-center px-3">
              <p className="text-xs text-gray-400">{flight.duration}</p>
              <div className="w-full flex items-center gap-1 my-1">
                <div className="h-px flex-1 bg-gray-200" />
                <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <p className="text-xs text-gray-400">{flight.stops === 0 ? "Diretto" : `${flight.stops} scalo`}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{flight.destination}</p>
              <p className="text-xs text-gray-400">{flight.airline}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {flight.airline} · {flight.flightNumber}
          </p>
        </div>
        <div className="ml-4 text-right shrink-0">
          <p className="text-2xl font-bold text-brand-600">{formatPrice(flight.price, flight.currency)}</p>
          <p className="text-xs text-gray-400">/ persona</p>
          <Link
            href="/auth/login"
            className="mt-2 inline-block rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Prenota →
          </Link>
        </div>
      </div>
    </div>
  );
}

function MemberBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white mb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-base">Sei un membro TipItaly? Ottieni fino al 15% di sconto.</p>
          <p className="text-sm text-brand-100 mt-0.5">
            Accedi con la tua card per vedere i prezzi scontati in tempo reale.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors"
        >
          Accedi →
        </Link>
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const activeTab = sp.tab ?? "hotels";

  // Hotel params
  const destination = sp.destination?.trim() ?? "";
  const checkin = sp.checkin ?? defaultCheckin();
  const checkout = sp.checkout ?? defaultCheckout(checkin);
  const adults = Math.max(1, parseInt(sp.adults ?? "2", 10) || 2);

  // Flight params
  const flightOrigin = (sp.origin ?? "").toUpperCase().trim();
  const flightDest = (sp.flightDest ?? "").toUpperCase().trim();
  const departureDate = sp.departureDate ?? defaultDeparture();
  const returnDate = sp.returnDate ?? "";
  const flightAdults = Math.max(1, parseInt(sp.flightAdults ?? "1", 10) || 1);

  // Filter mock data
  const didHotelSearch = destination.length > 0;
  const didFlightSearch = flightOrigin.length === 3 && flightDest.length === 3;

  const filteredHotels = didHotelSearch
    ? MOCK_HOTELS.filter(
        (h) =>
          h.city.toLowerCase().includes(destination.toLowerCase()) ||
          h.name.toLowerCase().includes(destination.toLowerCase())
      ).concat(
        // fallback: show all if no match
        MOCK_HOTELS.filter(
          (h) =>
            !h.city.toLowerCase().includes(destination.toLowerCase()) &&
            !h.name.toLowerCase().includes(destination.toLowerCase())
        )
      ).slice(0, 6)
    : [];

  const filteredFlights = didFlightSearch
    ? MOCK_FLIGHTS.filter(
        (f) => f.origin === flightOrigin || f.destination === flightDest
      ).concat(
        MOCK_FLIGHTS.filter(
          (f) => f.origin !== flightOrigin && f.destination !== flightDest
        )
      ).slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Navbar ─── */}
      <header className="border-b border-white/20 bg-brand-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-extrabold tracking-tight text-white">TipItaly</span>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-brand-100 hover:text-white transition-colors">
              Accedi
            </Link>
            <Link
              href="/auth/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 pb-24 pt-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            ✈️ Oltre 2,9 milioni di strutture · Voli da tutti gli aeroporti italiani
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Prenota il tuo viaggio<br />con i benefit TipItaly
          </h1>
          <p className="mt-4 text-lg text-brand-100">
            Hotel e voli a tariffe riservate. I membri ottengono fino al <strong>15% di sconto</strong> su ogni prenotazione.
          </p>
        </div>
      </div>

      {/* ─── Search card (overlapping hero) ─── */}
      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <Link
              href={`?tab=hotels`}
              className={`flex-1 rounded-tl-2xl py-4 text-center text-sm font-semibold transition-colors ${
                activeTab === "hotels"
                  ? "bg-brand-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              🏨 Hotel
            </Link>
            <Link
              href={`?tab=flights`}
              className={`flex-1 rounded-tr-2xl py-4 text-center text-sm font-semibold transition-colors ${
                activeTab === "flights"
                  ? "bg-brand-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              ✈️ Voli
            </Link>
          </div>

          {/* Hotel search form */}
          {activeTab === "hotels" && (
            <form method="GET" className="p-5">
              <input type="hidden" name="tab" value="hotels" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Destinazione</label>
                  <input
                    name="destination"
                    defaultValue={destination}
                    placeholder="es. Roma, Firenze, Venezia…"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Check-in</label>
                  <input
                    type="date"
                    name="checkin"
                    defaultValue={checkin}
                    min={todayStr()}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Check-out</label>
                  <input
                    type="date"
                    name="checkout"
                    defaultValue={checkout}
                    min={tomorrowStr()}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Adulti</label>
                  <select
                    name="adults"
                    defaultValue={adults}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
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
                className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors sm:w-auto sm:px-8"
              >
                Cerca hotel →
              </button>
            </form>
          )}

          {/* Flight search form */}
          {activeTab === "flights" && (
            <form method="GET" className="p-5">
              <input type="hidden" name="tab" value="flights" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Da (IATA)</label>
                  <input
                    name="origin"
                    defaultValue={flightOrigin}
                    placeholder="es. FCO, MXP, VCE"
                    maxLength={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">A (IATA)</label>
                  <input
                    name="flightDest"
                    defaultValue={flightDest}
                    placeholder="es. CDG, LHR, BCN"
                    maxLength={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Data partenza</label>
                  <input
                    type="date"
                    name="departureDate"
                    defaultValue={departureDate}
                    min={todayStr()}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Data ritorno (opz.)</label>
                  <input
                    type="date"
                    name="returnDate"
                    defaultValue={returnDate}
                    min={tomorrowStr()}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Passeggeri</label>
                  <select
                    name="flightAdults"
                    defaultValue={flightAdults}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
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
                className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors sm:w-auto sm:px-8"
              >
                Cerca voli →
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ─── Results / content ─── */}
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <MemberBanner />

        {/* Hotel results */}
        {activeTab === "hotels" && didHotelSearch && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {filteredHotels.length} strutture trovate
                {destination ? ` per "${destination}"` : ""}
              </h2>
              <p className="text-xs text-gray-400">
                {checkin} → {checkout} · {adults} {adults === 1 ? "adulto" : "adulti"}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </>
        )}

        {/* Flight results */}
        {activeTab === "flights" && didFlightSearch && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {filteredFlights.length} voli trovati: {flightOrigin} → {flightDest}
              </h2>
              <p className="text-xs text-gray-400">
                {departureDate}
                {returnDate ? ` · ritorno ${returnDate}` : ""}
                {" · "}
                {flightAdults} {flightAdults === 1 ? "passeggero" : "passeggeri"}
              </p>
            </div>
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </>
        )}

        {/* Empty state — hotel */}
        {activeTab === "hotels" && !didHotelSearch && (
          <div className="mt-2">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Destinazioni popolari</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_HOTELS.slice(0, 6).map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state — flights */}
        {activeTab === "flights" && !didFlightSearch && (
          <div className="mt-2">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Voli in evidenza</h2>
            <div className="space-y-4">
              {MOCK_FLIGHTS.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Why TipItaly section ─── */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "💳",
              title: "Sconti esclusivi",
              body: "Con la TipItaly Card ottieni dal 5% al 15% di sconto su ogni prenotazione hotel e volo.",
            },
            {
              icon: "🌍",
              title: "2,9 milioni di hotel",
              body: "Accedi al catalogo completo RateHawk: dalle boutique hotel ai resort di lusso in tutto il mondo.",
            },
            {
              icon: "✈️",
              title: "Voli da tutta Italia",
              body: "Prenota voli da FCO, MXP, VCE, NAP e tutti i principali aeroporti italiani a prezzi riservati.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-3xl">{item.icon}</p>
              <p className="mt-3 font-bold text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-bold text-brand-600">TipItaly</p>
          <p className="mt-1 text-xs text-gray-400">
            © {new Date().getFullYear()} TipItaly. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
