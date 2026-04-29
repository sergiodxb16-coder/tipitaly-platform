import { CardLevel } from "@tip-italy/db";
import Link from "next/link";

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  minLevel: CardLevel;
  contactInfo?: string;
}

const BENEFITS: Benefit[] = [
  {
    id: "travel",
    title: "Travel Advantage",
    description: "Soggiorni esclusivi fino all'80% di sconto in strutture selezionate.",
    icon: "✈️",
    href: "/dashboard/travel",
    minLevel: CardLevel.WHITE,
  },
  {
    id: "coupon",
    title: "Coupon Partner",
    description: "Sconti e offerte esclusive nei migliori negozi e ristoranti partner.",
    icon: "🎟️",
    href: "/dashboard/coupon",
    minLevel: CardLevel.WHITE,
  },
  {
    id: "partner",
    title: "Scopri i Partner",
    description: "Trova partner per categoria, città e posizione con mappa interattiva.",
    icon: "📍",
    href: "/dashboard/partner",
    minLevel: CardLevel.WHITE,
  },
  {
    id: "tutela",
    title: "Tutela Legale 24/7",
    description: "Assistenza legale su incidenti, controversie di lavoro e spese mediche.",
    icon: "⚖️",
    href: "/dashboard/tutela",
    minLevel: CardLevel.GOLD,
    contactInfo: "800 123 456",
  },
  {
    id: "soccorso",
    title: "Soccorso Stradale 24/7",
    description: "Carro attrezzi e auto sostitutiva in Italia e Europa.",
    icon: "🚗",
    href: "/dashboard/soccorso",
    minLevel: CardLevel.PLATINUM,
    contactInfo: "800 789 012",
  },
];

const LEVEL_ORDER: Record<CardLevel, number> = {
  WHITE: 0,
  GOLD: 1,
  PLATINUM: 2,
};

function isIncluded(benefit: Benefit, userLevel: CardLevel): boolean {
  return LEVEL_ORDER[userLevel] >= LEVEL_ORDER[benefit.minLevel];
}

interface BenefitsGridProps {
  level: CardLevel;
}

export function BenefitsGrid({ level }: BenefitsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {BENEFITS.map((benefit) => {
        const included = isIncluded(benefit, level);
        return (
          <div
            key={benefit.id}
            className={`rounded-xl border p-5 transition-colors ${
              included
                ? "border-orange-100 bg-white hover:border-orange-300"
                : "border-gray-100 bg-gray-50 opacity-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{benefit.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                  {!included && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                      {benefit.minLevel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">{benefit.description}</p>
                {included && benefit.contactInfo && (
                  <p className="mt-2 text-xs font-semibold text-orange-600">
                    Numero: {benefit.contactInfo}
                  </p>
                )}
                {included && (
                  <Link
                    href={benefit.href}
                    className="mt-2 inline-block text-xs font-medium text-orange-600 hover:underline"
                  >
                    Scopri di più →
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
