import { prisma } from "./index";
import { CardStatus } from "../generated/client";

export type ActivationResult =
  | { success: true; cardLevel: string; expiresAt: Date }
  | { success: false; error: "not_found" | "already_active" | "window_expired" | "expired" };

export async function activateCard(
  serialNumber: string,
  cardholderId: string
): Promise<ActivationResult> {
  const card = await prisma.card.findUnique({
    where: { serialNumber: serialNumber.toUpperCase().trim() },
    include: { assignment: true },
  });

  if (!card) return { success: false, error: "not_found" };
  if (card.status === CardStatus.ACTIVE) return { success: false, error: "already_active" };
  if (card.status === CardStatus.EXPIRED) return { success: false, error: "expired" };

  const now = new Date();
  if (card.activationDeadline && now > card.activationDeadline) {
    return { success: false, error: "window_expired" };
  }

  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await prisma.$transaction(async (tx) => {
    await tx.card.update({
      where: { id: card.id },
      data: { status: CardStatus.ACTIVE, activatedAt: now, expiresAt },
    });

    if (!card.assignment) {
      await tx.cardAssignment.create({
        data: {
          cardId: card.id,
          cardholderId,
          source: "B2C_PURCHASE",
          cardBatchId: card.cardBatchId ?? null,
        },
      });
    }
  });

  return { success: true, cardLevel: card.level, expiresAt };
}

export async function getCardForCardholder(cardholderId: string) {
  return prisma.cardAssignment.findFirst({
    where: { cardholderId },
    include: { card: true },
    orderBy: { assignedAt: "desc" },
  });
}
