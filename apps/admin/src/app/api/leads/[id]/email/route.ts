import { NextRequest, NextResponse } from "next/server";
import { sendB2bOutreachEmail } from "@tip-italy/email";

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

// POST /api/leads/[id]/email — invia email outreach al lead
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Recupera il lead da Supabase
    const getRes = await supabase(`/B2bLead?id=eq.${id}`);
    if (!getRes.ok) {
      return NextResponse.json({ error: "Errore DB" }, { status: 500 });
    }
    const rows = await getRes.json();
    const lead = rows[0];

    if (!lead) {
      return NextResponse.json({ error: "Lead non trovato" }, { status: 404 });
    }
    if (lead.status === "CONVERTED" || lead.status === "LOST") {
      return NextResponse.json(
        { error: `Lead in stato ${lead.status} — email non inviata` },
        { status: 422 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Invia email con Resend
    const result = await sendB2bOutreachEmail({
      to: lead.emailReferente,
      ragioneSociale: lead.ragioneSociale,
      nomeReferente: lead.nomeReferente ?? undefined,
      settore: lead.settore ?? undefined,
      calendarUrl: body.calendarUrl,
      senderName: body.senderName,
    });

    // Aggiorna lead su Supabase
    const updateRes = await supabase(`/B2bLead?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "CONTACTED",
        emailSentAt: new Date().toISOString(),
        emailSubject: result.subject,
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return NextResponse.json({ error: `Aggiornamento fallito: ${err}` }, { status: 500 });
    }

    const updated = await updateRes.json();

    return NextResponse.json({
      success: true,
      emailId: result.id,
      subject: result.subject,
      lead: updated[0],
    });
  } catch (err: any) {
    console.error("[POST /api/leads/[id]/email]", err);
    return NextResponse.json(
      { error: "Errore invio email", details: err.message },
      { status: 500 }
    );
  }
}
