import { sleep } from "../../../utils/sleep";
import { BrowserInstance } from "../browser";
import { waitForEvent } from "../event";
import { highlightPage } from "../highlight";
import { parseLinksFromHtml } from "../../../common/htmlParser";
import OpenAI from "openai";
import { fromatterPrompt } from "../../prompt/formatter";
import { imgToBase64 } from "../../../utils/img";
import { llmRequest } from "../llm";

export async function webScraperAgent(
  url: string,
  schema: string,
  input: string,
): Promise<null | any> {
  const browser = await BrowserInstance();
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 5000,
  });

  await Promise.race([waitForEvent(page, "load"), sleep(5000)]);
  await highlightPage(page);

  await page.screenshot({
    path: `abc.jpeg`,
    fullPage: true,
  });

  const screenshot = await imgToBase64("abc.jpeg");

  const links = await parseLinksFromHtml(url);

  const linkContext: string[] = links.map((l) => {
    return `Element: ${l.tagName}; Face Value: ${l.faceValue}; Link: ${l.link}`;
  });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: fromatterPrompt,
    },
    {
      role: "user",
      content: input,
    },
  ];

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
        text: `Here are the links extracted from page: ${linkContext.forEach(
          (l) => {
            return l + "\n";
          },
        )}`,
      },
    ],
  });

  const response = await llmRequest(messages);

  if (!response) return null;

  const json = JSON.parse(response.toString());

  return json;
}
