import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Web search helper (Tavily — gratis 1000 query/mese su tavily.com)
// ---------------------------------------------------------------------------
async function searchWeb(query: string): Promise<string | null> {
  const TAVILY_KEY = process.env.TAVILY_API_KEY;
  if (!TAVILY_KEY || TAVILY_KEY === "DA_AGGIUNGERE") return null;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query,
        search_depth: "basic",
        max_results: 4,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();

    // Tavily restituisce un "answer" sintetico + lista risultati
    const answer: string = data.answer ?? "";
    const results: { title: string; content: string }[] = data.results ?? [];

    const lines: string[] = [];
    if (answer) lines.push(`Risposta sintetica: ${answer}`);
    results.slice(0, 3).forEach((r) => lines.push(`• ${r.title}: ${r.content?.slice(0, 200)}`));

    return lines.length ? lines.join("\n") : null;
  } catch {
    return null;
  }
}

function needsWebSearch(msg: string): boolean {
  const kw = [
    "orari", "orario", "apre", "chiude", "aperto", "chiuso",
    "prezzo", "prezzi", "biglietto", "costo", "quanto costa", "tariff",
    "domani", "oggi", "questo weekend", "prossim",
    "hours", "open", "close", "price", "ticket", "cost", "tomorrow", "today",
    "öffnungszeit", "preis", "horaire", "billet", "prix",
    "prenot", "disponibil", "book", "reserv",
  ];
  const l = msg.toLowerCase();
  return kw.some((k) => l.includes(k));
}

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// Body: { messages: {role: "user"|"assistant", content: string}[] }
// Returns: text/event-stream (streaming)
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  try {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Non autenticato" }), { status: 401 });
  }

  // 2. Parse body
  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };
  if (!messages?.length) {
    return new Response(JSON.stringify({ error: "Nessun messaggio" }), { status: 400 });
  }

  // 3. Load user context from DB
  const admin = createAdminClient();

  const { data: cardholder } = await admin
    .from("Cardholder")
    .select("id, nome, cognome, email, tasteProfile")
    .eq("supabaseUid", user.id)
    .maybeSingle();

  let cardContext = "L'utente non ha ancora una card attiva.";
  let couponContext = "Nessun coupon disponibile.";
  let bookingContext = "Nessuna prenotazione recente.";

  if (cardholder) {
    // Card
    const { data: assignment } = await admin
      .from("CardAssignment")
      .select("id, Card(serialNumber, level, status, expiresAt, activatedAt)")
      .eq("cardholderId", cardholder.id)
      .order("assignedAt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assignment?.Card) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const card = (assignment.Card as unknown as any) as {
        serialNumber: string; level: string; status: string;
        expiresAt: string | null; activatedAt: string | null;
      };
      const expiry = card.expiresAt
        ? new Date(card.expiresAt).toLocaleDateString("it-IT", { month: "long", year: "numeric" })
        : "nessuna scadenza";
      cardContext = `Card ${card.level} · Seriale: ${card.serialNumber} · Stato: ${card.status} · Scadenza: ${expiry}`;
    }

    // Coupons
    const { data: coupons } = await admin
      .from("Coupon")
      .select("id, descrizione, sconto, scadenza, Partner(nome)")
      .eq("isActive", true)
      .limit(5);

    if (coupons?.length) {
      couponContext = coupons.map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const partner = (c.Partner as unknown as { nome: string } | null)?.nome ?? "Partner";
        const exp = c.scadenza
          ? `scade ${new Date(c.scadenza).toLocaleDateString("it-IT")}`
          : "senza scadenza";
        return `- ${partner}: ${c.descrizione} (-${c.sconto}%, ${exp})`;
      }).join("\n");
    }

    // Recent bookings
    const { data: hotels } = await admin
      .from("HotelBooking")
      .select("hotelName, checkinDate, checkoutDate, status, totalPrice, currency")
      .eq("cardholderId", cardholder.id)
      .order("createdAt", { ascending: false })
      .limit(3);

    const { data: flights } = await admin
      .from("FlightBooking")
      .select("origin, destination, departureDate, airline, status, totalPrice, currency")
      .eq("cardholderId", cardholder.id)
      .order("createdAt", { ascending: false })
      .limit(3);

    const hotelLines = (hotels ?? []).map((h) =>
      `- Hotel: ${h.hotelName} · ${h.checkinDate} → ${h.checkoutDate} · ${h.status} · ${h.totalPrice} ${h.currency}`
    );
    const flightLines = (flights ?? []).map((f) =>
      `- Volo: ${f.origin} → ${f.destination} · ${f.departureDate} · ${f.airline} · ${f.status} · ${f.totalPrice} ${f.currency}`
    );
    const allBookings = [...hotelLines, ...flightLines];
    if (allBookings.length) bookingContext = allBookings.join("\n");
  }

  // 4. Web search (se la domanda richiede dati in tempo reale)
  const lastUserMsg = messages[messages.length - 1]?.content ?? "";
  let webContext = "";
  if (needsWebSearch(lastUserMsg)) {
    const searchResults = await searchWeb(`${lastUserMsg} Italia`);
    if (searchResults) {
      webContext = `\nINFORMAZIONI AGGIORNATE DAL WEB (usale per rispondere con precisione):\n${searchResults}\n`;
    }
  }

  // 5. Build system prompt
  const userName = cardholder
    ? `${cardholder.nome ?? ""} ${cardholder.cognome ?? ""}`.trim() || cardholder.email
    : "utente";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taste = (cardholder?.tasteProfile as any) ?? {};
  const cittaResidenza = taste.cittaResidenza ?? taste.citta ?? null;
  const residenzaLine = cittaResidenza ? `- City of residence: ${cittaResidenza} (always proactively suggest how to get there by flight or train when recommending destinations)` : "";

  // Detect user locale from cookie
  const cookieStore = await cookies();
  const locale = cookieStore.get("TIPITALY_LOCALE")?.value ?? "it";
  const langInstruction: Record<string, string> = {
    it: "Rispondi SEMPRE in italiano.",
    en: "Always respond in English.",
    de: "Antworte IMMER auf Deutsch.",
    fr: "Réponds TOUJOURS en français.",
    es: "Responde SIEMPRE en español.",
    pt: "Responda SEMPRE em português.",
    ja: "常に日本語で返答してください。",
    nl: "Antwoord ALTIJD in het Nederlands.",
    zh: "请始终用中文回复。",
    ru: "Отвечай ВСЕГДА на русском языке.",
    ar: "أجب دائماً باللغة العربية.",
    cs: "Vždy odpovídej česky.",
    hu: "Mindig magyarul válaszolj.",
    sl: "Vedno odgovarjaj v slovenščini.",
    hr: "Uvijek odgovaraj na hrvatskom.",
    sq: "Përgjigju gjithmonë në shqip.",
    pl: "Zawsze odpowiadaj po polsku.",
  };
  const languageLine = langInstruction[locale] ?? langInstruction.it;

  const systemPrompt = `Sei Sofia, il concierge personale di TipItaly — esperta di viaggi, Italia e lifestyle di lusso.
${languageLine} Usa al massimo una emoji per messaggio.

COMPORTAMENTO DA CONCIERGE:
Rispondi SEMPRE con informazioni concrete e utili, come farebbe un vero concierge di hotel 5 stelle.
- Se ti chiedono orari, prezzi, come arrivare da qualche parte: DAI LA RISPOSTA con le tue conoscenze, anche se approssimativa, e aggiungi "ti consiglio di confermare su [sito ufficiale]" SOLO come nota finale — mai come risposta principale.
- Non dire mai "non ho accesso a informazioni in tempo reale" come risposta principale: usa quello che sai e sii utile.
- Se ti chiedono un ristorante: consiglia un posto specifico con motivazione, non una lista generica.
- Se ti chiedono un itinerario: costruiscilo davvero, giorno per giorno, non dire "dipende da te".
- Proattivo: anticipa la domanda successiva e offri già la prossima informazione utile.
${cittaResidenza ? `- L'utente abita a ${cittaResidenza}: suggerisci sempre come raggiungere le destinazioni da lì (volo, treno, tempi, costi approssimativi).` : ""}

CONTESTO UTENTE:
- Nome: ${userName}
- ${cardContext}

COUPON DISPONIBILI:
${couponContext}

PRENOTAZIONI RECENTI:
${bookingContext}

LIMITI OPERATIVI (non scusarti, sii diretto):
- Non puoi effettuare prenotazioni direttamente: di' "puoi farlo dalla sezione Wallet" o "contatta il supporto"
- Non puoi modificare dati dell'account: rimanda alle impostazioni del profilo

Lunghezza risposta: adatta alla domanda — breve per domande semplici, dettagliata per pianificazione o itinerari.${webContext}`;

  // 5. Call Anthropic API with streaming
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Assistente AI non configurato" }), { status: 503 });
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
      max_tokens: 512,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    console.error("[AI chat] Anthropic error:", anthropicRes.status, err);
    return new Response(
      JSON.stringify({ error: `Errore AI ${anthropicRes.status}: ${err.slice(0, 200)}` }),
      { status: 502 }
    );
  }

  // 6. Stream back to client
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
      "X-Content-Type-Options": "nosniff",
    },
  });

  } catch (err: unknown) {
    console.error("[AI chat] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
