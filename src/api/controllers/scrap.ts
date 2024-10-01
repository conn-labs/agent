import {Response, Request} from "express"
import { validateJwt } from "../../common/validateJwt"
import { findUserByEmail } from "../../common/findUser";
import { validateApiKeys } from "../../common/validateApikey";
export const createScrap = async (req: Request, res: Response) => {
  const email = await validateJwt(req)
  
  if (!email) {
    res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    return;
  }


  const user = await findUserByEmail(email);


  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const apiKeyAuth = await validateApiKeys(req.body.apiKey, user.id)

  if(!apiKeyAuth){
    res.status(401).json({ error: "Unauthorized: Invalid or missing apiKey" });
  }

  // to be implemented LOL
  

}