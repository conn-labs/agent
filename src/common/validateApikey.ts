import { User } from "@prisma/client";
import { prisma } from "../lib";

export async function validateApiKeys(
  key: string,
  userId: string,
): Promise<boolean> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId: userId,
        key: key,
      },
    });

    if (!apiKey) return false;

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
}



export async function validateApiKeyAndReturnUser(
  key: string,
): Promise<User | null> {
  try {
    const data = await prisma.apiKey.findUnique({
      where: {
        key: key,
      },
      include: {
        user: true
      }
    });

    if (!data) return null;

    return data.user;
  } catch (error) {
    console.error("Error validating API key:", error);
    return null;
  }
}
