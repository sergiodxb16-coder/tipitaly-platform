import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata?.role as string | undefined) ?? "";

  if (role === "company_employee") {
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
    return <EmployeeDashboard webUrl={webUrl} />;
  }

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  const companyFilter = company
    ? { cardholder: { cardAssignments: { some: { cardBatch: { companyId: company.id } } } } }
    : null;

  const [
    activeMemberCount,
    pendingMemberCount,
    totalBatches,
    totalCards,
    totalHotelBookings,
    totalFlightBookings,
    hotelSpend,
    flightSpend,
  ] = await Promise.all([
    company
      ? prisma.companyMember.count({ where: { companyId: company.id, status: "ACTIVE" } })
      : Promise.resolve(0),
    company
      ? prisma.companyMember.count({ where: { companyId: company.id, status: "PENDING" } })
      : Promise.resolve(0),
    company
      ? prisma.cardBatch.count({ where: { companyId: company.id } })
      : Promise.resolve(0),
    company
      ? prisma.card.count({ where: { cardBatch: { companyId: company.id } } })
      : Promise.resolve(0),
    companyFilter
      ? prisma.hotelBooking.count({ where: companyFilter })
      : Promise.resolve(0),
    companyFilter
      ? prisma.flightBooking.count({ where: companyFilter })
      : Promise.resolve(0),
    companyFilter
      ? prisma.hotelBooking.aggregate({
          where: { ...companyFilter, status: "CONFIRMED" },
          _sum: { totalPrice: true },
        })
      : Promise.resolve({ _sum: { totalPrice: null } }),
    companyFilter
      ? prisma.flightBooking.aggregate({
          where: { ...companyFilter, status: "CONFIRMED" },
          _sum: { totalPrice: true },
        })
      : Promise.resolve({ _sum: { totalPrice: null } }),
  ]);

  const hotelTotal = Number(hotelSpend._sum.totalPrice ?? 0);
  const flightTotal = Number(flightSpend._sum.totalPrice ?? 0);
  const budgetTotal = hotelTotal + flightTotal;
  const totalBookings = totalHotelBookings + totalFlightBookings;
  const budgetAvg = totalBookings > 0 ? budgetTotal / totalBookings : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panoramica</h1>
        {company && (
          <p className="mt-1 text-sm text-gray-500">{company.ragioneSociale}</p>
        )}
      </div>

      {/* Dipendenti */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dipendenti</h2>
          <Link href="/dashboard/team" className="text-xs font-medium text-orange-600 hover:underline">
            Gestisci team →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Attivi" value={activeMemberCount} accent="green" />
          <StatCard label="In attesa" value={pendingMemberCount} accent="yellow" />
          <StatCard label="Lotti Carte" value={totalBatches} />
          <StatCard label="Carte Totali" value={totalCards} />
        </div>
      </section>

      {/* Prenotazioni */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Prenotazioni</h2>
          <Link href="/dashboard/prenotazioni" className="text-xs font-medium text-orange-600 hover:underline">
            Vedi dettaglio →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Hotel" value={totalHotelBookings} />
          <StatCard label="Voli" value={totalFlightBookings} />
          <BudgetCard label="Spesa Totale" value={budgetTotal} />
          <BudgetCard label="Spesa Media" value={budgetAvg} />
        </div>
      </section>

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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "yellow";
}) {
  const accentStyles = {
    green: "border-green-200 bg-green-50",
    yellow: "border-yellow-200 bg-yellow-50",
  };
  const valueStyles = {
    green: "text-green-700",
    yellow: "text-yellow-700",
  };
  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${
        accent ? accentStyles[accent] : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? valueStyles[accent] : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function BudgetCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        €{value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function EmployeeDashboard({ webUrl }: { webUrl: string }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Benvenuto</h1>
        <p className="mt-1 text-sm text-gray-500">
          Accedi ai vantaggi di viaggio riservati ai dipendenti della tua azienda.
        </p>
      </div>

      <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">✈️</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Prenota un viaggio</h2>
            <p className="mt-2 text-sm text-gray-600">
              Accedi al portale viaggi TipItaly per prenotare hotel e voli a tariffe esclusive
              riservate alla tua azienda.
            </p>
            <Link
              href={`${webUrl}/dashboard/travel`}
              className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              Prenota un viaggio →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
