"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OnboardingProfiloForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      nome: (form.elements.namedItem("nome") as HTMLInputElement).value.trim() || undefined,
      cognome:
        (form.elements.namedItem("cognome") as HTMLInputElement).value.trim() || undefined,
    };

    const res = await fetch(`/api/companies/${companyId}/members/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Errore durante l'aggiornamento del profilo");
      setLoading(false);
      return;
    }

    router.push(`/onboarding/invita?companyId=${companyId}`);
  }

  function handleSkip() {
    router.push(`/onboarding/invita?companyId=${companyId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-orange-600">TipItaly B2B</span>
          <p className="mt-2 text-gray-500">Configura la tua azienda — Passo 2 di 3</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Il tuo profilo</h1>
          <p className="mb-6 text-sm text-gray-500">
            Opzionale — potrai aggiornarlo in seguito dal pannello di controllo.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label
                  htmlFor="cognome"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Cognome
                </label>
                <input
                  id="cognome"
                  name="cognome"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Rossi"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Salvataggio..." : "Continua"}
            </button>
          </form>

          <button
            onClick={handleSkip}
            className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Salta questo passo
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-300" />
          <span className="h-2 w-8 rounded-full bg-orange-600" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingProfiloPage() {
  return (
    <Suspense>
      <OnboardingProfiloForm />
    </Suspense>
  );
}
