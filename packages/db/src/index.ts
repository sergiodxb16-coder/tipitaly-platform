import { PrismaClient } from "../generated/client";

export * from "../generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Lazy factory: crea PrismaClient solo al primo accesso, non a module-load time.
 * Necessario in Next.js dove i pacchetti workspace vengono importati prima che
 * `.env.local` venga caricato in process.env, causando PrismaClientConstructorValidationError.
 */
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    console.log("[PrismaProxy] Creating PrismaClient, DATABASE_URL=", process.env.DATABASE_URL?.slice(0, 40) ?? "UNDEFINED");
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// Proxy che intercetta ogni accesso a `prisma.xxx` e crea il client al primo uso
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, key) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[key];
  },
});
