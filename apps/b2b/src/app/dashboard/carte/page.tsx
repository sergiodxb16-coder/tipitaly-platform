import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function CartePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  const cards = company
    ? await prisma.card.findMany({
        where: { cardBatch: { companyId: company.id } },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          assignment: {
            include: { cardholder: { select: { nome: true, cognome: true, email: true } } },
          },
        },
      })
    : [];

  const byStatus = {
    ACTIVE: cards.filter((c) => c.status === "ACTIVE").length,
    INACTIVE: cards.filter((c) => c.status === "INACTIVE").length,
    EXPIRED: cards.filter((c) => c.status === "EXPIRED").length,
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Gestione Carte</h1>
      <p className="mb-8 text-sm text-gray-500">Visualizza e monitora le carte associate alla tua agenzia.</p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-xs font-medium uppercase text-green-600">Attive</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{byStatus.ACTIVE}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-xs font-medium uppercase text-yellow-600">Inattive</p>
          <p className="mt-1 text-2xl font-bold text-yellow-700">{byStatus.INACTIVE}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
          <p className="text-xs font-medium uppercase text-red-500">Scadute</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{byStatus.EXPIRED}</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          Nessuna carta trovata.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Numero Seriale", "Livello", "Stato", "Titolare", "Email", "Attivata"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-800">{c.serialNumber}</td>
                  <td className="px-4 py-3">
                    <LevelBadge level={c.level} />
                  </td>
                  <td className="px-4 py-3">
                    <CardStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.assignment ? `${c.assignment.cardholder.nome} ${c.assignment.cardholder.cognome}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.assignment?.cardholder.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.activatedAt ? new Date(c.activatedAt).toLocaleDateString("it-IT") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    WHITE: "bg-gray-100 text-gray-600",
    GOLD: "bg-yellow-100 text-yellow-700",
    PLATINUM: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[level] ?? "bg-gray-100 text-gray-600"}`}>
      {level}
    </span>
  );
}

function CardStatusBadge({ status }: { status: string }) {
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
