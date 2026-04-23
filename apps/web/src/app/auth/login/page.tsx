import { sendMagicLink } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ sent?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-600">TipItaly Card</h1>
          <p className="mt-2 text-gray-600">Accedi al tuo portale vantaggi</p>
        </div>

        {params.sent && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Link di accesso inviato! Controlla la tua email e clicca il link per entrare.
          </div>
        )}

        {params.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        )}

        {!params.sent && (
          <form action={sendMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Indirizzo email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="la-tua-email@esempio.it"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Invia link di accesso
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          Riceverai un link sicuro via email — nessuna password richiesta.
        </p>
      </div>
    </main>
  );
}
