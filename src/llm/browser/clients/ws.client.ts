//special websocket client for live preview.

import { WebSocket } from "ws";
import { BrowserInstance } from "../browser";
import { Page } from "puppeteer";
import { highlightAndLabelElements } from "../highlight";
import { executeAgentAction } from "../actions";
import OpenAI from "openai";
import { basePrompt } from "../../prompt/agent";
import { llmRequest } from "../llm";
import { waitForEvent } from "../event";
import { Elements } from "../../../types/browser";
import { imgToBase64 } from "../../../utils/img";
import { AgentAction } from "../../../types/action";

export async function wssLiveAgent(
  input: string,
  context: string,
  sessionId: string,
  ws: WebSocket,
) {
  ws.send(JSON.stringify({ type: "status", message: "Agent is starting" }));
  const memeorizedText = new Set<string>();

  const browser = await BrowserInstance();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: basePrompt,
    },
    {
      role: "user",
      content: input,
    },
  ];

  let elements: Elements[] = [];
  let screenshot: string = "";
  let screenshotTaken: boolean = false;
  let url: string | null = null;
  let screenshotHash: number = 1;
  const page = await browser.newPage();
  while (true) {
    if (url) {
      console.log("URL", url);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });

      ws.send(
        JSON.stringify({ type: "status", message: `Navigating to ${url}` }),
      );

      await Promise.race([waitForEvent(page, "load"), sleep(5000)]);

      elements = await highlightAndLabelElements(page);
      await page.screenshot({
        path: `${sessionId}-${screenshotHash}.jpg`,
        fullPage: true,
      });
      screenshotTaken = true;
      screenshot = await imgToBase64(`${sessionId}-${screenshotHash}.jpg`);
      url = null;
      screenshotHash++;
    }

    if (screenshotTaken) {
      ws.send(JSON.stringify({ type: "status", message: "Taking screenshot" }));
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: screenshot,
              detail: "high",
            },
          },
          {
            type: "text",
            text: "Here's the screenshot now continue the workflow accurately and complete further steps",
          },
        ],
      });

      screenshot = "";
      screenshotTaken = false;
    }

    const response = await llmRequest(messages);

    if (!response) break;

    messages.push({
      role: "assistant",
      content: response.toString(),
    });

    const data: any = JSON.parse(response.toString());

    if (data.url) {
      url = data.url;
    }

    if (data.success) {
      console.log(data.success);
      ws.send(JSON.stringify({ type: "status", message: data.success }));
      break;
    }
    if (data.actions) {
      const orignalUrl = await new URL(page.url());
      const mem: String | null | undefined = await executeAgentAction(
        page,
        data.actions as AgentAction[],
        elements,
      );
      if (data.actions && data.actions.length > 0) {
        const actionDescription =
          data.actions[0].description || "Performing an action";
        ws.send(JSON.stringify({ type: "status", message: actionDescription }));
      }

      await sleep(4000);
      const newUrl = await new URL(page.url());

      if (orignalUrl.toString() !== newUrl.toString()) {
        ws.send(
          JSON.stringify({
            type: "status",
            message: "URL changed, taking new screenshot",
          }),
        );
        elements = await highlightAndLabelElements(page);

        await page.screenshot({
          path: `${sessionId}-${screenshotHash}.jpg`,
          fullPage: true,
        });
        screenshotTaken = true;
        screenshot = await imgToBase64(`${sessionId}-${screenshotHash}.jpg`);
        url = null;
        screenshotHash++;
        console.log("urls not same");
      }

      console.log(newUrl.toString());
      console.log("Mem", mem);
    }
  }

  ws.close();
}

function compareUrls(url1: string, url2: string): boolean {
  const parsedUrl1 = new URL(url1);
  const parsedUrl2 = new URL(url2);

  return (
    parsedUrl1.origin === parsedUrl2.origin &&
    parsedUrl1.pathname === parsedUrl2.pathname &&
    parsedUrl1.search === parsedUrl2.search
  );
}

// src/utils/sleep.ts
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
