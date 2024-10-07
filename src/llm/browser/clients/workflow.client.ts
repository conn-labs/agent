import MemoryClient from "mem0ai"
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

const memory = new MemoryClient(process.env.MEMO || "");


export async function workflowAgent(input: string, context: string, mem: boolean = true, instances: number, sessionId: string ) {
const browser = await BrowserInstance()

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: workflowPrompt(context, instances),
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

  // Initialize memory with the current session ID
  memory.add(messages, { user_id: "agent", session_id: sessionId });

  while (true) {
    if (url) {
      console.log("URL", url);
      messages.push({
        role: "user",
        content: `You're on this URL: ${url}`,
      });

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });

      await Promise.race([waitForEvent(page, "load"), sleep(5000)]);

      elements = await highlightAndLabelElements(page);
      await page.screenshot({
        path: `screenshot/${sessionId}-${screenshotHash}.jpg`,
        fullPage: false,
      });
      screenshotTaken = true;
      screenshot = await imgToBase64(`screenshot/${sessionId}-${screenshotHash}.jpg`);
      url = null;
      screenshotHash++;
    }

    if (screenshotTaken) {
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
      break;
    }
    if (data.actions) {
      const orignalUrl = await new URL(page.url());
      const mem: String | null | undefined = await executeAgentAction(
        page,
        data.actions as AgentAction[],
        elements,
      );

      // Add a new action to press enter
      await executeAgentAction(page, [{ action: "press_enter" }], elements);

      await sleep(4000);
      const newUrl = await new URL(page.url());

      if (orignalUrl.toString() !== newUrl.toString()) {
        messages.push({
          role: "user",
          content: `You're on this URL: ${url}`,
        });
        elements = await highlightAndLabelElements(page);

        await page.screenshot({
          path: `screenshot/${sessionId}-${screenshotHash}.jpg`,
          fullPage: false,
        });
        screenshotTaken = true;
        screenshot = await imgToBase64(`screenshot/${sessionId}-${screenshotHash}.jpg`);
        url = null;
        screenshotHash++;
        console.log("urls not same");
      }

      console.log(newUrl.toString());
      console.log("Mem", mem);

      // Update memory with the current actions
      memory.add(messages, { user_id: "agent", session_id: sessionId, actions: data.actions, url: newUrl.toString() });
    }
  }

  
}