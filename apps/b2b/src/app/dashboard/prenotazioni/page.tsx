import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";

export default async function PrenotazioniPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = user
    ? await prisma.company.findFirst({ where: { emailReferente: user.email ?? "" } })
    : null;

  const hotelBookings = company
    ? await prisma.hotelBooking.findMany({
        where: {
          cardholder: {
            cardAssignments: {
              some: { cardBatch: { companyId: company.id } },
            },
          },
        },
        orderBy: { bookedAt: "desc" },
        take: 50,
        include: { cardholder: { select: { nome: true, cognome: true, email: true } } },
      })
    : [];

  const flightBookings = company
    ? await prisma.flightBooking.findMany({
        where: {
          cardholder: {
            cardAssignments: {
              some: { cardBatch: { companyId: company.id } },
            },
          },
        },
        orderBy: { bookedAt: "desc" },
        take: 50,
        include: { cardholder: { select: { nome: true, cognome: true, email: true } } },
      })
    : [];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Prenotazioni</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Hotel ({hotelBookings.length})</h2>
        {hotelBookings.length === 0 ? (
          <EmptyState message="Nessuna prenotazione hotel." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Titolare", "Hotel", "Città", "Check-in", "Check-out", "Prezzo", "Stato"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotelBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{b.cardholder.nome} {b.cardholder.cognome}</td>
                    <td className="px-4 py-3 text-gray-700">{b.hotelName}</td>
                    <td className="px-4 py-3 text-gray-500">{b.city}</td>
                    <td className="px-4 py-3 text-gray-500">{b.checkin}</td>
                    <td className="px-4 py-3 text-gray-500">{b.checkout}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.currency} {Number(b.totalPrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Voli ({flightBookings.length})</h2>
        {flightBookings.length === 0 ? (
          <EmptyState message="Nessuna prenotazione volo." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Titolare", "Tratta", "Partenza", "Ritorno", "Prezzo", "Stato"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {flightBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{b.cardholder.nome} {b.cardholder.cognome}</td>
                    <td className="px-4 py-3 text-gray-700">{b.origin} → {b.destination}</td>
                    <td className="px-4 py-3 text-gray-500">{b.departureDate}</td>
                    <td className="px-4 py-3 text-gray-500">{b.returnDate ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.currency} {Number(b.totalPrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "CONFIRMED";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {isActive ? "Confermata" : "Annullata"}
    </span>
  );
}
