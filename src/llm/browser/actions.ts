import { Page } from "puppeteer";
import { AgentAction, ElementData } from "../../types/action";
import { Elements } from "../../types/browser";

export async function eventClick(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
}

export async function eventPressEnter(page: Page) {
  await page.keyboard.press("Enter");
}

export async function eventType(page: Page, text: string): Promise<void> {
  for (const char of text) {
    await page.keyboard.type(char, { delay: 100 });
  }
  eventPressEnter(page);
}

export async function moveToElement(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await page.mouse.move(x, y);
}

export async function scrollToElement(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await page.evaluate(
    (x, y) => {
      const element = document.elementFromPoint(x, y);
      if (element) {
        element.scrollIntoView();
      }
    },
    x,
    y,
  );
}

async function findElement(
  elements: Elements[],
  id: number,
): Promise<ElementData | null> {
  const element = elements.find((e: Elements) => e.id === id);
  if (!element) return null;
  return {
    id: element.id,
    x: element.x,
    y: element.y,
  };
}

export async function executeAgentAction(
  page: Page,
  actions: AgentAction[],
  elements: Elements[],
): Promise<string | null> {
  for (const action of actions) {
    switch (action.action) {
      case "click": {
        const element = await findElement(
          elements,
          Number(action.elementId) || 0,
        );
        if (element) {
          await eventClick(page, element.x, element.y);
          return null;
        }
        break;
      }
      case "type": {
        const typeElement = await findElement(
          elements,
          Number(action.elementId) || 0,
        );
        if (!typeElement) break;
        await eventClick(page, typeElement.x, typeElement.y);
        await eventType(page, action.text || "");
        return null;
      }
      case "scroll": {
        const scrollElement = await findElement(
          elements,
          Number(action.elementId) || 0,
        );
        if (!scrollElement) break;
        await scrollToElement(page, scrollElement.x, scrollElement.y);
        return null;
      }
      case "memorize": {
        return action.text || null;
      }

      case "enter": {
        await eventPressEnter(page);
        return null;
      }
    }
  }
  return null;
}
