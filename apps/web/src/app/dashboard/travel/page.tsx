import { createClient } from "@/lib/supabase/server";
import { prisma } from "@tip-italy/db";
import { getFeaturedTravelOffers } from "@tip-italy/db/travel";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Travel Advantage — TipItaly Card" };

const TRAVEL_ADVANTAGE_URL = process.env.TRAVEL_ADVANTAGE_URL ?? "https://www.traveladvantage.it";

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TravelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cardholder = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (!cardholder) redirect("/auth/login");

  const assignment = await prisma.cardAssignment.findFirst({
    where: { cardholderId: cardholder.id },
    include: { card: true },
  });

  const isCardActive = assignment?.card.status === "ACTIVE";
  const cardLevel = assignment?.card.level ?? "WHITE";
  const offers = isCardActive ? await getFeaturedTravelOffers(cardLevel as Parameters<typeof getFeaturedTravelOffers>[0]) : [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Soggiorni e Viaggi</h1>
        <Link href="/dashboard" className="text-sm text-orange-600 hover:underline">← Dashboard</Link>
      </div>

      {!isCardActive ? (
        <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-8 text-center">
          <p className="font-semibold text-orange-700">Card non attiva</p>
          <p className="mt-2 text-sm text-orange-600">Attiva la tua card per accedere a Travel Advantage.</p>
          <Link href="/attivazione" className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            Attiva la card →
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-6 mb-6">
            <h2 className="font-semibold text-blue-900 text-lg">Travel Advantage</h2>
            <p className="mt-2 text-sm text-blue-700">
              Accedi a soggiorni esclusivi fino all&apos;80% di sconto in strutture selezionate in Italia e nel mondo.
              Il primo mese di Travel Advantage è incluso nella tua card.
            </p>
            <a
              href={TRAVEL_ADVANTAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Accedi a Travel Advantage →
            </a>
          </div>

          {offers.length > 0 ? (
            <>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Offerte in Evidenza
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{offer.titolo}</p>
                    <p className="mt-1 text-xs text-gray-500">{offer.destinazione}</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600">-{offer.scontoPercent.toString()}%</p>
                    {offer.scadenza && (
                      <p className="mt-1 text-xs text-gray-400">Fino al {formatDate(offer.scadenza)}</p>
                    )}
                    {offer.travelAdvantageUrl ? (
                      <a
                        href={offer.travelAdvantageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
                      >
                        Scopri l&apos;offerta →
                      </a>
                    ) : (
                      <a
                        href={TRAVEL_ADVANTAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
                      >
                        Vedi su Travel Advantage →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                Le offerte in evidenza verranno aggiunte a breve.{" "}
                <a href={TRAVEL_ADVANTAGE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Sfoglia tutte le offerte su Travel Advantage →
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
