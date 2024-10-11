import { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { wsPayload } from "../../types/ws";
import { validateJwtFromToken } from "../../common/validateJwt";
import { validateApiKeys } from "../../common/validateApikey";
import { findUserByEmail } from "../../common/findUser";
import { wssLiveAgent } from "../../llm/browser/clients/ws.client";

export default async function agentHandler(
  ws: WebSocket,
  data: any,
): Promise<void> {
  const payload = data as wsPayload;
  console.log(payload.authToken);
  const email = await validateJwtFromToken(payload.authToken);
  if (!email) {
    ws.send(JSON.stringify({ error: "Invalid authentication token" }));
    return;
  }
  const user = await findUserByEmail(email);
  if (!user) {
    ws.send(JSON.stringify({ error: "User not found" }));
    return;
  }

  const apiKeyAuth = await validateApiKeys(payload.apiKey, user.id);
  if (!apiKeyAuth) {
    ws.send(JSON.stringify({ error: "Invalid API key" }));
    return;
  }

  await wssLiveAgent(payload.prompt, payload.context, randomUUID(), ws, );
}
