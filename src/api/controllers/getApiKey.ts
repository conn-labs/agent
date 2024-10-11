import { Request, Response } from "express";
import { validateJwt } from "../../common/validateJwt";
import { findUserByEmail } from "../../common/findUser";
import { prisma } from "../../lib";

export const listApiKeys = async (req: Request, res: Response) => {
  const email = await validateJwt(req);

  if (!email) {
    res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    return;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        key: true,
        description: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      apiKeys: apiKeys,
    });
  } catch (error) {
    console.error("Error listing API keys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
