import { upsertPartnerRating } from "@tip-italy/db/partners";
import { prisma } from "@tip-italy/db";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ stelle: z.number().int().min(1).max(5) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const { id: partnerId } = await params;
  const result = await upsertPartnerRating(partnerId, cardholder.id, parsed.data.stelle);

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ratingMedia: result.ratingMedia, ratingCount: result.ratingCount });
}
