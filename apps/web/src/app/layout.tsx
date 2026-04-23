import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TipItaly Card — I tuoi vantaggi esclusivi",
  description: "Accedi ai tuoi vantaggi esclusivi: soggiorni scontati, coupon partner, tutela legale e soccorso stradale.",
  openGraph: {
    title: "TipItaly Card",
    description: "La tua card dei vantaggi esclusivi.",
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
