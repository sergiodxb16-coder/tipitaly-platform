"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  if (!email) redirect("/auth/login?error=Email+obbligatoria");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_B2C_URL ?? "http://localhost:3003"}/auth/callback`,
    },
  });

  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/login?sent=1");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
