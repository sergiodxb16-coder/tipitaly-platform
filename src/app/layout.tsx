import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "tip.italy — Lascia una mancia digitale",
  description: "Lascia una mancia ai tuoi lavoratori preferiti in modo semplice e veloce.",
  openGraph: {
    title: "tip.italy",
    description: "Lascia una mancia digitale in pochi secondi.",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
