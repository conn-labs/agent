import { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { wsPayload } from "../../types/ws";
import { validateApiKeys } from "../../common/validateApikey";
import { WorkflowJobSchema } from "../../types/workflow";
import { z } from "zod";
import { findUserByEmail } from "../../common/findUser";

export default async function workflowHandler(
  ws: WebSocket,
  data: any
): Promise<void> {
  const payload = data;

  try {
    const parsedData = WorkflowJobSchema.parse(payload);
    if (!parsedData.apiKey) {
      ws.send(JSON.stringify({ error: "Invalid API key" }));
      return;
    }
  
    
    // Process the workflow job here
    // You might want to call a function to handle the workflow execution
    // For example: await processWorkflowJob(parsedData, randomUUID(), ws);

  } catch (error) {
    if (error instanceof z.ZodError) {
      ws.send(JSON.stringify({
        error: "Validation failed",
        issues: error.errors
      }));
      return;
    }

    console.error(error);
    ws.send(JSON.stringify({ error: "Internal server error." }));
  }
}
