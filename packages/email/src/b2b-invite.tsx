import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface B2bInviteEmailProps {
  ragioneSociale: string;
  inviteUrl: string;
  expiresInDays?: number;
}

export function B2bInviteEmail({
  ragioneSociale,
  inviteUrl,
  expiresInDays = 7,
}: B2bInviteEmailProps) {
  return (
    <Html lang="it">
      <Head />
      <Preview>Sei stato invitato a unirti a {ragioneSociale} su TipItaly B2B</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>TipItaly</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={heading}>
              Sei stato invitato
            </Heading>

            <Text style={paragraph}>
              <strong>{ragioneSociale}</strong> ti ha invitato ad accedere al portale
              aziendale TipItaly B2B. Clicca il pulsante qui sotto per accettare l&apos;invito.
            </Text>

            <Section style={ctaSection}>
              <Button href={inviteUrl} style={button}>
                Accetta l&apos;invito →
              </Button>
            </Section>

            <Text style={note}>
              Il link è valido per {expiresInDays} giorni. Se non hai richiesto questo invito,
              puoi ignorare questa email.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>TipItaly S.r.l. — portale B2B aziendale</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f9f9f7",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  padding: "24px 40px",
};

const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "bold",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#333333",
  marginBottom: "24px",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "8px 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#ea580c",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};

const note: React.CSSProperties = {
  fontSize: "13px",
  color: "#888888",
  textAlign: "center" as const,
};

const divider: React.CSSProperties = {
  borderTop: "1px solid #e5e5e5",
  margin: "0 40px",
};

const footer: React.CSSProperties = {
  padding: "24px 40px",
};

const footerText: React.CSSProperties = {
  fontSize: "13px",
  color: "#999999",
  margin: "4px 0",
};
