import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { createInviteToken } from "@/lib/invite-token";
import { sendB2bInviteEmail } from "@tip-italy/email";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const role = (user.user_metadata?.role as string | undefined) ?? "";
  if (role !== "company_admin") {
    return NextResponse.json({ error: "Solo gli admin possono inviare inviti" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi", issues: parsed.error.issues }, { status: 400 });
  }

  const { email, role: memberRole } = parsed.data;

  const company = await prisma.company.findFirst({
    where: { emailReferente: user.email ?? "" },
  });
  if (!company) {
    return NextResponse.json({ error: "Azienda non trovata per questo account" }, { status: 404 });
  }

  // Upsert: create if not exists, or re-invite if previously suspended
  const existing = await prisma.companyMember.findUnique({
    where: { companyId_email: { companyId: company.id, email } },
  });

  if (existing && existing.status === "ACTIVE") {
    return NextResponse.json({ error: "Questo utente è già membro attivo" }, { status: 409 });
  }

  if (existing) {
    await prisma.companyMember.update({
      where: { id: existing.id },
      data: { status: "PENDING", role: memberRole, invitedAt: new Date() },
    });
  } else {
    await prisma.companyMember.create({
      data: { companyId: company.id, email, role: memberRole, status: "PENDING" },
    });
  }

  const token = createInviteToken(email, company.id);
  const b2bUrl = process.env.NEXT_PUBLIC_B2B_URL ?? "http://localhost:3002";
  const inviteUrl = `${b2bUrl}/auth/accept-invite?token=${token}`;

  try {
    await sendB2bInviteEmail({ to: email, ragioneSociale: company.ragioneSociale, inviteUrl });
  } catch (err) {
    console.error("[POST /api/invite] email send failed", err);
    // Don't fail the request — the token can be shared manually if email fails
  }

  return NextResponse.json({ ok: true, inviteUrl }, { status: 201 });
}
