import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CardPurchasedEmailProps {
  cardLevel: "WHITE" | "GOLD" | "PLATINUM";
  serialNumber: string;
}

export function CardPurchasedEmail({ cardLevel, serialNumber }: CardPurchasedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Acquisto confermato — TipItaly Card {cardLevel}</Preview>
      <Body style={{ backgroundColor: "#fff7ed", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: 32 }}>
          <Heading style={{ color: "#ea580c" }}>Acquisto confermato!</Heading>
          <Section>
            <Text>La tua TipItaly Card <strong>{cardLevel}</strong> è stata acquistata con successo.</Text>
            <Text>Seriale card: <strong>{serialNumber}</strong></Text>
            <Text>
              Accedi al portale e inserisci il seriale per attivare la card e sbloccare tutti i tuoi vantaggi esclusivi.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
