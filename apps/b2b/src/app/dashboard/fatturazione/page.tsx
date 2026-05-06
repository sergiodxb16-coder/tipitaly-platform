import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function FatturazionePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  const batches = company
    ? await prisma.cardBatch.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { cards: true, assignments: true } } },
      })
    : [];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Fatturazione</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Lotti Acquistati</h2>
        {batches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
            Nessun lotto acquistato.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Codice Lotto", "Carte Totali", "Assegnate", "Data Acquisto"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-800">{b.batchCode}</td>
                    <td className="px-4 py-3 text-gray-700">{b.quantity}</td>
                    <td className="px-4 py-3 text-gray-700">{b._count.assignments}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        Per scaricare le fatture contatta il tuo referente TipItaly oppure scrivi a{" "}
        <a href="mailto:b2b@tipitalycard.com" className="underline">
          b2b@tipitalycard.com
        </a>
        .
      </div>
    </div>
  );
}
