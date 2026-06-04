"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { MicIcon } from "@/components/icons";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

/* ─── Tipi ───────────────────────────────────────────────────── */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  streaming?: boolean;
}

/* ─── Utils ──────────────────────────────────────────────────── */
function nowTime() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function uid() {
  return Math.random().toString(36).slice(2);
}

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
  const tNav = useTranslations("nav");
  const items = [
    {
      id: "home",
      label: tNav("home"),
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "esplora",
      label: tNav("explore"),
      href: "/dashboard/esplora",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "wallet",
      label: tNav("wallet"),
      href: "/dashboard/wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "tipa",
      label: tNav("concierge"),
      href: "/dashboard/tipa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: "profilo",
      label: tNav("profile"),
      href: "/profilo",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-sm px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              item.id === "tipa" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ─── Indicatore digitazione ─────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/* ─── Markdown inline renderer ───────────────────────────────── */
function renderInline(text: string): React.ReactNode[] {
  // Handles **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-gray-100 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function renderMarkdown(content: string): React.ReactNode {
  return content.split("\n").map((line, i, arr) => (
    <span key={i}>
      {renderInline(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

/* ─── Bolla messaggio ────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar concierge */}
      {!isUser && (
        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-xs shadow">
          👩‍💼
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? "" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-sm bg-orange-600 text-white"
              : "rounded-bl-sm bg-white text-gray-900 shadow-sm border border-gray-100"
          }`}
        >
          {msg.content ? (
            renderMarkdown(msg.content)
          ) : (
            msg.streaming && <TypingDots />
          )}
          {msg.streaming && msg.content && (
            <span className="inline-block w-0.5 h-3.5 bg-orange-400 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        <p className={`mt-1 text-[10px] text-gray-400 ${isUser ? "text-right pr-1" : "pl-1"}`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

/* ─── Pagina principale ──────────────────────────────────────── */
export default function TipaPage() {
  const tc = useTranslations("concierge");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tripDest = searchParams.get("dest");
  const tripCheckin = searchParams.get("checkin");
  const tripCheckout = searchParams.get("checkout");
  const tripPax = searchParams.get("pax");
  const tripGruppo = searchParams.get("gruppo");

  function buildWelcome(dest?: string | null, checkin?: string | null, checkout?: string | null, pax?: string | null, gruppo?: string | null): Message {
    if (dest) {
      const giorni = checkin && checkout
        ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86_400_000))
        : null;
      const dateLabel = checkin && checkout
        ? ` ${new Date(checkin).toLocaleDateString(locale, { day: "numeric", month: "long" })} – ${new Date(checkout).toLocaleDateString(locale, { day: "numeric", month: "long" })}`
        : "";
      const gruppoLabel = gruppo ? ` · ${gruppo}` : (pax && Number(pax) > 1 ? ` · ${pax}` : "");
      return {
        id: "welcome",
        role: "assistant",
        content: tc("welcomeWithDest", {
          days: giorni ? tc("days", { n: giorni }) : dest,
          dest,
          dates: dateLabel,
          group: gruppoLabel,
        }),
        time: nowTime(),
      };
    }
    return {
      id: "welcome",
      role: "assistant",
      content: tc("welcomeGeneric"),
      time: nowTime(),
    };
  }

  const [messages, setMessages] = useState<Message[]>(() => [
    buildWelcome(tripDest, tripCheckin, tripCheckout, tripPax, tripGruppo),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Invia messaggio */
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");

    const userMsg: Message = { id: uid(), role: "user", content: trimmed, time: nowTime() };
    const pendingId = uid();
    const pendingMsg: Message = {
      id: pendingId,
      role: "assistant",
      content: "",
      time: nowTime(),
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setLoading(true);

    // Costruisci history per l'API (escludi il messaggio placeholder)
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errMsg = tc("errorGeneric");
        try { errMsg = JSON.parse(errText).error ?? errMsg; } catch { /* noop */ }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId ? { ...m, content: `⚠️ ${errMsg}`, streaming: false } : m
          )
        );
        return;
      }
      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snap = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId ? { ...m, content: snap, streaming: true } : m
          )
        );
      }

      // Finalizza
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, content: accumulated, streaming: false } : m
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, content: tc("errorGeneric"), streaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  /* Invio con Enter */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  /* Microfono */
  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined;

    if (!SR) {
      alert("Riconoscimento vocale non supportato su questo browser.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = locale === "en" ? "en-GB" : locale === "de" ? "de-CH" : locale === "fr" ? "fr-CH" : "it-IT";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let final = "";
      let interim = "";
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput(final || interim);
    };
    rec.onend = () => {
      setListening(false);
      setInput((v) => {
        if (v.trim()) setTimeout(() => sendMessage(v.trim()), 150);
        return v;
      });
    };
    rec.onerror = () => setListening(false);

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

  return (
    <div className="flex flex-col h-screen bg-[#F7F5F3] text-gray-900">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 bg-orange-600 px-4 py-3 sticky top-0 z-30">
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base shadow">
          👩‍💼
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">Sofia</p>
          <p className="flex items-center gap-1.5 text-[11px] text-orange-100">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${loading ? "bg-yellow-300 animate-pulse" : "bg-green-300"}`} />
            {loading ? tc("isTyping") : tc("onlineNow")}
          </p>
        </div>
        <span className="text-xl font-bold italic text-white">TipItaly</span>
        {/* Pulsante pulizia chat */}
        <button
          onClick={() => {
            setMessages([buildWelcome(tripDest, tripCheckin, tripCheckout, tripPax, tripGruppo)]);
          }}
          className="text-orange-100 hover:text-white transition-colors p-1.5"
          title={tc("newConversation")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {/* ── Messaggi ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Quick replies — solo all'inizio della conversazione */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pl-10">
            {[
              "🏨 Trova un hotel",
              "🌅 Pianifica un weekend",
              "🍝 Consigliami un ristorante",
              "✈️ Cerca un volo",
            ].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q.replace(/^\S+\s/, ""))}
                className="rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-medium text-orange-700 shadow-sm transition-colors hover:bg-orange-50 active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── Input ── */}
      <div className="border-t border-gray-100 bg-white px-3 pt-3 pb-20">
        <div className="flex items-center gap-2">
          {/* Mic */}
          <button
            onClick={toggleMic}
            disabled={loading}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-base transition-all disabled:opacity-40 ${
              listening
                ? "animate-pulse border-orange-500 bg-orange-600 text-white"
                : "border-gray-200 bg-white text-gray-500 hover:border-orange-400 hover:text-orange-500"
            }`}
            title={listening ? tc("micStop") : tc("micTitle")}
          >
            <MicIcon className="h-5 w-5" />
          </button>

          {/* Text input */}
          <div
            className={`flex flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2.5 transition-colors ${
              loading ? "border-gray-200 opacity-50" : "border-gray-200 focus-within:border-orange-400"
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                listening
                  ? tc("listeningPlaceholder")
                  : loading
                  ? tc("typingPlaceholder")
                  : tc("inputPlaceholder")
              }
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-sm transition-colors hover:bg-orange-700 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              ↑
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          {listening ? tc("footerListening") : tc("footer")}
        </p>
      </div>

      {/* ── Bottom Nav ── */}
      <BottomNav />
    </div>
  );
}
