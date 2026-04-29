"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const PartnerMap = dynamic(
  () => import("@/components/partner-map").then((m) => m.PartnerMap),
  { ssr: false, loading: () => <div className="h-80 rounded-xl bg-gray-100 animate-pulse" /> }
);

const CATEGORIE = [
  { value: "", label: "Tutte" },
  { value: "RISTORANTE", label: "Ristorazione" },
  { value: "MODA", label: "Moda" },
  { value: "VIAGGI", label: "Viaggi" },
  { value: "HOTEL", label: "Hotel" },
  { value: "BENESSERE", label: "Benessere" },
  { value: "SPORT", label: "Sport" },
  { value: "INTRATTENIMENTO", label: "Intrattenimento" },
  { value: "CULTURA", label: "Cultura" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "SERVIZI", label: "Servizi" },
  { value: "ALTRO", label: "Altro" },
];

interface Partner {
  id: string;
  nome: string;
  slug: string | null;
  logoUrl: string | null;
  categoria: string;
  citta: string | null;
  descrizione: string | null;
  latitudine: number | null;
  longitudine: number | null;
  isFeatured: boolean;
  isNew: boolean;
  ratingMedia: number | null;
  ratingCount: number;
  distanceKm: number | null;
  _count: { coupons: number };
}

function StarRating({ value }: { value: number | null }) {
  if (!value) return null;
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`h-3 w-3 ${s <= full ? "fill-current" : "fill-gray-200"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-500">{value.toFixed(1)}</span>
    </span>
  );
}

export function PartnerDiscovery() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [citta, setCitta] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPartners = useCallback(
    async (overrides?: { lat?: number; lng?: number }) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (categoria) params.set("categoria", categoria);
      if (citta) params.set("citta", citta);

      const lat = overrides?.lat ?? userLocation?.lat;
      const lng = overrides?.lng ?? userLocation?.lng;
      if (useLocation && lat != null && lng != null) {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
        params.set("radius", "50");
      }

      try {
        const res = await fetch(`/api/partners?${params}`);
        const data = await res.json();
        setPartners(data);
      } finally {
        setLoading(false);
      }
    },
    [q, categoria, citta, useLocation, userLocation]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPartners(), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchPartners]);

  const handleLocationToggle = () => {
    if (useLocation) {
      setUseLocation(false);
      setUserLocation(null);
      return;
    }
    if (!navigator.geolocation) {
      setGeoError("Geolocalizzazione non supportata.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setUseLocation(true);
        setGeoError(null);
        fetchPartners(loc);
      },
      () => setGeoError("Permesso di localizzazione negato.")
    );
  };

  const mapPartners = partners
    .filter((p) => p.latitudine != null && p.longitudine != null)
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      citta: p.citta,
      latitudine: p.latitudine!,
      longitudine: p.longitudine!,
      categoria: p.categoria,
      ratingMedia: p.ratingMedia,
    }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Partner</h1>
        <Link href="/dashboard" className="text-sm text-orange-600 hover:underline">
          ← Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Cerca partner, città..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        >
          {CATEGORIE.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Città"
          value={citta}
          onChange={(e) => setCitta(e.target.value)}
          className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
        <button
          onClick={handleLocationToggle}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            useLocation
              ? "border-orange-400 bg-orange-50 text-orange-700"
              : "border-gray-300 text-gray-600 hover:border-orange-300"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {useLocation ? "Vicino a me" : "Usa posizione"}
        </button>
        <button
          onClick={() => setShowMap((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            showMap
              ? "border-orange-400 bg-orange-50 text-orange-700"
              : "border-gray-300 text-gray-600 hover:border-orange-300"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Mappa
        </button>
      </div>

      {geoError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{geoError}</p>
      )}

      {/* Map */}
      {showMap && mapPartners.length > 0 && (
        <div className="mb-6">
          <PartnerMap
            partners={mapPartners}
            onSelectPartner={(id) => {
              document.getElementById(`partner-${id}`)?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          Nessun partner trovato. Prova a modificare i filtri.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-gray-400">{partners.length} partner trovati</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => {
              const href = `/partner/${partner.slug ?? partner.id}`;
              return (
                <Link
                  key={partner.id}
                  id={`partner-${partner.id}`}
                  href={href}
                  className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                          {CATEGORIE.find((c) => c.value === partner.categoria)?.label ??
                            partner.categoria}
                        </p>
                        {partner.isNew && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Nuovo
                          </span>
                        )}
                        {partner.isFeatured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            In evidenza
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-semibold text-gray-900 leading-snug group-hover:text-orange-700">
                        {partner.nome}
                      </h3>
                    </div>
                    {partner.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.logoUrl}
                        alt={partner.nome}
                        className="h-10 w-10 rounded-lg object-contain shrink-0"
                      />
                    )}
                  </div>

                  {partner.descrizione && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{partner.descrizione}</p>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      {partner.citta && <span>{partner.citta}</span>}
                      {partner.distanceKm != null && (
                        <span className="text-orange-500">
                          {partner.distanceKm < 1
                            ? `${Math.round(partner.distanceKm * 1000)}m`
                            : `${partner.distanceKm.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={partner.ratingMedia} />
                      {partner._count.coupons > 0 && (
                        <span className="text-orange-600">{partner._count.coupons} coupon</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
