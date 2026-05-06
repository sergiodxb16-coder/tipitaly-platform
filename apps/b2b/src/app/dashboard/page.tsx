import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  const [totalBatches, totalCards, totalHotelBookings, totalFlightBookings] = await Promise.all([
    company
      ? prisma.cardBatch.count({ where: { companyId: company.id } })
      : Promise.resolve(0),
    company
      ? prisma.card.count({ where: { cardBatch: { companyId: company.id } } })
      : Promise.resolve(0),
    Promise.resolve(0),
    Promise.resolve(0),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panoramica</h1>
        {company && (
          <p className="mt-1 text-sm text-gray-500">{company.ragioneSociale}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lotti Carte" value={totalBatches} />
        <StatCard label="Carte Totali" value={totalCards} />
        <StatCard label="Prenotazioni Hotel" value={totalHotelBookings} />
        <StatCard label="Prenotazioni Voli" value={totalFlightBookings} />
      </div>

      {!company && (
        <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold text-orange-800">Agenzia non configurata</h2>
          <p className="mt-1 text-sm text-orange-700">
            Il tuo account non è ancora associato a un&apos;agenzia partner. Contatta il supporto TipItaly per attivare l&apos;accesso.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
