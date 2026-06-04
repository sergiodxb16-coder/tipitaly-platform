import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { createInviteToken } from "@/lib/invite-token";
import { sendB2bInviteEmail } from "@tip-italy/email";

const InviteMembersSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(200),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: companyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const role = (user.user_metadata?.role as string | undefined) ?? "";
  if (role !== "company_admin") {
    return NextResponse.json(
      { error: "Solo gli admin possono invitare membri" },
      { status: 403 }
    );
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, emailReferente: user.email ?? "" },
  });
  if (!company) {
    return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = InviteMembersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati non validi", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { emails, role: memberRole } = parsed.data;
  const b2bUrl = process.env.NEXT_PUBLIC_B2B_URL ?? "http://localhost:3002";

  const results: { email: string; status: "invited" | "already_active" | "error" }[] = [];

  for (const email of emails) {
    const existing = await prisma.companyMember.findUnique({
      where: { companyId_email: { companyId, email } },
    });

    if (existing?.status === "ACTIVE") {
      results.push({ email, status: "already_active" });
      continue;
    }

    try {
      if (existing) {
        await prisma.companyMember.update({
          where: { id: existing.id },
          data: { status: "PENDING", role: memberRole, invitedAt: new Date() },
        });
      } else {
        await prisma.companyMember.create({
          data: { companyId, email, role: memberRole, status: "PENDING" },
        });
      }

      const token = createInviteToken(email, companyId);
      const inviteUrl = `${b2bUrl}/auth/accept-invite?token=${token}`;
      await sendB2bInviteEmail({ to: email, ragioneSociale: company.ragioneSociale, inviteUrl }).catch(
        (err) => console.error(`[batch-invite] email failed for ${email}`, err)
      );

      results.push({ email, status: "invited" });
    } catch (err) {
      console.error(`[batch-invite] failed for ${email}`, err);
      results.push({ email, status: "error" });
    }
  }

  return NextResponse.json({ ok: true, results }, { status: 201 });
}
