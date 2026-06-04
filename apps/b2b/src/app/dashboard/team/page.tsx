import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  const members = company
    ? await prisma.companyMember.findMany({
        where: { companyId: company.id },
        orderBy: [{ status: "asc" }, { invitedAt: "desc" }],
      })
    : [];

  const counts = {
    ACTIVE: members.filter((m) => m.status === "ACTIVE").length,
    PENDING: members.filter((m) => m.status === "PENDING").length,
    SUSPENDED: members.filter((m) => m.status === "SUSPENDED").length,
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Team</h1>
      <p className="mb-8 text-sm text-gray-500">Dipendenti invitati e gestione accessi.</p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-xs font-medium uppercase text-green-600">Attivi</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{counts.ACTIVE}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-xs font-medium uppercase text-yellow-600">In attesa</p>
          <p className="mt-1 text-2xl font-bold text-yellow-700">{counts.PENDING}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-xs font-medium uppercase text-gray-500">Sospesi</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">{counts.SUSPENDED}</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          Nessun dipendente ancora invitato.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Nome", "Email", "Ruolo", "Stato", "Invitato il", "Attivato il"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {m.nome || m.cognome
                      ? `${m.nome ?? ""} ${m.cognome ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-4 py-3">
                    <MemberStatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(m.invitedAt).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.activatedAt ? new Date(m.activatedAt).toLocaleDateString("it-IT") : "—"}
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

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        isAdmin ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {isAdmin ? "Admin" : "Dipendente"}
    </span>
  );
}

function MemberStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Attivo",
    PENDING: "In attesa",
    SUSPENDED: "Sospeso",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
