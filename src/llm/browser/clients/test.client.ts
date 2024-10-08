import { BrowserInstance } from "../browser";
import { Page } from "puppeteer";
import { highlightAndLabelElements } from "../highlight";
import { executeAgentAction } from "../actions";
import OpenAI from "openai";
import { basePrompt } from "../../prompt/agent";
import { llmRequest } from "../llm";
import { waitForEvent } from "../event";
import { Elements } from "../../../types/browser";
import { PuppeteerScreenRecorder } from "../../../../pup-ss/src";
import { AgentAction } from "../../../types/action";
import { imgToBase64 } from "../../../utils/img";
import { sleep } from "../../../utils/sleep";

import { AgentExecutionContext } from "../../../types/browser";
export async function executeAgent(
  input: string,
  context: string,
  sessionId: string,
) {
  const browser = await BrowserInstance();
  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page);

  const agentContext: AgentExecutionContext = {
    messages: [
      { role: "system", content: basePrompt },
      { role: "user", content: input },
    ],
    elements: [],
    screenshot: "",
    screenshotTaken: false,
    url: null,
    screenshotHash: 1,
  };

  while (true) {
    await handleNavigation(page, agentContext, sessionId);
    await handleScreenshot(agentContext, sessionId);

    const response = await llmRequest(agentContext.messages);
    if (!response) break;

    agentContext.messages.push({
      role: "assistant",
      content: response.toString(),
    });

    const data = JSON.parse(response.toString());

    if (data.success) {
      console.log(data.success);
      recorder.stop();
      break;
    }

    if (data.url) {
      agentContext.url = data.url;
    }

    if (data.actions) {
      await handleActions(page, data.actions, agentContext, sessionId);
    }
  }
}

async function handleNavigation(
  page: Page,
  context: AgentExecutionContext,
  sessionId: string,
) {
  if (context.url) {
    console.log("URL", context.url);
    await page.goto(context.url, {
      waitUntil: "domcontentloaded",
      timeout: 5000,
    });
    await Promise.race([waitForEvent(page, "load"), sleep(5000)]);

    context.elements = await highlightAndLabelElements(page);
    await takeScreenshot(page, sessionId, context.screenshotHash, "-after");
    context.screenshot = await imgToBase64(
      `${sessionId}-${context.screenshotHash}-after.jpg`,
    );
    context.screenshotTaken = true;
    context.url = null;
    context.screenshotHash++;
  }
}

async function handleScreenshot(
  context: AgentExecutionContext,
  sessionId: string,
) {
  if (context.screenshotTaken) {
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
          text: "Please review the screenshot and proceed with the workflow as instructed. Ensure all steps are completed accurately.",
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
  context: AgentExecutionContext,
  sessionId: string,
) {
  const originalUrl = new URL(page.url());
  await executeAgentAction(page, actions, context.elements);
  await sleep(4000);
  const newUrl = new URL(page.url());

  if (!compareUrls(originalUrl.toString(), newUrl.toString())) {
    context.elements = await highlightAndLabelElements(page);
    await takeScreenshot(page, sessionId, context.screenshotHash);
    context.screenshotTaken = true;
    context.screenshot = await imgToBase64(
      `${sessionId}-${context.screenshotHash}.jpg`,
    );
    context.url = null;
    context.screenshotHash++;
    console.log("URLs not same");
  }

  console.log(newUrl.toString());
}

async function takeScreenshot(
  page: Page,
  sessionId: string,
  screenshotHash: number,
  suffix: string = "",
) {
  await page.screenshot({
    path: `${sessionId}-${screenshotHash}${suffix}.jpg`,
    fullPage: true,
  });
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
