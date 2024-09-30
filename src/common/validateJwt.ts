import { Request } from "express";
import jwt from "jsonwebtoken";
export async function validateJwt(req: Request): Promise<string | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const data = (await jwt.decode(token)) as { email: string };
  console.log("token", data);

  if (!data) return null;
  return data.email;
}

export async function validateJwtFromToken(token: string): Promise<string | null> {
  if (!token) return null;
  const data = (await jwt.decode(token)) as { email: string };
  console.log("token", data);

  if (!data) return null;
  return data.email;
}
