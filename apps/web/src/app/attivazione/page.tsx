import { activateCardAction } from "./actions";

interface AttivazionePgProps {
  searchParams: Promise<{ error?: string }>;
}

export const metadata = { title: "Attiva la tua TipItaly Card" };

export default async function AttivazioneCard({ searchParams }: AttivazionePgProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-600">Attiva la tua Card</h1>
          <p className="mt-2 text-gray-600">
            Inserisci il numero seriale che trovi sulla tua TipItaly Card.
          </p>
        </div>

        {params.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        )}

        <form action={activateCardAction} className="space-y-4">
          <div>
            <label htmlFor="serial" className="block text-sm font-medium text-gray-700">
              Numero seriale
            </label>
            <input
              id="serial"
              name="serial"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase shadow-sm tracking-widest focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="es. TIP-XXXX-XXXX"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Attiva card
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          La card deve essere attivata entro 30 giorni dal ricevimento.
          <br />
          Problemi?{" "}
          <a href="mailto:supporto@tipitaly.it" className="text-orange-600 underline">
            Contatta il supporto
          </a>
        </p>
      </div>
    </main>
  );
}
