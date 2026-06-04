import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

const SYSTEM_PROMPT = `Sei TIPA, il concierge personale AI per viaggi in Italia di TipItaly.

Stai conducendo una conversazione di onboarding con un nuovo utente per costruire il suo profilo di gusti. Il tuo obiettivo è raccogliere queste informazioni in modo naturale:
1. Destinazioni preferite in Italia (dove ama andare)
2. Tipo di esperienze (cibo, natura, cultura, benessere, ecc.)
3. Con chi viaggia (solo, coppia, famiglia, amici) — e dettagli utili (es. figli con età)
4. Budget approssimativo per un weekend
5. Frequenza di viaggio (opzionale)

REGOLE FONDAMENTALI:
- NON chiedere mai qualcosa che l'utente ha già detto nella conversazione. Se ha già detto con chi viaggia, non chiederglielo.
- Se l'utente fa una domanda ("tu cosa suggerisci?"), rispondi brevemente con un esempio contestuale e poi continua a raccogliere info mancanti.
- Fai UNA sola domanda per messaggio — mai due.
- Tono: caldo, curioso, da concierge di lusso. Non da chatbot.
- Rispondi SEMPRE in italiano.
- Risposte brevi: 2-3 frasi max.
- Quando hai raccolto TUTTE le info fondamentali (destinazioni + esperienze + compagnia + budget), scrivi un messaggio di chiusura che riassume il profilo e dice che il dashboard è pronto. Includi la parola chiave [[PROFILO_COMPLETO]] alla fine.

PROFILO ESTRATTO FINORA:
{{PROFILO}}

Analizza sempre la conversazione e non ripetere mai domande già risposte.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, profile } = await req.json() as {
      messages: ChatMessage[];
      profile: Record<string, string>;
    };

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key mancante" }, { status: 500 });
    }

    /* Costruisce il system prompt con il profilo attuale */
    const profileSummary = Object.entries(profile)
      .filter(([, v]) => v)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n") || "Nessuna informazione raccolta ancora.";

    const systemPrompt = SYSTEM_PROMPT.replace("{{PROFILO}}", profileSummary);

    /* Streaming da Anthropic */
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("[onboarding/chat] anthropic error:", err);
      return NextResponse.json({ error: "AI error" }, { status: 500 });
    }

    /* Pipe lo stream al client */
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                if (json.type === "content_block_delta" && json.delta?.text) {
                  controller.enqueue(new TextEncoder().encode(json.delta.text));
                }
              } catch {
                /* skip malformed */
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[onboarding/chat] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
