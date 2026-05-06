import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TravelBookingEmailProps {
  nome: string;
  bookingType: "hotel" | "flight";
  // Hotel fields
  hotelName?: string;
  city?: string;
  checkin?: string;
  checkout?: string;
  roomName?: string;
  // Flight fields
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  airline?: string;
  flightNumbers?: string;
  // Common
  adults: number;
  totalPrice: string;
  discountApplied?: string;
  cardLevel: "WHITE" | "GOLD" | "PLATINUM";
  qrCodeUrl: string;
  bookingRef: string;
  manageUrl: string;
}

export function TravelBookingEmail({
  nome,
  bookingType,
  hotelName,
  city,
  checkin,
  checkout,
  roomName,
  origin,
  destination,
  departureDate,
  returnDate,
  airline,
  flightNumbers,
  adults,
  totalPrice,
  discountApplied,
  cardLevel,
  qrCodeUrl,
  bookingRef,
  manageUrl,
}: TravelBookingEmailProps) {
  const isHotel = bookingType === "hotel";
  const title = isHotel ? "Prenotazione Hotel Confermata" : "Prenotazione Volo Confermata";
  const emoji = isHotel ? "🏨" : "✈️";

  const LEVEL_LABEL: Record<string, string> = {
    WHITE: "White",
    GOLD: "Gold",
    PLATINUM: "Platinum",
  };

  return (
    <Html lang="it">
      <Head />
      <Preview>
        {emoji} {title} — {isHotel ? (hotelName ?? "") : `${origin ?? ""} → ${destination ?? ""}`} · Ref {bookingRef}
      </Preview>
      <Body style={{ backgroundColor: "#fff7ed", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#ea580c" }}>
            {emoji} {title}
          </Heading>

          <Text>Ciao {nome},</Text>
          <Text>
            La tua prenotazione è confermata. Mostra il QR code all&apos;arrivo.
          </Text>

          {/* Booking details */}
          <Section style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
            <Text style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
              Dettagli prenotazione
            </Text>

            {isHotel ? (
              <>
                <Text style={{ margin: "8px 0 0" }}>
                  🏨 <strong>{hotelName}</strong> — {city}
                </Text>
                <Text style={{ margin: "4px 0 0" }}>
                  Check-in: <strong>{checkin}</strong> · Check-out: <strong>{checkout}</strong>
                </Text>
                <Text style={{ margin: "4px 0 0" }}>
                  Camera: <strong>{roomName}</strong>
                </Text>
              </>
            ) : (
              <>
                <Text style={{ margin: "8px 0 0" }}>
                  ✈️ <strong>{origin} → {destination}</strong>
                </Text>
                <Text style={{ margin: "4px 0 0" }}>
                  Partenza: <strong>{departureDate}</strong>
                  {returnDate ? ` · Ritorno: ${returnDate}` : " (solo andata)"}
                </Text>
                <Text style={{ margin: "4px 0 0" }}>
                  Compagnia: <strong>{airline}</strong> · Volo: {flightNumbers}
                </Text>
              </>
            )}

            <Text style={{ margin: "8px 0 0" }}>
              Passeggeri: <strong>{adults}</strong>
            </Text>
            <Text style={{ margin: "4px 0 0" }}>
              Totale pagato: <strong>{totalPrice}</strong>
            </Text>
            {discountApplied && parseFloat(discountApplied) > 0 && (
              <Text style={{ margin: "4px 0 0", color: "#16a34a" }}>
                ✓ Sconto TipItaly Card {LEVEL_LABEL[cardLevel]} applicato: <strong>-{discountApplied}%</strong>
              </Text>
            )}
            <Text style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280" }}>
              Riferimento: <strong>{bookingRef}</strong>
            </Text>
          </Section>

          {/* QR Code */}
          <Section style={{ textAlign: "center", marginBottom: "20px" }}>
            <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Il tuo QR di accesso
            </Text>
            <Img
              src={qrCodeUrl}
              alt="QR Code prenotazione"
              width={160}
              height={160}
              style={{ margin: "0 auto", display: "block" }}
            />
            <Text style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
              Mostra questo codice al check-in
            </Text>
          </Section>

          {/* Manage link */}
          <Text style={{ fontSize: "12px", color: "#6b7280", marginTop: "24px" }}>
            Gestisci la prenotazione o richiedila cancellazione:{" "}
            <a href={manageUrl} style={{ color: "#ea580c" }}>
              Le mie prenotazioni
            </a>
          </Text>

          <Text style={{ marginTop: "32px", fontSize: "12px", color: "#9ca3af" }}>
            TipItaly Card — INNOVAVALORE S.R.L., Via Veneto 2, 72100 Brindisi (BR)
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default TravelBookingEmail;
