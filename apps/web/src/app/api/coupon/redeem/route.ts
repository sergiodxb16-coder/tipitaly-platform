import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { redeemCoupon } from "@tip-italy/db/coupons";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) return NextResponse.json({ error: "Profilo non trovato" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const couponId = typeof body?.couponId === "string" ? body.couponId : null;
  if (!couponId) return NextResponse.json({ error: "couponId mancante" }, { status: 400 });

  const result = await redeemCoupon(couponId, cardholder.id);

  if (!result.success) {
    const messages: Record<string, string> = {
      not_found: "Coupon non trovato",
      max_reached: "Numero massimo di utilizzi raggiunto",
      expired: "Coupon scaduto",
      no_active_card: "Card non attiva",
    };
    return NextResponse.json({ error: messages[result.error] ?? result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
