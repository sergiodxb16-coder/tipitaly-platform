import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/acquista");

  const session = await getStripe().checkout.sessions.retrieve(session_id, {
    expand: ["line_items"],
  });

  const email = session.customer_details?.email ?? "—";
  const cardLevel = (session.metadata?.cardLevel ?? "WHITE") as string;
  const currency = (session.currency ?? "eur").toUpperCase();
  const total = session.amount_total ?? 0;
  const tax = session.total_details?.amount_tax ?? 0;

  function fmt(amount: number) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center text-4xl">🎉</div>
        <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">Acquisto confermato!</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Un&apos;email di conferma è stata inviata a <strong>{email}</strong>.
        </p>

        <dl className="mt-6 divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Card</dt>
            <dd className="font-semibold text-orange-600">{cardLevel}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Imponibile</dt>
            <dd>{fmt(total - tax)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">IVA</dt>
            <dd>{fmt(tax)}</dd>
          </div>
          <div className="flex justify-between py-2 font-semibold">
            <dt>Totale pagato</dt>
            <dd>{fmt(total)}</dd>
          </div>
        </dl>

        <a
          href="/attivazione"
          className="mt-6 block w-full rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
        >
          Attiva la tua card →
        </a>
      </div>
    </main>
  );
}
