import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function ProfiloPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Profilo Agenzia</h1>

      {!company ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold text-orange-800">Agenzia non configurata</h2>
          <p className="mt-1 text-sm text-orange-700">
            Contatta il supporto TipItaly per associare questo account alla tua agenzia.
          </p>
        </div>
      ) : (
        <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <dl className="space-y-4">
            <Field label="Ragione Sociale" value={company.ragioneSociale} />
            <Field label="Partita IVA" value={company.pIva} />
            <Field label="Email Referente" value={company.emailReferente} />
            <Field label="ID Agenzia" value={company.id} mono />
            <Field
              label="Registrata il"
              value={new Date(company.createdAt).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </dl>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        Per modificare i dati agenzia contatta{" "}
        <a href="mailto:b2b@tipitalycard.com" className="text-orange-600 underline">
          b2b@tipitalycard.com
        </a>
        .
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
