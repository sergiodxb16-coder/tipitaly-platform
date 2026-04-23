export { TipReceivedEmail } from "./tip-received";
export { CardActivationEmail } from "./card-activation";
export { CouponDownloadedEmail } from "./coupon-downloaded";

import { Resend } from "resend";
import { render } from "@react-email/components";
import { CardActivationEmail } from "./card-activation";
import { CouponDownloadedEmail } from "./coupon-downloaded";

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
