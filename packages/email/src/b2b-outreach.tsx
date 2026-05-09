import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface B2bOutreachEmailProps {
  nomeReferente?: string;
  ragioneSociale: string;
  settore?: string;
  calendarUrl?: string;
  senderName?: string;
}

export function B2bOutreachEmail({
  nomeReferente,
  ragioneSociale,
  settore,
  calendarUrl = "https://cal.com/tipitaly/demo",
  senderName = "Team TipItaly",
}: B2bOutreachEmailProps) {
  const greeting = nomeReferente ? `Gentile ${nomeReferente},` : "Gentile referente,";
  const settoreRef = settore ? ` nel settore ${settore}` : "";

  return (
    <Html lang="it">
      <Head />
      <Preview>
        TipItaly Card — il benefit aziendale che i tuoi dipendenti ameranno davvero
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>TipItaly</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={greeting_style}>{greeting}</Text>

            <Text style={paragraph}>
              mi chiamo {senderName} e ti scrivo perché lavoriamo con aziende{settoreRef}{" "}
              che vogliono offrire ai propri dipendenti qualcosa di concreto: accesso
              privilegiato ai migliori ristoranti, hotel e servizi in Italia, con sconti
              esclusivi fino al 40%.
            </Text>

            <Text style={paragraph}>
              <strong>TipItaly Card</strong> è il benefit aziendale tutto italiano pensato
              per chi vuole valorizzare il team con esperienze di qualità — non l'ennesimo
              voucher generico.
            </Text>

            <Heading as="h3" style={subheading}>
              Perché le aziende ci scelgono:
            </Heading>

            <Text style={listItem}>✦ &nbsp;Rete di oltre 500 partner selezionati (ristorazione, hotel, benessere, cultura)</Text>
            <Text style={listItem}>✦ &nbsp;Carte nominali con dashboard aziendale per gestire assegnazioni e rinnovi</Text>
            <Text style={listItem}>✦ &nbsp;Attivazione in 48h — nessun software da installare</Text>
            <Text style={listItem}>✦ &nbsp;Deducibile fiscalmente come fringe benefit</Text>

            <Text style={paragraph}>
              Possiamo fare una chiamata di 20 minuti per capire se ha senso per{" "}
              <strong>{ragioneSociale}</strong>?
            </Text>

            <Section style={ctaSection}>
              <Button href={calendarUrl} style={button}>
                Prenota una chiamata →
              </Button>
            </Section>

            <Text style={smallNote}>
              Oppure rispondi a questa email — rispondo entro 24 ore.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {senderName} — TipItaly S.r.l.
            </Text>
            <Text style={footerText}>
              <Link href="https://tipitaly.com" style={footerLink}>
                tipitaly.com
              </Link>
              {" · "}
              <Link href="https://tipitaly.com/unsubscribe" style={footerLink}>
                Disiscriviti
              </Link>
            </Text>
            <Text style={footerNote}>
              Hai ricevuto questa email perché la tua azienda è attiva nel settore
              del welfare aziendale o dei benefit per dipendenti.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f9f9f7",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
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
  fontFamily: "'Georgia', serif",
  margin: 0,
  letterSpacing: "0.05em",
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const greeting_style: React.CSSProperties = {
  fontSize: "16px",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#333333",
  marginBottom: "16px",
};

const subheading: React.CSSProperties = {
  fontSize: "14px",
  color: "#1a1a1a",
  fontWeight: "bold",
  marginTop: "24px",
  marginBottom: "8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const listItem: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.8",
  color: "#444444",
  marginBottom: "4px",
  paddingLeft: "8px",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0 16px",
};

const button: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "4px",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};

const smallNote: React.CSSProperties = {
  fontSize: "13px",
  color: "#888888",
  textAlign: "center" as const,
  marginTop: "8px",
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

const footerLink: React.CSSProperties = {
  color: "#999999",
};

const footerNote: React.CSSProperties = {
  fontSize: "11px",
  color: "#cccccc",
  marginTop: "12px",
  lineHeight: "1.6",
};
