"use server";

import { createClient } from "@/lib/supabase/server";
import { activateCard } from "@tip-italy/db/cards";
import { prisma } from "@tip-italy/db";
import { sendCardActivationEmail } from "@tip-italy/email";
import { redirect } from "next/navigation";

const ERROR_MESSAGES = {
  not_found: "Numero seriale non trovato. Verifica di aver inserito il codice correttamente.",
  already_active: "Questa card è già attiva. Contatta il supporto se ritieni ci sia un errore.",
  window_expired: "Il periodo di attivazione (30 giorni) è scaduto. Contatta il supporto.",
  expired: "Questa card è scaduta. Contatta il supporto.",
  unauthenticated: "Devi accedere per attivare la card.",
  no_profile: "Profilo utente non trovato. Riprova o contatta il supporto.",
} as const;

export async function activateCardAction(formData: FormData): Promise<void> {
  const serial = (formData.get("serial") as string | null)?.toUpperCase().trim();
  if (!serial) redirect("/attivazione?error=Inserisci+il+numero+seriale");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login`);

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) redirect(`/attivazione?error=${encodeURIComponent(ERROR_MESSAGES.no_profile)}`);

  const result = await activateCard(serial, cardholder.id);

  if (!result.success) {
    redirect(`/attivazione?error=${encodeURIComponent(ERROR_MESSAGES[result.error])}`);
  }

  // Fire-and-forget welcome email — don't block redirect on email failure
  sendCardActivationEmail({
    to: cardholder.email,
    nome: cardholder.nome || cardholder.email,
    cardLevel: result.cardLevel as "WHITE" | "GOLD" | "PLATINUM",
    serialNumber: serial,
    expiresAt: result.expiresAt,
    dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`,
  }).catch(() => {});

  redirect("/dashboard?activated=1");
}
