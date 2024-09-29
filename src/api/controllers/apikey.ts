import { NextFunction, Request, Response } from "express";
import { validateJwt } from "../../common/validateJwt";
import { findUserByEmail } from "../../common/findUser";
import { prisma } from "../../lib";
import { generateApiKey } from "../../utils/apikey";

export const createApiKey = async (req: Request, res: Response) => {
  const email = await validateJwt(req);
  const { description } = req.body;
  if (!email) {
    res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    return;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      key: generateApiKey(),
      description,
      userId: user.id,
    },
  });

  console.log("Api key created", apiKey.key);

  res.status(201).json({
    success: true,
    message: "API key created successfully",
    data: {
      id: apiKey.id,
      key: apiKey.key,
      description: apiKey.description,
    },
  });
};
