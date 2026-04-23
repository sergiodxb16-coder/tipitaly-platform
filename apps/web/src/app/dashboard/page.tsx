import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { getCardForCardholder } from "@tip-italy/db/cards";
import { CardStatusWidget } from "@/components/card-status-widget";
import { BenefitsGrid } from "@/components/benefits-grid";
import { redirect } from "next/navigation";
import Link from "next/link";

interface DashboardPageProps {
  searchParams: Promise<{ activated?: string }>;
}

export const metadata = { title: "Dashboard — TipItaly Card" };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const params = await searchParams;

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) redirect("/auth/login");

  const assignment = await getCardForCardholder(cardholder.id);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-orange-600">TipItaly Card</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">{cardholder.email}</span>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {params.activated && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            🎉 Card attivata con successo! Benvenuto nei tuoi vantaggi esclusivi.
          </div>
        )}

        {!assignment ? (
          <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-8 text-center">
            <p className="text-lg font-semibold text-orange-700">Nessuna card attivata</p>
            <p className="mt-2 text-sm text-orange-600">
              Hai ricevuto la tua TipItaly Card? Attivala ora per accedere ai vantaggi.
            </p>
            <Link
              href="/attivazione"
              className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Attiva la card →
            </Link>
          </div>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                La tua Card
              </h2>
              <CardStatusWidget
                level={assignment.card.level}
                status={assignment.card.status}
                serialNumber={assignment.card.serialNumber}
                expiresAt={assignment.card.expiresAt}
                activatedAt={assignment.card.activatedAt}
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                I tuoi Vantaggi
              </h2>
              <BenefitsGrid level={assignment.card.level} />
            </section>
          </>
        )}

        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700">Il tuo Profilo</h2>
          <p className="mt-1 text-sm text-gray-500">
            {cardholder.nome} {cardholder.cognome} — {cardholder.email}
          </p>
          <Link href="/profilo" className="mt-2 inline-block text-xs text-orange-600 hover:underline">
            Modifica profilo →
          </Link>
        </section>
      </div>
    </main>
  );
}
