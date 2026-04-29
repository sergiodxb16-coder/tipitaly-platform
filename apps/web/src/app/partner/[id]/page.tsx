import { getPartnerBySlugOrId } from "@tip-italy/db/partners";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { RatingWidget } from "./rating-widget";

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const partner = await getPartnerBySlugOrId(id);
  if (!partner) return { title: "Partner — TipItaly" };

  return {
    title: `${partner.nome} — TipItaly Partner`,
    description: partner.descrizione ?? `Scopri ${partner.nome} su TipItaly Card.`,
    openGraph: {
      title: partner.nome,
      description: partner.descrizione ?? undefined,
      images: partner.logoUrl ? [partner.logoUrl] : [],
    },
  };
}

const CATEGORIA_LABELS: Record<string, string> = {
  RISTORANTE: "Ristorazione",
  HOTEL: "Hotel",
  BENESSERE: "Benessere",
  SPORT: "Sport",
  CULTURA: "Cultura",
  SHOPPING: "Shopping",
  SERVIZI: "Servizi",
  MODA: "Moda",
  VIAGGI: "Viaggi",
  INTRATTENIMENTO: "Intrattenimento",
  ALTRO: "Altro",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function PartnerDetailPage({ params }: Params) {
  const { id } = await params;
  const partner = await getPartnerBySlugOrId(id);
  if (!partner) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cardholder = null;
  let myRating: number | null = null;
  if (user) {
    cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
    if (cardholder) {
      const rating = await prisma.partnerRating.findUnique({
        where: { partnerId_cardholderId: { partnerId: partner.id, cardholderId: cardholder.id } },
        select: { stelle: true },
      });
      myRating = rating?.stelle ?? null;
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: partner.nome,
    description: partner.descrizione ?? undefined,
    url: partner.sitoWeb ?? undefined,
    telephone: partner.telefono ?? undefined,
    image: partner.logoUrl ?? undefined,
    address: partner.indirizzo
      ? {
          "@type": "PostalAddress",
          streetAddress: partner.indirizzo,
          addressLocality: partner.citta ?? undefined,
          postalCode: partner.cap ?? undefined,
          addressCountry: "IT",
        }
      : undefined,
    geo:
      partner.latitudine != null && partner.longitudine != null
        ? {
            "@type": "GeoCoordinates",
            latitude: partner.latitudine,
            longitude: partner.longitudine,
          }
        : undefined,
    aggregateRating:
      partner.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: partner.ratingMedia?.toFixed(1),
            reviewCount: partner.ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/dashboard/partner" className="hover:text-orange-600">
              Partner
            </Link>
            <span>/</span>
            <span className="text-gray-900">{partner.nome}</span>
          </nav>

          {/* Header */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logoUrl}
                  alt={partner.nome}
                  className="h-16 w-16 rounded-xl object-contain border border-gray-100 shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-50 text-2xl shrink-0">
                  🏪
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                    {CATEGORIA_LABELS[partner.categoria] ?? partner.categoria}
                  </span>
                  {partner.isNew && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Nuovo partner
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{partner.nome}</h1>

                {partner.ratingCount > 0 && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`h-4 w-4 ${s <= Math.round(partner.ratingMedia ?? 0) ? "fill-current" : "fill-gray-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {partner.ratingMedia?.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">({partner.ratingCount} recensioni)</span>
                  </div>
                )}
              </div>
            </div>

            {partner.descrizioneEstesa && (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {partner.descrizioneEstesa}
              </p>
            )}
            {!partner.descrizioneEstesa && partner.descrizione && (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{partner.descrizione}</p>
            )}
          </div>

          {/* Photo gallery */}
          {partner.photos.length > 0 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {partner.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.alt ?? partner.nome}
                  className="h-48 w-72 flex-shrink-0 rounded-xl object-cover border border-gray-100"
                />
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Info */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Informazioni</h2>
              <dl className="space-y-2 text-sm">
                {partner.indirizzo && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-gray-400">Indirizzo</dt>
                    <dd className="text-gray-700">
                      {partner.indirizzo}
                      {partner.citta && `, ${partner.citta}`}
                      {partner.cap && ` (${partner.cap})`}
                    </dd>
                  </div>
                )}
                {partner.telefono && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-gray-400">Tel.</dt>
                    <dd>
                      <a href={`tel:${partner.telefono}`} className="text-orange-600 hover:underline">
                        {partner.telefono}
                      </a>
                    </dd>
                  </div>
                )}
                {partner.emailContatto && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-gray-400">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${partner.emailContatto}`}
                        className="text-orange-600 hover:underline"
                      >
                        {partner.emailContatto}
                      </a>
                    </dd>
                  </div>
                )}
                {partner.sitoWeb && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-gray-400">Web</dt>
                    <dd>
                      <a
                        href={partner.sitoWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline truncate"
                      >
                        {partner.sitoWeb.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Mini map */}
              {partner.latitudine != null && partner.longitudine != null && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${partner.latitudine}&mlon=${partner.longitudine}#map=16/${partner.latitudine}/${partner.longitudine}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-xs text-orange-600 hover:underline"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  Vedi sulla mappa →
                </a>
              )}
            </div>

            {/* Hours */}
            {partner.orari && (
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">Orari</h2>
                <OrariTable orari={partner.orari as Record<string, string>} />
              </div>
            )}
          </div>

          {/* Coupons */}
          {partner.coupons.length > 0 && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                Coupon disponibili ({partner.coupons.length})
              </h2>
              <div className="space-y-2">
                {partner.coupons.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/coupon/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:border-orange-200 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.descrizione}</p>
                      {c.scadenza && (
                        <p className="text-xs text-gray-400">Scade: {formatDate(c.scadenza)}</p>
                      )}
                    </div>
                    <span className="text-lg font-bold text-orange-600">-{c.sconto.toString()}%</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          {cardholder && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">La tua valutazione</h2>
              <RatingWidget
                partnerId={partner.id}
                initialRating={myRating}
                ratingMedia={partner.ratingMedia}
                ratingCount={partner.ratingCount}
              />
            </div>
          )}
          {!user && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
              <Link href="/auth/login" className="text-orange-600 hover:underline">
                Accedi
              </Link>{" "}
              per lasciare una recensione.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function OrariTable({ orari }: { orari: Record<string, string> }) {
  const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
  const KEYS = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

  return (
    <dl className="space-y-1 text-sm">
      {KEYS.map((k, i) =>
        orari[k] ? (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-gray-400">{GIORNI[i]}</dt>
            <dd className="text-gray-700">{orari[k]}</dd>
          </div>
        ) : null
      )}
    </dl>
  );
}
