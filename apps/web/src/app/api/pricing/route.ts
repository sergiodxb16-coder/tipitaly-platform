import { NextRequest, NextResponse } from "next/server";
import { getCountryPricing } from "@tip-italy/db/purchases";
import { SupportedCountry } from "@tip-italy/db/generated/client";

const VALID_COUNTRIES: SupportedCountry[] = ["IT", "GB", "CH"];

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") as SupportedCountry | null;

  if (!country || !VALID_COUNTRIES.includes(country)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }

  const pricing = await getCountryPricing(country);
  return NextResponse.json({ pricing });
}
