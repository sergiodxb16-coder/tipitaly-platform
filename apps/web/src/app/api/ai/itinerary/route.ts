import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// POST /api/ai/itinerary
// Body: { destinazione: string; checkin: string; checkout: string; persone: number }
// Returns: text/plain streaming (markdown itinerary)
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Non autenticato" }), { status: 401 });
  }

  const { destinazione, cittaPartenza, checkin, checkout, persone, gruppo, note } = await req.json() as {
    destinazione: string;
    cittaPartenza?: string;
    checkin: string;
    checkout: string;
    persone: number;
    gruppo?: string;
    note?: string;
  };

  if (!destinazione || !checkin || !checkout) {
    return new Response(JSON.stringify({ error: "Dati mancanti" }), { status: 400 });
  }

  // Calcola numero di giorni
  const msPerDay = 1000 * 60 * 60 * 24;
  const giorni = Math.max(
    1,
    Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / msPerDay)
  );

  const checkinLabel = new Date(checkin).toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const checkoutLabel = new Date(checkout).toLocaleDateString("it-IT", { day: "numeric", month: "long" });

  const systemPrompt = `Sei Sofia, concierge di lusso di TipItaly. Crei itinerari precisi, pratici e personali per viaggiatori italiani esigenti.
Non essere generico: suggerisci posti specifici con nome, quartiere e motivo della scelta.
Usa un tono caldo ma diretto. Formatta l'itinerario in modo chiaro con emoji per ogni momento della giornata.`;

  const gruppoStr = gruppo ? ` · ${gruppo}` : "";
  const noteStr = note ? `\n\nPreferenze del gruppo: ${note}` : "";
  const partenzaStr = cittaPartenza
    ? `\nCittà di partenza: ${cittaPartenza} (includi come prima cosa dell'itinerario il trasporto consigliato per raggiungere ${destinazione}: volo diretto, volo con scalo, treno o auto — con tempi e opzioni pratiche).`
    : "";

  const userMessage = `Crea un itinerario dettagliato per ${giorni} giorni a ${destinazione} (${checkinLabel} – ${checkoutLabel}) per ${persone} ${persone === 1 ? "persona" : "persone"}${gruppoStr}.${partenzaStr}${noteStr}

${cittaPartenza ? `PRIMA SEZIONE — 🚀 Come arrivare da ${cittaPartenza}:
Indica 2-3 opzioni di trasporto (volo/treno/auto) con tempi realistici, compagnie aeree o treni che servono la tratta, e consiglio su quale preferire. Includi l'aeroporto di partenza più comodo da ${cittaPartenza} se il volo è consigliato.

` : ""}Per ogni giorno indica:
• 🌅 Mattina: cosa fare/vedere (con nome specifico del posto)
• ☀️ Pomeriggio: attività o esperienza consigliata
• 🌙 Sera: ristorante consigliato (nome, tipo di cucina, fascia di prezzo €/€€/€€€)
• 💡 Tip del giorno: un consiglio insider

Alla fine aggiungi una sezione "📌 Da sapere" con 3 consigli pratici (trasporti locali, orari, prenotazioni).
Sii specifico — niente descrizioni vaghe. Dai nomi reali di posti, ristoranti, compagnie.
Tieni conto del tipo di gruppo (coppia, famiglia, amici) per calibrare i suggerimenti.`;

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "AI non configurata" }), { status: 503 });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      stream: true,
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    console.error("[AI itinerary] Anthropic error:", err);
    return new Response(JSON.stringify({ error: "Errore AI" }), { status: 502 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
