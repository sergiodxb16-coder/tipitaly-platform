import type { Metadata } from "next";
import "@tip-italy/ui/globals.css";

export const metadata: Metadata = {
  title: "Tip Italy — Portale Aziende",
  description: "Gestisci i tuoi creator e le tue campagne mance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
