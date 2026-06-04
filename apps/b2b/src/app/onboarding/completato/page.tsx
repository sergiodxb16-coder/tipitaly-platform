import Link from "next/link";

export default function OnboardingCompletatoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <span className="text-3xl font-bold text-orange-600">TipItaly B2B</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">Configurazione completata!</h1>
          <p className="mb-8 text-sm text-gray-500">
            La tua azienda è ora attiva su TipItaly B2B. I dipendenti invitati riceveranno
            un&apos;email con le istruzioni per accedere.
          </p>

          <Link
            href="/dashboard"
            className="inline-block w-full rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Vai alla dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
