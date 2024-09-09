import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;





// Prompt -> LLM 1 -> what action/ function to call -> CREATE-DOC -> CREATE-CALENDAR -> LLM2 ( SPECIAL PROMPT) <- TO SPECIFIC SCHEMA ACCORDING TO ACTIONS -> RESPONSE