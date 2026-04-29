import { searchPartners } from "@tip-italy/db/partners";
import { PartnerCategory } from "@tip-italy/db";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const q = sp.get("q") ?? undefined;
  const categoriaRaw = sp.get("categoria");
  const citta = sp.get("citta") ?? undefined;
  const latRaw = sp.get("lat");
  const lngRaw = sp.get("lng");
  const radiusRaw = sp.get("radius");
  const featuredRaw = sp.get("featured");
  const limitRaw = sp.get("limit");
  const offsetRaw = sp.get("offset");

  const categoria =
    categoriaRaw && Object.values(PartnerCategory).includes(categoriaRaw as PartnerCategory)
      ? (categoriaRaw as PartnerCategory)
      : undefined;

  const lat = latRaw ? parseFloat(latRaw) : undefined;
  const lng = lngRaw ? parseFloat(lngRaw) : undefined;
  const radiusKm = radiusRaw ? parseFloat(radiusRaw) : undefined;
  const featured = featuredRaw === "true" ? true : undefined;
  const limit = limitRaw ? Math.min(parseInt(limitRaw, 10), 100) : 50;
  const offset = offsetRaw ? parseInt(offsetRaw, 10) : 0;

  const partners = await searchPartners({ q, categoria, citta, lat, lng, radiusKm, featured, limit, offset });

  return NextResponse.json(partners);
}
