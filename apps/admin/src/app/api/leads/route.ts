import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Supabase REST API helper (non usa Prisma — evita problemi SSL pooler)
function supabase(path: string, init?: RequestInit) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1${path}`;
  return fetch(url, {
    ...init,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });
}

const CreateLeadSchema = z.object({
  ragioneSociale: z.string().min(2),
  pIva: z.string().optional(),
  emailReferente: z.string().email(),
  nomeReferente: z.string().optional(),
  ruoloReferente: z.string().optional(),
  settore: z.string().optional(),
  dimensione: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE"]).optional(),
  sitoWeb: z.string().url().optional().or(z.literal("")),
  citta: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/leads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const qs = status
      ? `?status=eq.${status}&order=createdAt.desc`
      : `?order=createdAt.desc`;

    const res = await supabase(`/B2bLead${qs}`);
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const leads = await res.json();
    // Normalizza: Supabase snake_case → camelCase atteso dal frontend
    return NextResponse.json(leads.map(snakeToCamel));
  } catch (err: any) {
    console.error("[GET /api/leads]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = CreateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sitoWeb, ...rest } = parsed.data;
    const payload = camelToSnake({ ...rest, sitoWeb: sitoWeb || null });

    const res = await supabase("/B2bLead", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const rows = await res.json();
    return NextResponse.json(snakeToCamel(rows[0]), { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Conversione campi snake_case ↔ camelCase ────────────────────────────────
// Supabase RestAPI restituisce i campi col nome esatto della colonna SQL.
// Il nostro schema Prisma usa camelCase nei nomi di colonna (es. ragioneSociale),
// quindi non è necessaria conversione — i nomi sono già corretti nel DB.
function snakeToCamel(row: Record<string, unknown>) { return row; }
function camelToSnake(obj: Record<string, unknown>) { return obj; }
