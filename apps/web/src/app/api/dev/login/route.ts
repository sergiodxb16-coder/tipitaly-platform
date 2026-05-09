/**
 * DEV-ONLY: login rapido senza email per aggirare il rate limit di Supabase in sviluppo.
 * Questa route è DISABILITATA in produzione.
 *
 * Strategia: imposta una password temporanea sull'utente via admin API, poi fa signInWithPassword.
 * Non usa magic link → nessun rate limit email.
 *
 * Uso: GET http://localhost:3000/api/dev/login?email=tua@email.it
 */
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const DEV_PASSWORD = "TipItaly_Dev_2024!";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Parametro email mancante" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return NextResponse.json({ error: "Variabili Supabase non configurate" }, { status: 500 });
  }

  // Client admin (service role) — non invia email
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Cerca l'utente esistente oppure crealo
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const existingUser = users.find((u) => u.email === email);

  if (!existingUser) {
    // Crea l'utente se non esiste
    const { error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: DEV_PASSWORD,
      email_confirm: true,
    });
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  } else {
    // Aggiorna la password dell'utente esistente (operazione admin, nessuna email)
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      existingUser.id,
      { password: DEV_PASSWORD }
    );
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // 2. Fai signInWithPassword — nessuna email inviata, nessun rate limit
  const regularClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: signInData, error: signInError } = await regularClient.auth.signInWithPassword({
    email,
    password: DEV_PASSWORD,
  });

  if (signInError || !signInData.session) {
    return NextResponse.json({ error: signInError?.message ?? "Login fallito" }, { status: 500 });
  }

  // 3. Inietta la sessione nel cookie (stesso meccanismo di /auth/callback)
  const serverClient = await createServerClient();
  await serverClient.auth.setSession({
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
  });

  // 4. Sync Cardholder record (inline — avoids Prisma/pooler, uses PostgREST/HTTP)
  try {
    const userId = signInData.user.id;
    const userEmail = signInData.user.email ?? "";

    const { data: existing } = await adminClient
      .from("Cardholder")
      .select("id")
      .eq("supabaseUid", userId)
      .maybeSingle();

    if (!existing) {
      const nameParts =
        (signInData.user.user_metadata?.full_name as string | undefined)?.split(" ") ?? [];
      const now = new Date().toISOString();
      const { error: insertError } = await adminClient.from("Cardholder").insert({
        id: crypto.randomUUID(),
        supabaseUid: userId,
        email: userEmail,
        nome: nameParts[0] ?? "",
        cognome: nameParts.slice(1).join(" ") ?? "",
        createdAt: now,
        updatedAt: now, // @updatedAt has no DB default — must be provided on insert
      });
      if (insertError) {
        console.error("[dev/login] insert Cardholder error:", insertError);
      }
    }
  } catch (err) {
    console.error("[dev/login] syncCardholder error:", err);
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  return NextResponse.redirect(new URL(next, request.url));
}
