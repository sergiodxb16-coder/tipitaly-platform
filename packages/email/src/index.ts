export { TipReceivedEmail } from "./tip-received";
export { CardActivationEmail } from "./card-activation";
export { CouponDownloadedEmail } from "./coupon-downloaded";
export { CardPurchasedEmail } from "./card-purchased";
export { TravelBookingEmail } from "./travel-booking";
export { B2bOutreachEmail } from "./b2b-outreach";

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

// ─── Agent 01 B2B Outreach (Gmail SMTP — built-in tls, no extra deps) ────────

import { B2bOutreachEmail } from "./b2b-outreach";
import * as tls from "tls";
import * as crypto from "crypto";

const GMAIL_USER = "tipitalycoupon@gmail.com";

/** Minimal SMTP client over TLS (port 465) — no external deps */
async function sendGmailSmtp(params: {
  user: string; pass: string;
  to: string; subject: string; html: string;
}): Promise<string> {
  const { user, pass, to, subject, html } = params;
  const messageId = `<${Date.now()}.${crypto.randomUUID()}@gmail.com>`;
  const authPlain = Buffer.from(`\0${user}\0${pass}`).toString("base64");
  const body = [
    `From: TipItaly Card <${user}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Message-ID: ${messageId}`,
    ``,
    html,
  ].join("\r\n");

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host: "smtp.gmail.com", port: 465, servername: "smtp.gmail.com" },
      () => { /* TLS connected — wait for server greeting */ }
    );
    socket.setTimeout(15000);

    let buf = "";
    let step = 0;
    const w = (s: string) => socket.write(s + "\r\n");

    const handle = (code: number, _line: string) => {
      if (step === 0 && code === 220) { step = 1; w("EHLO localhost"); }
      else if (step === 1 && code === 250) { step = 2; w(`AUTH PLAIN ${authPlain}`); }
      else if (step === 2 && code === 235) { step = 3; w(`MAIL FROM:<${user}>`); }
      else if (step === 3 && code === 250) { step = 4; w(`RCPT TO:<${to}>`); }
      else if (step === 4 && code === 250) { step = 5; w("DATA"); }
      else if (step === 5 && code === 354) { step = 6; socket.write(body + "\r\n.\r\n"); }
      else if (step === 6 && code === 250) { step = 7; w("QUIT"); resolve(messageId); }
      else if (step === 7) { socket.destroy(); }
      else if (code >= 400) { reject(new Error(`SMTP error ${code}: ${_line}`)); socket.destroy(); }
    };

    socket.on("data", (chunk: Buffer) => {
      buf += chunk.toString();
      const lines = buf.split("\r\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line) continue;
        const code = parseInt(line.slice(0, 3), 10);
        // skip continuation lines (e.g. "250-SIZE 35882577")
        if (line[3] === "-") continue;
        handle(code, line);
      }
    });

    socket.on("error", reject);
    socket.on("timeout", () => reject(new Error("SMTP timeout")));
  });
}

export async function sendB2bOutreachEmail(params: {
  to: string;
  ragioneSociale: string;
  nomeReferente?: string;
  settore?: string;
  calendarUrl?: string;
  senderName?: string;
}): Promise<{ id: string; subject: string }> {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) throw new Error("GMAIL_APP_PASSWORD non configurata nel .env.local");
  const subject = `${params.ragioneSociale} — il benefit aziendale che i tuoi dipendenti ameranno`;
  const html = await render(
    B2bOutreachEmail({
      nomeReferente: params.nomeReferente,
      ragioneSociale: params.ragioneSociale,
      settore: params.settore,
      calendarUrl: params.calendarUrl,
      senderName: params.senderName,
    })
  );
  const id = await sendGmailSmtp({ user: GMAIL_USER, pass, to: params.to, subject, html });
  return { id, subject };
}
