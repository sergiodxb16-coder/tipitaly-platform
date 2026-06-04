import { Metadata } from "next";
import Link from "next/link";
import { PartnerDiscovery } from "./partner-discovery";

export const metadata: Metadata = { title: "Partner — TipItaly Card" };

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav() {
  const items = [
    { id: "home",      label: "Home",      emoji: "🏠", href: "/dashboard" },
    { id: "esplora",   label: "Esplora",   emoji: "🔍", href: "/dashboard/esplora" },
    { id: "wallet",    label: "Wallet",    emoji: "🎟️", href: "/dashboard/wallet" },
    { id: "tipa",      label: "Concierge", emoji: "✨", href: "/dashboard/tipa" },
    { id: "profilo",   label: "Profilo",   emoji: "👤", href: "/profilo" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link key={item.id} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              item.id === "partner" ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function PartnerPage() {
  return (
    <>
      <PartnerDiscovery />
      <BottomNav />
    </>
  );
}
