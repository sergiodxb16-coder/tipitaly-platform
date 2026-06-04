"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Tipi ──────────────────────────────────────────────────── */
interface Message {
  from: "tipa" | "user";
  text: string;
  time: string;
}

type Profile = Record<string, string>;

/* ─── Utils ──────────────────────────────────────────────────── */
function nowTime() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Estrae info chiave dalla conversazione in modo euristico lato client
 * per tenere aggiornato il profilo parziale da mandare all'API.
 */
function extractProfile(messages: Message[]): Profile {
  const all = messages.map((m) => m.text.toLowerCase()).join(" ");
  const profile: Profile = {};

  // Destinazioni
  const dest = ["sardegna","sicilia","toscana","roma","milano","firenze","venezia","amalfi","puglia","liguria","dolomiti","lago di como","lago di garda"];
  const foundDest = dest.filter((d) => all.includes(d));
  if (foundDest.length) profile.destinazioni = foundDest.join(", ");

  // Compagnia
  if (all.includes("figli") || all.includes("bambini") || all.includes("famiglia")) {
    const ageMatch = all.match(/figli[\s\w]*([\d]+)\s*e?\s*([\d]+)?/);
    profile.compagnia = ageMatch ? `famiglia con figli (${ageMatch[0]})` : "famiglia con figli";
  } else if (all.includes("coppia") || all.includes("moglie") || all.includes("marito") || all.includes("partner")) {
    profile.compagnia = "coppia";
  } else if (all.includes("amici")) {
    profile.compagnia = "con amici";
  } else if (all.includes("solo") || all.includes("sola")) {
    profile.compagnia = "solo/a";
  }

  // Budget
  const budgetMatch = all.match(/€?\s*(\d{2,4})\s*(?:euro|€)?/);
  if (budgetMatch) profile.budget = `~€${budgetMatch[1]}`;

  // Esperienze
  const exp = ["mare","spiaggia","montagna","cibo","ristorante","cultura","arte","museo","benessere","spa","terme","trekking","natura","vino","shopping","musica"];
  const foundExp = exp.filter((e) => all.includes(e));
  if (foundExp.length) profile.esperienze = foundExp.join(", ");

  return profile;
}

/* ─── Componenti ─────────────────────────────────────────────── */
function TipaAvatar({ pulse = false }: { pulse?: boolean }) {
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white ${pulse ? "animate-pulse" : ""}`}>
      T
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <TipaAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Pagina principale ──────────────────────────────────────── */
const OPENING = "Ciao! Sono TIPA 👋 Sarò il tuo concierge personale per l'Italia.\n\nPer darti suggerimenti davvero su misura, dimmi — dove stai pensando di andare e con chi? Raccontami liberamente, anche in modo vago.";

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, loading]);

  /* Primo messaggio TIPA */
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ from: "tipa", text: OPENING, time: nowTime() }]);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  /* Chiama Claude e streamma la risposta */
  const askTipa = useCallback(async (history: Message[]) => {
    setLoading(true);
    setStreamingText("");

    const profile = extractProfile(history);

    /* Converte messages nel formato Anthropic */
    const apiMessages = history.map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, profile }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        /* Rimuovi la keyword interna prima di mostrare */
        setStreamingText(full.replace("[[PROFILO_COMPLETO]]", "").trim());
      }

      /* Messaggio completato */
      const cleanText = full.replace("[[PROFILO_COMPLETO]]", "").trim();
      const isComplete = full.includes("[[PROFILO_COMPLETO]]");

      setMessages((prev) => [...prev, { from: "tipa", text: cleanText, time: nowTime() }]);
      setStreamingText("");

      if (isComplete) {
        setDone(true);
        /* Salva profilo */
        await fetch("/api/profile/taste", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profile, conversational: true, rawAnswers: history.filter(m => m.from === "user").map(m => m.text) }),
        }).catch(() => {});
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStreamingText("");
        setMessages((prev) => [
          ...prev,
          { from: "tipa", text: "Scusa, ho avuto un momento di esitazione. Riprova!", time: nowTime() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* Invia messaggio utente */
  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading || done) return;

    setInput("");
    const userMsg: Message = { from: "user", text: msg, time: nowTime() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    await askTipa(newHistory);
  }

  /* Microfono */
  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined;

    if (!SR) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = "it-IT";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let final = "", interim = "";
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput(final || interim);
    };
    rec.onend = () => {
      setListening(false);
      setInput((v) => {
        if (v.trim()) setTimeout(() => handleSend(v.trim()), 150);
        return v;
      });
    };

    recognitionRef.current = rec;
    rec.start();
  }

  /* Cleanup */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      recognitionRef.current?.stop();
    };
  }, []);

  /* Calcola progresso stimato dal profilo estratto */
  const profile = extractProfile(messages);
  const filledFields = [profile.destinazioni, profile.compagnia, profile.esperienze, profile.budget].filter(Boolean).length;
  const progress = Math.min(filledFields / 4, 1);

  return (
    <div className="flex h-screen flex-col bg-[#0C0A09] text-gray-100">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <TipaAvatar pulse={loading} />
        <div>
          <p className="text-sm font-medium">
            TIPA <span className="text-xs text-gray-500">· il tuo concierge</span>
          </p>
          <p className="text-xs text-gray-500">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            {loading ? "sta scrivendo…" : "Online ora"}
          </p>
        </div>

        {/* Barra progresso dinamica */}
        <div className="ml-auto flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-700 ${
                i < filledFields ? "w-6 bg-orange-500" : "w-4 bg-gray-800"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-gray-600">{Math.round(progress * 100)}%</span>
        </div>
      </header>

      {/* Messaggi */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 items-end ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
            {msg.from === "tipa" && <TipaAvatar />}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.from === "tipa"
                  ? "rounded-bl-sm bg-gray-800 text-gray-100"
                  : "rounded-br-sm bg-orange-600 text-white"
              }`}
            >
              {msg.text.split("\n").map((line, j, arr) => (
                <span key={j}>
                  {line}
                  {j < arr.length - 1 && <br />}
                </span>
              ))}
              <span className="mt-1 block text-right text-[10px] opacity-40">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Streaming in corso */}
        {streamingText && (
          <div className="flex gap-2 items-end">
            <TipaAvatar pulse />
            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-3 text-sm leading-relaxed text-gray-100">
              {streamingText.split("\n").map((line, j, arr) => (
                <span key={j}>
                  {line}
                  {j < arr.length - 1 && <br />}
                </span>
              ))}
              <span className="inline-block w-0.5 h-3.5 bg-orange-500 ml-0.5 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {/* Indicatore digitazione */}
        {loading && !streamingText && <TypingIndicator />}

        {done && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-600">Accesso al dashboard in corso…</p>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="border-t border-white/5 px-3 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            disabled={loading || done}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-lg transition-all disabled:opacity-40 ${
              listening
                ? "animate-pulse border-orange-500 bg-orange-600 text-white"
                : "border-gray-700 bg-gray-900 text-gray-400 hover:border-orange-500 hover:text-orange-400"
            }`}
            title={listening ? "Interrompi" : "Parla con TIPA"}
          >
            🎤
          </button>

          <div className={`flex flex-1 items-center gap-2 rounded-full border bg-gray-900 px-4 py-2.5 transition-colors ${
            loading || done ? "border-gray-800 opacity-50" : "border-gray-700 focus-within:border-orange-500"
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={listening ? "Ti sto ascoltando…" : done ? "Profilo completato ✓" : "Scrivi o parla con TIPA…"}
              disabled={loading || done}
              className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading || done}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-sm transition-colors hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              ↑
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-600">
          {listening
            ? "🎤 Ti sto ascoltando — parla liberamente"
            : "Rispondi liberamente — TIPA ricorda tutto quello che dici"}
        </p>
      </div>
    </div>
  );
}
