import { Authentication, Provider } from "@prisma/client";
import { prisma } from "../lib";
import Cryptr from "cryptr";


const crypt = new Cryptr(process.env.ENCRYPT || "RANDOM")

export async function findProvider(
    userId: string,
provider: Provider
):Promise<{ refreshToken: string | null, accessToken: string } | null> {
   const auth = await prisma.authentication.findUnique({
    where: {
        userId_provider: {
            userId,
            provider
        }
    }
   })

   if(!auth) return null

   return {
    refreshToken: crypt.decrypt(auth.refreshToken || ""),
    accessToken: crypt.decrypt(auth.accessToken)
   }
}