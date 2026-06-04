import { verifyInviteToken } from "@/lib/invite-token";
import { prisma } from "@tip-italy/db";
import { acceptInvite } from "./actions";

interface Props {
  searchParams: Promise<{ token?: string; error?: string; sent?: string; email?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token, error, sent, email } = await searchParams;

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="text-xl font-bold text-gray-900">Controlla la tua email</h1>
          <p className="mt-2 text-sm text-gray-600">
            Abbiamo inviato un link magico a{" "}
            <strong>{email ?? "il tuo indirizzo email"}</strong>.
            Clicca il link nell&apos;email per completare l&apos;accesso.
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-xl font-bold text-red-700">Link non valido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Il link di invito è mancante o malformato.
          </p>
        </div>
      </div>
    );
  }

  const payload = verifyInviteToken(token);

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-xl font-bold text-red-700">Invito scaduto o non valido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Questo link di invito non è più valido. Chiedi all&apos;amministratore di inviarti un nuovo invito.
          </p>
        </div>
      </div>
    );
  }

  const company = await prisma.company.findUnique({ where: { id: payload.companyId } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl font-bold text-orange-600">TipItaly</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center">Sei stato invitato</h1>
        <p className="mt-2 text-sm text-gray-600 text-center">
          <strong>{company?.ragioneSociale ?? "Un&apos;azienda"}</strong> ti ha invitato ad
          accedere al portale B2B TipItaly.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error === "token_invalid"
              ? "Il token non è valido. Richiedi un nuovo invito."
              : decodeURIComponent(error)}
          </div>
        )}

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium">Verrai invitato come:</p>
          <p className="mt-1 text-gray-500">{payload.email}</p>
        </div>

        <form
          action={async () => {
            "use server";
            await acceptInvite(token);
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Accetta invito e ricevi link di accesso
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Riceverai un link via email per completare l&apos;accesso.
        </p>
      </div>
    </div>
  );
}
