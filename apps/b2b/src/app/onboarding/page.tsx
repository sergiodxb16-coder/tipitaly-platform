"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      ragioneSociale: (form.elements.namedItem("ragioneSociale") as HTMLInputElement).value,
      pIva: (form.elements.namedItem("pIva") as HTMLInputElement).value,
      emailReferente: (form.elements.namedItem("emailReferente") as HTMLInputElement).value,
    };

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (res.status === 409 && json.companyId) {
      router.push(`/onboarding/profilo?companyId=${json.companyId}`);
      return;
    }

    if (!res.ok) {
      setError(json.error ?? "Errore durante la registrazione");
      setLoading(false);
      return;
    }

    router.push(`/onboarding/profilo?companyId=${json.companyId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-orange-600">TipItaly B2B</span>
          <p className="mt-2 text-gray-500">Configura la tua azienda — Passo 1 di 3</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-gray-900">Dati azienda</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="ragioneSociale"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Ragione sociale *
              </label>
              <input
                id="ragioneSociale"
                name="ragioneSociale"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Acme S.r.l."
              />
            </div>

            <div>
              <label htmlFor="pIva" className="mb-1 block text-sm font-medium text-gray-700">
                Partita IVA *
              </label>
              <input
                id="pIva"
                name="pIva"
                type="text"
                required
                maxLength={11}
                pattern="[0-9]{11}"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="12345678901"
              />
              <p className="mt-1 text-xs text-gray-400">11 cifre numeriche senza spazi</p>
            </div>

            <div>
              <label
                htmlFor="emailReferente"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email referente *
              </label>
              <input
                id="emailReferente"
                name="emailReferente"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="referente@azienda.it"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Salvataggio..." : "Continua"}
            </button>
          </form>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-2 w-8 rounded-full bg-orange-600" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
