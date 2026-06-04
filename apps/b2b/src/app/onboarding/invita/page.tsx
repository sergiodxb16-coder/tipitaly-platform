"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function parseEmailsFromCsv(text: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const cell = line.split(",")[0].trim().replace(/^"|"$/g, "");
    if (cell.includes("@") && cell.includes(".")) {
      const lower = cell.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        emails.push(lower);
      }
    }
  }
  return emails;
}

function OnboardingInvitaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    { email: string; status: "invited" | "already_active" | "error" }[] | null
  >(null);
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleCsvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvEmails(parseEmailsFromCsv(text));
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    const form = e.currentTarget;
    const rawText = (form.elements.namedItem("emails") as HTMLTextAreaElement).value;
    const manualEmails = rawText
      .split(/[\n,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.includes("@"));

    const allEmails = Array.from(new Set([...manualEmails, ...csvEmails]));

    if (allEmails.length === 0) {
      router.push("/onboarding/completato");
      return;
    }

    const res = await fetch(`/api/companies/${companyId}/members/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: allEmails }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Errore durante l'invio degli inviti");
      setLoading(false);
      return;
    }

    setResults(json.results);
    setLoading(false);
  }

  if (results) {
    const invited = results.filter((r) => r.status === "invited").length;
    const errors = results.filter((r) => r.status === "error").length;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <span className="text-3xl font-bold text-orange-600">TipItaly B2B</span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-xl font-bold text-gray-900">Inviti inviati</h1>
            <p className="mb-6 text-sm text-gray-600">
              {invited} invit{invited === 1 ? "o inviato" : "i inviati"} con successo
              {errors > 0 && `, ${errors} falliti`}.
            </p>
            <div className="mb-6 max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50">
              {results.map((r) => (
                <div
                  key={r.email}
                  className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-sm last:border-0"
                >
                  <span className="text-gray-700">{r.email}</span>
                  <span
                    className={
                      r.status === "invited"
                        ? "text-green-600"
                        : r.status === "already_active"
                          ? "text-gray-400"
                          : "text-red-500"
                    }
                  >
                    {r.status === "invited"
                      ? "Inviato"
                      : r.status === "already_active"
                        ? "Già attivo"
                        : "Errore"}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/onboarding/completato")}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Vai alla dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-orange-600">TipItaly B2B</span>
          <p className="mt-2 text-gray-500">Configura la tua azienda — Passo 3 di 3</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Invita i dipendenti</h1>
          <p className="mb-6 text-sm text-gray-500">
            Opzionale — puoi invitare altri dipendenti in seguito dalla dashboard.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="emails" className="mb-1 block text-sm font-medium text-gray-700">
                Indirizzi email (uno per riga o separati da virgola)
              </label>
              <textarea
                id="emails"
                name="emails"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder={"mario.rossi@azienda.it\nlucia.bianchi@azienda.it"}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Oppure carica un file CSV
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvChange}
                className="w-full text-sm text-gray-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-100"
              />
              {csvEmails.length > 0 && (
                <p className="mt-1 text-xs text-green-600">
                  {csvEmails.length} email trovat{csvEmails.length === 1 ? "a" : "e"} nel file
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Il CSV deve avere le email nella prima colonna.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Invio in corso..." : "Invia inviti"}
            </button>
          </form>

          <button
            onClick={() => router.push("/onboarding/completato")}
            className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Salta e vai alla dashboard
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-300" />
          <span className="h-2 w-2 rounded-full bg-orange-300" />
          <span className="h-2 w-8 rounded-full bg-orange-600" />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingInvitaPage() {
  return (
    <Suspense>
      <OnboardingInvitaForm />
    </Suspense>
  );
}
