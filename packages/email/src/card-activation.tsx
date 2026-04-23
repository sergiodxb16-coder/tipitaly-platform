import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CardActivationEmailProps {
  nome: string;
  cardLevel: "WHITE" | "GOLD" | "PLATINUM";
  serialNumber: string;
  expiresAt: Date;
  dashboardUrl: string;
}

const LEVEL_BENEFITS: Record<string, string[]> = {
  WHITE: ["Travel Advantage (soggiorni fino -80%)", "Coupon partner esclusivi"],
  GOLD: ["Travel Advantage (soggiorni fino -80%)", "Coupon partner esclusivi", "Tutela Legale 24/7"],
  PLATINUM: [
    "Travel Advantage (soggiorni fino -80%)",
    "Coupon partner esclusivi",
    "Tutela Legale 24/7",
    "Soccorso Stradale 24/7 (Italia + Europa)",
  ],
};

export function CardActivationEmail({
  nome,
  cardLevel,
  serialNumber,
  expiresAt,
  dashboardUrl,
}: CardActivationEmailProps) {
  const benefits = LEVEL_BENEFITS[cardLevel] ?? LEVEL_BENEFITS.WHITE;
  const expiry = expiresAt.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Html lang="it">
      <Head />
      <Preview>La tua TipItaly Card {cardLevel} è attiva — benvenuto nei tuoi vantaggi!</Preview>
      <Body style={{ backgroundColor: "#fff7ed", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#ea580c" }}>TipItaly Card attivata 🎉</Heading>

          <Text>Ciao {nome},</Text>
          <Text>
            La tua <strong>TipItaly Card {cardLevel}</strong> è stata attivata con successo!
          </Text>

          <Section style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
            <Text style={{ margin: 0, fontWeight: "bold" }}>Dettagli card</Text>
            <Text style={{ margin: "8px 0 0" }}>Numero seriale: <strong>{serialNumber}</strong></Text>
            <Text style={{ margin: "4px 0 0" }}>Valida fino al: <strong>{expiry}</strong></Text>
          </Section>

          <Text style={{ fontWeight: "bold" }}>I tuoi vantaggi inclusi:</Text>
          {benefits.map((b) => (
            <Text key={b} style={{ margin: "4px 0" }}>✓ {b}</Text>
          ))}

          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: "#ea580c",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
              marginTop: "24px",
            }}
          >
            Accedi ai tuoi vantaggi
          </Button>

          <Text style={{ marginTop: "32px", fontSize: "12px", color: "#9ca3af" }}>
            TipItaly Card — INNOVAVALORE S.R.L., Via Veneto 2, 72100 Brindisi (BR)
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default CardActivationEmail;
