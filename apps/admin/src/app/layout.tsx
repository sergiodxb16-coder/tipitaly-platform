import type { Metadata } from "next";
import "@tip-italy/ui/globals.css";

export const metadata: Metadata = {
  title: "Tip Italy — Backoffice",
  description: "Pannello di amministrazione",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
