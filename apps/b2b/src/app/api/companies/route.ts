import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

const CreateCompanySchema = z.object({
  ragioneSociale: z.string().min(2).max(200),
  pIva: z.string().regex(/^[0-9]{11}$/, "P.IVA deve essere 11 cifre numeriche"),
  emailReferente: z.string().email(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = CreateCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati non validi", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { ragioneSociale, pIva, emailReferente } = parsed.data;

  const [pIvaConflict, userConflict] = await Promise.all([
    prisma.company.findUnique({ where: { pIva } }),
    prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } }),
  ]);

  if (pIvaConflict) {
    return NextResponse.json(
      { error: "Una azienda con questa P.IVA esiste già" },
      { status: 409 }
    );
  }
  if (userConflict) {
    return NextResponse.json(
      { error: "Il tuo account è già associato a un'azienda", companyId: userConflict.id },
      { status: 409 }
    );
  }

  const company = await prisma.company.create({
    data: { ragioneSociale, pIva, emailReferente },
  });

  await prisma.companyMember.create({
    data: {
      companyId: company.id,
      email: user.email ?? emailReferente,
      role: "ADMIN",
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });

  await supabase.auth.updateUser({ data: { role: "company_admin" } });

  return NextResponse.json({ ok: true, companyId: company.id }, { status: 201 });
}
