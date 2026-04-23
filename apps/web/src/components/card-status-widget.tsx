import { CardLevel, CardStatus } from "@tip-italy/db";

interface CardStatusWidgetProps {
  level: CardLevel;
  status: CardStatus;
  serialNumber: string;
  expiresAt: Date | null;
  activatedAt: Date | null;
}

const LEVEL_COLORS: Record<CardLevel, string> = {
  WHITE: "from-gray-100 to-gray-200 text-gray-800",
  GOLD: "from-yellow-100 to-yellow-200 text-yellow-800",
  PLATINUM: "from-slate-200 to-slate-300 text-slate-800",
};

const LEVEL_BADGE: Record<CardLevel, string> = {
  WHITE: "bg-gray-200 text-gray-700",
  GOLD: "bg-yellow-200 text-yellow-800",
  PLATINUM: "bg-slate-300 text-slate-800",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function CardStatusWidget({ level, status, serialNumber, expiresAt, activatedAt }: CardStatusWidgetProps) {
  const isActive = status === CardStatus.ACTIVE;
  const daysLeft = expiresAt ? daysUntil(expiresAt) : null;
  const expiryWarning = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
  const isExpired = status === CardStatus.EXPIRED || (daysLeft !== null && daysLeft <= 0);

  return (
    <div className={`rounded-2xl bg-gradient-to-br p-6 shadow-sm ${LEVEL_COLORS[level]}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-widest ${LEVEL_BADGE[level]}`}>
            {level}
          </span>
          <p className="mt-3 font-mono text-sm opacity-70">{serialNumber}</p>
        </div>
        <div className="text-right text-xs opacity-60">TipItaly Card</div>
      </div>

      <div className="mt-6 space-y-1 text-sm">
        {isActive && activatedAt && (
          <p>Attiva dal {formatDate(activatedAt)}</p>
        )}
        {expiresAt && (
          <p className={expiryWarning ? "font-semibold text-red-700" : ""}>
            Scade il {formatDate(expiresAt)}
            {expiryWarning && ` (${daysLeft} giorni rimasti)`}
          </p>
        )}
        {isExpired && (
          <p className="font-semibold text-red-700">Card scaduta</p>
        )}
        {!isActive && !isExpired && (
          <p className="opacity-60">Non attiva</p>
        )}
      </div>
    </div>
  );
}
