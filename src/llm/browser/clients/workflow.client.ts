import { BrowserInstance } from "../browser";
import OpenAI from "openai";
import { workflowPrompt } from "../../prompt/workflow";
import { Elements } from "../../../types/browser";
import { imgToBase64 } from "../../../utils/img";
import { highlightAndLabelElements } from "../highlight";
import { AgentAction } from "../../../types/action";
import { executeAgentAction } from "../actions";
import { sleep } from "bun";
import { llmRequest } from "../llm";
import { waitForEvent } from "../event";
import { Page } from "puppeteer";
import { WebSocket } from "ws";
import { prisma } from "../../../lib";
import { extractAndSaveCookies } from "../../../common/extractSaveCookies";

interface WorkflowContext {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  elements: Elements[];
  screenshot: string;
  screenshotTaken: boolean;
  url: string | null;
  screenshotHash: number;
  memoryMap: Map<string, string>;
}

export async function workflowAgent(
  input: string,
  context: string,
  instances: number,
  sessionId: string,
  ws?: WebSocket,
  openaiKey?: string,
) {
  const browser = await BrowserInstance(false);
  const page = await browser.newPage();

  const workflowContext: WorkflowContext = {
    messages: [
      { role: "system", content: workflowPrompt(context, instances) },
      { role: "user", content: input },
    ],
    elements: [],
    screenshot: "",
    screenshotTaken: false,
    url: null,
    screenshotHash: 1,
    memoryMap: new Map(),
  };

  while (true) {
    await handleNavigation(page, workflowContext, sessionId);
    await handleScreenshot(workflowContext, sessionId);
 
    const response = await llmRequest(workflowContext.messages, openaiKey);
    if (!response) break;

    workflowContext.messages.push({
      role: "assistant",
      content: response.toString(),
    });

    const data = JSON.parse(response.toString());

    if (data.url) {
      workflowContext.url = data.url;
      ws?.send(JSON.stringify({ thought: data.thought }));
    }

    if (data.success) {
      ws?.send(JSON.stringify({ success: data.success }));
      console.log(data.success);
      ws?.close();
      break;
    }

    if (data.actions) {
      ws?.send(JSON.stringify({ thought: data.thought }));
      await handleActions(page, data.actions, workflowContext, sessionId);
    }
  }
  const messages = workflowContext.messages.map(m => ({
    role: m.role,
    content: JSON.stringify(m.content)
  }));

  const history = await prisma.workflow.create({
    data: {
      userId: sessionId,
      input,
      instances,
      messages: messages
    }
  });
  
  console.log(history.id);
  browser.close();

  ws?.close();
}

async function handleNavigation(
  page: Page,
  context: WorkflowContext,
  sessionId: string,
)  {
  if (context.url) {
    console.log("URL", context.url);
    context.messages.push({
      role: "user",
      content: `You're on this URL: ${context.url}`,
    });
    context.memoryMap.set("lastUrl", context.url);

    await page.goto(context.url, {
      waitUntil: "domcontentloaded",
      timeout: 5000,
    });
    await Promise.race([waitForEvent(page, "load"), sleep(5000)]);

    context.elements = await highlightAndLabelElements(page);
    await takeScreenshot(page, sessionId, context.screenshotHash);
    context.screenshot = await imgToBase64(
      `screenshots/${sessionId}-${context.screenshotHash}.jpg`,
    );
    context.screenshotTaken = true;
    context.url = null;
    context.screenshotHash++;
  }
}

async function handleScreenshot(context: WorkflowContext, sessionId: string) {
  if (context.screenshotTaken) {
    const memoryContent = Array.from(context.memoryMap.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    console.log(memoryContent);

    context.messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: context.screenshot,
            detail: "high",
          },
        },
        {
          type: "text",
          text: `Here's the screenshot. Continue the workflow accurately and complete further steps. Current memory:\n${memoryContent}`,
        },
      ],
    });
    context.screenshot = "";
    context.screenshotTaken = false;
  }
}

async function handleActions(
  page: Page,
  actions: AgentAction[],
  context: WorkflowContext,
  sessionId: string,
) {
  const originalUrl = new URL(page.url());
  const result = await executeAgentAction(page, actions, context.elements);
  if (result) {
    context.memoryMap.set(`memory_${context.memoryMap.size}`, result);
  }

  await sleep(4000);
  const newUrl = new URL(page.url());

  if (originalUrl.toString() !== newUrl.toString()) {
    extractAndSaveCookies(page)
    context.messages.push({
      role: "user",
      content: `You're on this URL: ${newUrl.toString()}`,
    });
    context.memoryMap.set("lastUrl", newUrl.toString());

    context.elements = await highlightAndLabelElements(page);
    await takeScreenshot(page, sessionId, context.screenshotHash);
    context.screenshotTaken = true;
    context.screenshot = await imgToBase64(
      `screenshots/${sessionId}-${context.screenshotHash}.jpg`,
    );
    context.url = null;
    context.screenshotHash++;
    console.log("URLs not same");
  }

  console.log(newUrl.toString());
  console.log("Memory Map:", context.memoryMap);
}

async function takeScreenshot(
  page: Page,
  sessionId: string,
  screenshotHash: number,
) {
  await page.screenshot({
    path: `screenshots/${sessionId}-${screenshotHash}.jpg`,
    fullPage: false,
  });
}
