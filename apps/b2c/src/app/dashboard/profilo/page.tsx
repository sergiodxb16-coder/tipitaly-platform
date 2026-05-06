import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function ProfiloPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cardholder = user
    ? await prisma.cardholder.findFirst({ where: { email: user.email ?? "" } })
    : null;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Il Mio Profilo</h1>
      <p className="mb-8 text-sm text-gray-500">I tuoi dati personali associati alla TipItaly Card.</p>

      {!cardholder ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold text-orange-800">Profilo non configurato</h2>
          <p className="mt-1 text-sm text-orange-700">
            Il tuo account non è ancora associato a un profilo. Contatta il supporto TipItaly.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Field label="Nome" value={cardholder.nome} />
            <Field label="Cognome" value={cardholder.cognome} />
            <Field label="Email" value={cardholder.email} />
            <Field
              label="Membro dal"
              value={new Date(cardholder.createdAt).toLocaleDateString("it-IT")}
            />
          </dl>
          <p className="mt-6 text-xs text-gray-400">
            Per aggiornare i tuoi dati contatta il supporto TipItaly o la tua agenzia di riferimento.
          </p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Account</h2>
        <dl className="space-y-2">
          <Field label="Email di accesso" value={user?.email ?? "—"} />
          <Field
            label="Ultimo accesso"
            value={
              user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString("it-IT")
                : "—"
            }
          />
        </dl>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
