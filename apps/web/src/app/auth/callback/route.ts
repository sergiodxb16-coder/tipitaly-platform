import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import { syncCardholder } from "@tip-italy/db/auth";

const VALID_LOCALES = [
  "it", "en", "de", "fr",
  "es", "pt", "ja", "nl", "zh",
  "ru", "ar", "cs", "hu", "sl",
  "hr", "sq", "pl",
];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=Codice+mancante`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error?.message ?? "Errore di autenticazione")}`);
  }

  try {
    await syncCardholder(data.user);
  } catch (err) {
    console.error("[auth/callback] syncCardholder error:", err);
  }

  // Leggi la lingua dal profilo utente e setta il cookie
  try {
    const admin = createAdminClient();
    const { data: cardholder } = await admin
      .from("Cardholder")
      .select("tasteProfile")
      .eq("supabaseUid", data.user.id)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taste = (cardholder?.tasteProfile as any) ?? {};
    const locale = VALID_LOCALES.includes(taste.locale) ? taste.locale : "it";

    const response = NextResponse.redirect(`${origin}${next}`);
    response.cookies.set("TIPITALY_LOCALE", locale, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 anno
      path: "/",
    });
    return response;
  } catch {
    // In caso di errore, redirect senza cookie (defaulterà a 'it')
    return NextResponse.redirect(`${origin}${next}`);
  }
}
