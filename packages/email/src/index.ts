export { TipReceivedEmail } from "./tip-received";
export { CardActivationEmail } from "./card-activation";
export { CouponDownloadedEmail } from "./coupon-downloaded";
export { CardPurchasedEmail } from "./card-purchased";
export { TravelBookingEmail } from "./travel-booking";

import { Resend } from "resend";
import { render } from "@react-email/components";
import { CardActivationEmail } from "./card-activation";
import { CouponDownloadedEmail } from "./coupon-downloaded";
import { CardPurchasedEmail } from "./card-purchased";
import { TravelBookingEmail } from "./travel-booking";

const FROM = "TipItaly Card <noreply@tipitalycard.com>";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

export async function sendCardActivationEmail(params: {
  to: string;
  nome: string;
  cardLevel: "WHITE" | "GOLD" | "PLATINUM";
  serialNumber: string;
  expiresAt: Date;
  dashboardUrl: string;
}) {
  const html = await render(CardActivationEmail(params));
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `La tua TipItaly Card ${params.cardLevel} è attiva!`,
    html,
  });
}

export async function sendCardPurchasedEmail(params: {
  to: string;
  cardLevel: "WHITE" | "GOLD" | "PLATINUM";
  serialNumber: string;
}) {
  const html = await render(CardPurchasedEmail(params));
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Acquisto confermato — TipItaly Card ${params.cardLevel}`,
    html,
  });
}

export async function sendCouponDownloadedEmail(params: {
  to: string;
  nome: string;
  partnerNome: string;
  couponDescrizione: string;
  scontoPercent: string;
  scadenza: Date | null;
  couponUrl: string;
}) {
  const html = await render(CouponDownloadedEmail(params));
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Il tuo coupon ${params.partnerNome} è pronto!`,
    html,
  });
}

export async function sendTravelBookingEmail(params: {
  to: string;
  nome: string;
  bookingType: "hotel" | "flight";
  hotelName?: string;
  city?: string;
  checkin?: string;
  checkout?: string;
  roomName?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  airline?: string;
  flightNumbers?: string;
  adults: number;
  totalPrice: string;
  discountApplied?: string;
  cardLevel: "WHITE" | "GOLD" | "PLATINUM";
  qrCodeUrl: string;
  bookingRef: string;
  manageUrl: string;
}) {
  const html = await render(TravelBookingEmail(params));
  const resend = getResend();
  const subject = params.bookingType === "hotel"
    ? `Prenotazione confermata — ${params.hotelName ?? "Hotel"}`
    : `Volo confermato — ${params.origin} → ${params.destination}`;
  return resend.emails.send({ from: FROM, to: params.to, subject, html });
}
