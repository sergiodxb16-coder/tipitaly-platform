import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TipItaly B2B — Portale Agenzie",
  description: "Gestionale per agenzie partner: prenotazioni, fatturazione e gestione carte.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
