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

interface CouponDownloadedEmailProps {
  nome: string;
  partnerNome: string;
  couponDescrizione: string;
  scontoPercent: string;
  scadenza: Date | null;
  couponUrl: string;
}

export function CouponDownloadedEmail({
  nome,
  partnerNome,
  couponDescrizione,
  scontoPercent,
  scadenza,
  couponUrl,
}: CouponDownloadedEmailProps) {
  const expiry = scadenza
    ? scadenza.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <Html lang="it">
      <Head />
      <Preview>Il tuo coupon {partnerNome} -{scontoPercent}% è pronto — mostralo in negozio!</Preview>
      <Body style={{ backgroundColor: "#f0fdf4", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#ea580c" }}>Coupon pronto! 🎟️</Heading>

          <Text>Ciao {nome},</Text>
          <Text>Hai riscattato un coupon esclusivo per i titolari TipItaly Card.</Text>

          <Section
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              borderLeft: "4px solid #ea580c",
            }}
          >
            <Text style={{ margin: 0, color: "#ea580c", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {partnerNome}
            </Text>
            <Text style={{ margin: "8px 0 4px", fontWeight: "bold", fontSize: "16px" }}>
              {couponDescrizione}
            </Text>
            <Text style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#ea580c" }}>
              -{scontoPercent}%
            </Text>
            {expiry && (
              <Text style={{ margin: "8px 0 0", fontSize: "13px", color: "#6b7280" }}>
                Valido fino al {expiry}
              </Text>
            )}
          </Section>

          <Text style={{ fontWeight: "bold" }}>Come usarlo:</Text>
          <Text style={{ margin: "4px 0" }}>1. Apri il link qui sotto dal tuo telefono</Text>
          <Text style={{ margin: "4px 0" }}>2. Mostra il QR code al personale del negozio</Text>
          <Text style={{ margin: "4px 0" }}>3. Ottieni lo sconto immediatamente</Text>

          <Button
            href={couponUrl}
            style={{
              backgroundColor: "#ea580c",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
              marginTop: "20px",
            }}
          >
            Apri QR code coupon
          </Button>

          <Text style={{ marginTop: "32px", fontSize: "12px", color: "#9ca3af" }}>
            TipItaly Card — INNOVAVALORE S.R.L., Via Veneto 2, 72100 Brindisi (BR)
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default CouponDownloadedEmail;
