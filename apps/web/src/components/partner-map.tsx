"use client";

import { useEffect, useRef } from "react";

interface MapPartner {
  id: string;
  nome: string;
  citta: string | null;
  latitudine: number;
  longitudine: number;
  categoria: string;
  ratingMedia: number | null;
}

interface PartnerMapProps {
  partners: MapPartner[];
  onSelectPartner?: (id: string) => void;
}

export function PartnerMap({ partners, onSelectPartner }: PartnerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const geoPartners = partners.filter(
      (p): p is MapPartner & { latitudine: number; longitudine: number } =>
        p.latitudine != null && p.longitudine != null
    );
    if (geoPartners.length === 0) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstance.current) return;

      // Fix Leaflet default icon path in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const avgLat = geoPartners.reduce((s, p) => s + p.latitudine, 0) / geoPartners.length;
      const avgLng = geoPartners.reduce((s, p) => s + p.longitudine, 0) / geoPartners.length;

      const map = L.map(mapRef.current!).setView([avgLat, avgLng], 10);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      geoPartners.forEach((p) => {
        const rating = p.ratingMedia ? `⭐ ${p.ratingMedia.toFixed(1)}` : "";
        const popup = `<div class="text-sm font-medium">${p.nome}</div><div class="text-xs text-gray-500">${p.citta ?? ""} ${rating}</div>`;
        const marker = L.marker([p.latitudine, p.longitudine])
          .addTo(map)
          .bindPopup(popup);
        if (onSelectPartner) {
          marker.on("click", () => onSelectPartner(p.id));
        }
      });
    });

    return () => {
      if (mapInstance.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      <div ref={mapRef} className="h-80 w-full bg-gray-100" />
    </div>
  );
}
