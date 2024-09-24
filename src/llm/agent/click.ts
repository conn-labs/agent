/// <reference lib="dom" />

import { Page, ElementHandle } from "puppeteer"; // Assuming you're using Puppeteer
import { waitForEvent } from "./event";
import { sleep } from "../../utils/sleep";
import { highlightLinks } from "./highlight";

export async function agentClick(name: string, page: Page): Promise<boolean> {
  console.log(name);
  const link_text = name.replace(/[^a-zA-Z0-9 ]/g, "");
  console.log("Clicking on " + link_text);

  try {
    const elements: ElementHandle<Element>[] = await page.$$("[gpt-link-text]");

    let partial: ElementHandle<Element> | null = null;
    let exact: ElementHandle<Element> | null = null;

    for (const element of elements) {
      const ar = await element.evaluate((el: Element) =>
        el.getAttribute("gpt-link-text"),
      );
      const attributeValue = ar?.replace(/[^a-zA-Z0-9 ]/g, "");

      if (attributeValue && attributeValue.includes(link_text)) {
        partial = element;
        console.log(element);
      }

      if (attributeValue === link_text) {
        exact = element;
        console.log(element);
      }
    }

    if (exact || partial) {
      const [response] = await Promise.all([
        page
          .waitForNavigation({ waitUntil: "domcontentloaded" })
          .catch((e: Error) =>
            console.log("Navigation timeout/error:", e.message),
          ),
        (exact || partial)!.click(),
      ]);

      await Promise.race([waitForEvent(page, "load"), sleep(5000)]);

      await highlightLinks(page);

      await page.screenshot({
        path: "screenshot.jpg",
        fullPage: true,
      });
      return true;
    } else {
      throw new Error("Can't find link");
    }
  } catch (error) {
    console.error("Error in agentClick:", error);
    throw error;
  }
}

// These functions are assumed to be defined elsewhere in your code
// You may need to import or define them
// async function waitForEvent(page: Page, eventName: string): Promise<void> {
//   // Implementation here
// }

// async function sleep(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function highlight_links(page: Page): Promise<void> {
//   // Implementation here
// }

// const timeout = 5000; // Adjust as needed
