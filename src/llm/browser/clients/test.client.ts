import { BrowserInstance } from "../browser";
import { Page, ScreenRecorder } from "puppeteer";
import { highlightAndLabelElements } from "../highlight";
import { executeAgentAction } from "../actions";
import OpenAI from "openai";
import { basePrompt } from "../../prompt/agent";
import { llmRequest } from "../llm";
import { waitForEvent } from "../event";
import { Elements } from "../../../types/browser";
import { PuppeteerScreenRecorder } from "../../../../pup-ss/src"
import { AgentAction } from "../../../types/action";
import { imgToBase64 } from "../../../utils/img";
import { PassThrough } from "stream";

 
export async function executeAgent(
  input: string,
  context: string,      
  sessionId: string,
) {
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
  const recorder = new PuppeteerScreenRecorder(page);
  const stream = new PassThrough();
  await recorder.startStream(stream)
  stream.on('data',  (d) => {
   console.log(d)
  });
  while (true) {
    if (url) {
      console.log("URL", url);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });

      await Promise.race([waitForEvent(page, "load"), sleep(5000)]);
     
      // Take screenshot before highlighting
      await page.screenshot({
        path: `${sessionId}-${screenshotHash}-before.jpg`,
        fullPage: true,
      });
      const beforeScreenshot = await imgToBase64(`${sessionId}-${screenshotHash}-before.jpg`);

      elements = await highlightAndLabelElements(page);
      // Take screenshot after highlighting
      await page.screenshot({
        path: `${sessionId}-${screenshotHash}-after.jpg`,
        fullPage: true,
      });
      screenshot = await imgToBase64(`${sessionId}-${screenshotHash}-after.jpg`);
      screenshotTaken = true;
      url = null;
      screenshotHash++;

      // Upload both screenshots to messages stack
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
            text: "Please review the screenshot and proceed with the workflow as instructed. Ensure all steps are completed accurately.",
          },
      ],
});
    }
    if (screenshotTaken) {
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
      recorder.stop()
      break;
    }
    if (data.actions) {
      const orignalUrl = await new URL(page.url());
      const mem: String | null | undefined = await executeAgentAction(
        page,
        data.actions as AgentAction[],
        elements,
      );

      await sleep(4000);
      const newUrl = await new URL(page.url());

      if (orignalUrl.toString() !== newUrl.toString()) {
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
