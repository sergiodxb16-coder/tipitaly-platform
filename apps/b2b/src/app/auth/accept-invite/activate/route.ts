import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyInviteToken } from "@/lib/invite-token";
import { prisma } from "@tip-italy/db";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("invite_token")?.value;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=Sessione+scaduta`);
  }

  if (!rawToken) {
    // No invite cookie — user may have already activated or used a stale link
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  const payload = verifyInviteToken(rawToken);
  if (!payload) {
    cookieStore.delete("invite_token");
    return NextResponse.redirect(`${origin}/auth/login?error=Token+invito+non+valido`);
  }

  if (user.email?.toLowerCase() !== payload.email.toLowerCase()) {
    cookieStore.delete("invite_token");
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("Email non corrispondente all'invito")}`
    );
  }

  // Activate the CompanyMember
  await prisma.companyMember.updateMany({
    where: { companyId: payload.companyId, email: payload.email, status: "PENDING" },
    data: { status: "ACTIVE", activatedAt: new Date() },
  });

  // Set company_employee role on the Supabase user (only if they don't already have a B2B role)
  const currentRole = (user.user_metadata?.role as string | undefined) ?? "";
  if (currentRole !== "company_admin" && currentRole !== "company_employee") {
    await supabase.auth.updateUser({ data: { role: "company_employee" } });
  }

  cookieStore.delete("invite_token");

  return NextResponse.redirect(`${origin}/dashboard`);
}
