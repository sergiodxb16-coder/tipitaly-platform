import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

const UpdateProfileSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  cognome: z.string().min(1).max(100).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: companyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati non validi", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.companyMember.updateMany({
    where: { companyId, email: user.email ?? "" },
    data: parsed.data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Membro non trovato" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
