import { createHmac, timingSafeEqual } from "crypto";

type InvitePayload = { email: string; companyId: string; exp: number };

function secret(): string {
  return process.env.INVITE_TOKEN_SECRET ?? "dev-invite-secret-changeme-in-prod";
}

export function createInviteToken(email: string, companyId: string): string {
  const payload: InvitePayload = {
    email,
    companyId,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyInviteToken(token: string): InvitePayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = createHmac("sha256", secret()).update(data).digest("base64url");
  try {
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as InvitePayload;
    if (!payload.email || !payload.companyId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
