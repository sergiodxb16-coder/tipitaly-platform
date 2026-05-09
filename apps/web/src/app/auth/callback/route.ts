import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { syncCardholder } from "@tip-italy/db/auth";

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
    // Log ma non blocca — l'utente entra comunque, il sync verrà ritentato al prossimo accesso
    console.error("[auth/callback] syncCardholder error:", err);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
