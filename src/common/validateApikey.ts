import { prisma } from "../lib";



export async function validateApiKeys(key: string, userId: string): Promise<boolean> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_key: {
          userId: userId,
          key: key
        }
      }
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






