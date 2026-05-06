import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TipItaly — Portale Viaggiatori",
  description: "Gestisci la tua TipItaly Card, prenota hotel e voli con i tuoi benefit esclusivi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
