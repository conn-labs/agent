import { Request } from "express";
import jwt from "jsonwebtoken";

export async function validateJwt(req: Request): Promise<string | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  console.log(req.headers.authorization)
  if (!token) return null;
  try {
    const data = jwt.decode(token) as { email: string };
    if (!data) return null;
    return data.email;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function validateJwtFromToken(
  token: string,
): Promise<string | null> {
  try {
    const data = jwt.decode(token) as { email: string };
    if (!data) return null;
    return data.email;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
