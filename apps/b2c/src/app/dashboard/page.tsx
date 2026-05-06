import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cardholder = user
    ? await prisma.cardholder.findFirst({ where: { email: user.email ?? "" } })
    : null;

  const card = cardholder
    ? await prisma.card.findFirst({
        where: {
          assignment: { cardholderId: cardholder.id },
          status: "ACTIVE",
        },
      })
    : null;

  const [totalHotelBookings, totalFlightBookings] = await Promise.all([
    cardholder
      ? prisma.hotelBooking.count({ where: { cardholderId: cardholder.id } })
      : Promise.resolve(0),
    cardholder
      ? prisma.flightBooking.count({ where: { cardholderId: cardholder.id } })
      : Promise.resolve(0),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Benvenuto{cardholder ? `, ${cardholder.nome}` : ""}!</h1>
        <p className="mt-1 text-sm text-gray-500">Ecco un riepilogo del tuo account TipItaly.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Carta Attiva"
          value={card ? card.level : "—"}
          sublabel={card ? card.serialNumber : "Nessuna carta attiva"}
        />
        <StatCard label="Prenotazioni Hotel" value={totalHotelBookings} />
        <StatCard label="Prenotazioni Voli" value={totalFlightBookings} />
      </div>

      {!cardholder && (
        <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-semibold text-orange-800">Profilo non configurato</h2>
          <p className="mt-1 text-sm text-orange-700">
            Il tuo account non è ancora associato a un profilo. Contatta il supporto TipItaly per attivare l&apos;accesso.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {sublabel && <p className="mt-1 font-mono text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}
