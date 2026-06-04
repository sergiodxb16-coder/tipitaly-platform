"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyInviteToken } from "@/lib/invite-token";

export async function acceptInvite(token: string): Promise<void> {
  const payload = verifyInviteToken(token);
  if (!payload) redirect("/auth/accept-invite?error=token_invalid");

  const supabase = await createClient();
  const b2bUrl = process.env.NEXT_PUBLIC_B2B_URL ?? "http://localhost:3002";

  const { error } = await supabase.auth.signInWithOtp({
    email: payload.email,
    options: {
      emailRedirectTo: `${b2bUrl}/auth/callback?next=/auth/accept-invite/activate`,
    },
  });

  if (error) redirect(`/auth/accept-invite?error=${encodeURIComponent(error.message)}&token=${token}`);

  // Store the invite token in a short-lived cookie so the activate route can read it
  const cookieStore = await cookies();
  cookieStore.set("invite_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
    sameSite: "lax",
  });

  redirect(`/auth/accept-invite?sent=1&email=${encodeURIComponent(payload.email)}`);
}
