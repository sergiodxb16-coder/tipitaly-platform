import { prisma } from "./index";

export type UserRole = "cardholder" | "company_admin" | "platform_admin";

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
