import { WebSocket } from "ws";
import {
  validateApiKeyAndReturnUser,
  validateApiKeys,
} from "../../common/validateApikey";
import { WorkflowJobSchema } from "../../types/workflow";
import { z } from "zod";
import { contextParser } from "../../llm/parser/data.parser";
import { workflowAgent } from "../../llm/browser/clients";

export default async function workflowHandler(
  ws: WebSocket,
  data: any,
): Promise<void> {
  console.log("logged");
  const payload = data;

  try {
    const parsedData = WorkflowJobSchema.parse(payload);
    if (!parsedData.apiKey) {
      ws.send(JSON.stringify({ error: "Invalid API key" }));
      return;
    }
    const key = parsedData.apiKey;

    const user = await validateApiKeyAndReturnUser(key);
    console.log(user);
    if (!user) {
      ws.send(
        JSON.stringify({
          error: "Validation failed",
          issues: "Invalid Api key",
        }),
      );
      ws.close();
      return;
    }

    const context = await Promise.all(
      parsedData.context
        .map(async (v) => {
          const ctx = await contextParser(v.provider, v.fields, user?.id);
          console.log(ctx);
          return ctx;
        })
        .join("/n"),
    );

    console.log("ctx", context);
    await workflowAgent(
      parsedData.input,
      context.join("\n\n"),
      parsedData.instances,
      user.id,
      ws,
      parsedData.openaiKey || undefined,
      user.id,
    );
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
