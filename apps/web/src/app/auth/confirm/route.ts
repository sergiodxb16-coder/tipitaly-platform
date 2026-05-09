import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { syncCardholder } from "@tip-italy/db/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/login?error=Link+non+valido`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error?.message ?? "Link scaduto o non valido")}`);
  }

  try {
    await syncCardholder(data.user);
  } catch (err) {
    console.error("[auth/confirm] syncCardholder error:", err);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
