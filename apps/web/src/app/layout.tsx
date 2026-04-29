import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tipitalycard.com";

export const metadata: Metadata = {
  title: "TipItaly Card — I tuoi vantaggi esclusivi",
  description: "Accedi ai tuoi vantaggi esclusivi: soggiorni scontati, coupon partner, tutela legale e soccorso stradale.",
  alternates: {
    canonical: `${BASE_URL}/`,
    languages: {
      "it": `${BASE_URL}/`,
      "en-GB": `${BASE_URL}/en-gb/`,
      "de-CH": `${BASE_URL}/de-ch/`,
      "fr-CH": `${BASE_URL}/fr-ch/`,
      "x-default": `${BASE_URL}/`,
    },
  },
  openGraph: {
    title: "TipItaly Card",
    description: "La tua card dei vantaggi esclusivi.",
    locale: "it_IT",
    alternateLocale: ["en_GB", "de_CH", "fr_CH"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        {/* hreflang for multi-country SEO */}
        <link rel="alternate" hrefLang="it" href={`${BASE_URL}/`} />
        <link rel="alternate" hrefLang="en-GB" href={`${BASE_URL}/en-gb/`} />
        <link rel="alternate" hrefLang="de-CH" href={`${BASE_URL}/de-ch/`} />
        <link rel="alternate" hrefLang="fr-CH" href={`${BASE_URL}/fr-ch/`} />
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/`} />
      </head>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
