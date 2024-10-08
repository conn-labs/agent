import { WebSocket } from "ws";
import { validateApiKeyAndReturnUser, validateApiKeys } from "../../common/validateApikey";
import { WorkflowJobSchema } from "../../types/workflow";
import { z } from "zod";
import { contextParser } from "../../llm/parser/data.parser";
import { workflowAgent } from "../../llm/browser/clients";

export default async function workflowHandler(
  ws: WebSocket,
  data: any,
): Promise<void> {
  const payload = data;

  try {
    const parsedData = WorkflowJobSchema.parse(payload);
    if (!parsedData.apiKey) {
      ws.send(JSON.stringify({ error: "Invalid API key" }));
      return;
    }
    const key = parsedData.apiKey

    const user = await validateApiKeyAndReturnUser(key);

    if(!user) {
      ws.send(
        JSON.stringify({
          error: "Validation failed",
          issues: "Invalid Api key",
        }),
      );
      ws.close()
      return
    }

    const context = await parsedData.context.map(async (v) => {
      const ctx = await contextParser(v.provider, v.fields, user?.id )
      return ctx
    }).join("/n")
   
    await workflowAgent(
      parsedData.input,
      context,
      parsedData.instances,
      user.id, 
      ws
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      ws.send(
        JSON.stringify({
          error: "Validation failed",
          issues: error.errors,
        }),
      );
      return;
    }

    console.error(error);
    ws.send(JSON.stringify({ error: "Internal server error." }));
  }
}
