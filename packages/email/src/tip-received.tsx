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

interface TipReceivedEmailProps {
  recipientName: string;
  tipperName?: string;
  amountFormatted: string;
  message?: string;
  dashboardUrl: string;
}

export function TipReceivedEmail({
  recipientName,
  tipperName,
  amountFormatted,
  message,
  dashboardUrl,
}: TipReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Hai ricevuto una mancia di {amountFormatted}!</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", padding: "40px 0" }}>
          <Heading>Hai ricevuto una mancia! 🎉</Heading>
          <Text>Ciao {recipientName},</Text>
          <Text>
            {tipperName ? `${tipperName} ti` : "Qualcuno ti"} ha inviato una mancia di{" "}
            <strong>{amountFormatted}</strong>.
          </Text>
          {message && (
            <Section>
              <Text style={{ fontStyle: "italic" }}>&ldquo;{message}&rdquo;</Text>
            </Section>
          )}
          <Button href={dashboardUrl} style={{ backgroundColor: "#000", color: "#fff" }}>
            Vai alla dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export default TipReceivedEmail;
