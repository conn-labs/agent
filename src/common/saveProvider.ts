import { Provider } from "@prisma/client";
import type { Authentication } from "@prisma/client"; // Type-only import

import { prisma } from "../lib";

async function saveAuthentication(

  
  provider: Provider,


  accessToken: string,


  userId: string,


  refreshToken?: string | null,


): Promise<Authentication> {
  
  try {
    const authentication = await prisma.authentication.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },

      update: {
        accessToken,
        refreshToken,
      },

      create: {
        provider,
        accessToken,
        refreshToken,
        user: { connect: { id: userId } },
      },
    });

    return authentication;
  } catch (error) {
    console.error("Error saving authentication:", error);
    throw error;
  }
}

export { saveAuthentication };
