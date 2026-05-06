import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  WHITE: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  GOLD: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-300" },
  PLATINUM: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-300" },
};

export default async function CartaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cardholder = user
    ? await prisma.cardholder.findFirst({ where: { email: user.email ?? "" } })
    : null;

  const cards = cardholder
    ? await prisma.card.findMany({
        where: { assignment: { cardholderId: cardholder.id } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const activeCard = cards.find((c) => c.status === "ACTIVE") ?? null;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">La Mia Carta</h1>
      <p className="mb-8 text-sm text-gray-500">Visualizza i dettagli della tua TipItaly Card.</p>

      {!cardholder ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          Profilo non trovato. Contatta il supporto.
        </div>
      ) : activeCard ? (
        <>
          <div
            className={`mb-8 rounded-2xl border-2 p-8 ${LEVEL_STYLES[activeCard.level]?.border ?? "border-gray-200"} ${LEVEL_STYLES[activeCard.level]?.bg ?? "bg-gray-50"}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">TipItaly Card</p>
                <p className={`mt-2 text-4xl font-bold ${LEVEL_STYLES[activeCard.level]?.text ?? "text-gray-700"}`}>
                  {activeCard.level}
                </p>
              </div>
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Attiva
              </span>
            </div>
            <div className="mt-8">
              <p className="font-mono text-lg tracking-wider text-gray-700">{activeCard.serialNumber}</p>
              <p className="mt-1 text-sm text-gray-500">
                {cardholder.nome} {cardholder.cognome}
              </p>
            </div>
            {activeCard.expiresAt && (
              <p className="mt-4 text-xs text-gray-400">
                Scadenza: {new Date(activeCard.expiresAt).toLocaleDateString("it-IT")}
              </p>
            )}
          </div>

          {cards.length > 1 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-700">Storico Carte</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Seriale", "Livello", "Stato", "Emessa"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cards.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-700">{c.serialNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{c.level}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString("it-IT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold text-orange-800">Nessuna carta attiva</h2>
          <p className="mt-1 text-sm text-orange-700">
            Non hai ancora una TipItaly Card attiva. Contatta la tua agenzia di riferimento.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-yellow-100 text-yellow-700",
    EXPIRED: "bg-red-100 text-red-600",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Attiva",
    INACTIVE: "Inattiva",
    EXPIRED: "Scaduta",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
