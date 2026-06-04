import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * POST /api/profile/taste
 * Salva il profilo gusti raccolto durante l'onboarding nel campo tasteProfile (JSONB)
 * del record Cardholder. Se la colonna non esiste ancora, l'errore è silenzioso.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const admin = createAdminClient();

    // Trova il Cardholder — se non esiste ancora (primo accesso), crealo al volo
    let { data: cardholder } = await admin
      .from("Cardholder")
      .select("id")
      .eq("supabaseUid", user.id)
      .maybeSingle();

    if (!cardholder) {
      const now = new Date().toISOString();
      const nameParts =
        (user.user_metadata?.full_name as string | undefined)?.split(" ") ?? [];
      const { data: created, error: insertError } = await admin
        .from("Cardholder")
        .insert({
          id: crypto.randomUUID(),
          supabaseUid: user.id,
          email: user.email ?? "",
          nome: nameParts[0] ?? "",
          cognome: nameParts.slice(1).join(" ") || "",
          onboardingCompleted: false,
          createdAt: now,
          updatedAt: now,
        })
        .select("id")
        .single();
      if (insertError || !created) {
        console.error("[taste] insert Cardholder error:", insertError);
        return NextResponse.json({ error: "Cardholder creation failed" }, { status: 500 });
      }
      cardholder = created;
    }

    // Salva il profilo gusti
    const tasteProfile = {
      luoghi: body.luoghi ?? [],
      esperienze: body.esperienze ?? [],
      compagnia: body.compagnia?.[0] ?? null,
      budget: body.budget?.[0] ?? null,
      completedAt: new Date().toISOString(),
      version: 1,
    };

    await admin
      .from("Cardholder")
      .update({ tasteProfile, onboardingCompleted: true })
      .eq("id", cardholder.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[taste] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
