import { prisma } from "./index";

export type UserRole = "cardholder" | "company_admin" | "company_employee" | "platform_admin";

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
}

export function getUserRole(user: SupabaseUser): UserRole {
  return (user.user_metadata?.role as UserRole | undefined) ?? "cardholder";
}

/**
 * Ensures a Cardholder record exists for the given Supabase user.
 * Called after every successful sign-in from the B2C portal.
 * No-ops if the record already exists.
 */
export async function syncCardholder(user: SupabaseUser): Promise<void> {
  const role = getUserRole(user);
  if (role !== "cardholder") return;

  const email = user.email;
  if (!email) return;

  const existing = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (existing) return;

  const nameParts = (user.user_metadata?.full_name as string | undefined)?.split(" ") ?? [];
  await prisma.cardholder.create({
    data: {
      supabaseUid: user.id,
      email,
      nome: nameParts[0] ?? "",
      cognome: nameParts.slice(1).join(" ") ?? "",
    },
  });
}

/**
 * Provisions a company employee as a Cardholder and assigns them a card from
 * the company's batch. Idempotent — no-ops if the Cardholder already exists.
 * Called from the web-app sync route on first access.
 */
export async function syncCompanyEmployee(user: SupabaseUser): Promise<void> {
  const email = user.email;
  if (!email) return;

  const existing = await prisma.cardholder.findUnique({ where: { supabaseUid: user.id } });
  if (existing) return;

  const member = await prisma.companyMember.findFirst({
    where: { email, status: "ACTIVE" },
  });
  if (!member) return;

  const nameParts = (user.user_metadata?.full_name as string | undefined)?.split(" ") ?? [];
  const cardholder = await prisma.cardholder.create({
    data: {
      supabaseUid: user.id,
      email,
      nome: nameParts[0] ?? member.nome ?? "",
      cognome: nameParts.slice(1).join(" ") || member.cognome || "",
    },
  });

  // Assign the first unassigned ACTIVE card from the company batch
  const card = await prisma.card.findFirst({
    where: {
      cardBatch: { companyId: member.companyId },
      status: "ACTIVE",
      assignment: null,
    },
  });

  if (card) {
    await prisma.cardAssignment.create({
      data: {
        cardId: card.id,
        cardholderId: cardholder.id,
        cardBatchId: card.cardBatchId,
        source: "B2B_BATCH",
      },
    });
  }
}
