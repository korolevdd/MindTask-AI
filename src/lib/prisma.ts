import Prisma from "@prisma/client";

// Использование дефолтного импорта обеспечивает лучшую совместимость с ESM/tsx в Windows
const { PrismaClient } = Prisma;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
