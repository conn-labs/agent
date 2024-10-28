import { Request, Response } from "express";
import { validateJwt } from "../../common/validateJwt";
import { findUserByEmail } from "../../common/findUser";
import { prisma } from "../../lib";

export const deleteApiKey = async (req: Request, res: Response) => {
  const email = await validateJwt(req);
  console.log(email);
  if (!email) {
    res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    return;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  const { id } = req.params;

  console.log(id, user.id);
  try {
    const deletedApiKey = await prisma.apiKey.deleteMany({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (deletedApiKey.count === 0) {
      res.status(404).json({ error: "API key not found or not owned by user" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
