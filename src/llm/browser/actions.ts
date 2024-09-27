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

export async function eventType(page: Page, text: string): Promise<void> {
  for (const char of text) {
    await page.keyboard.type(char, { delay: 1000 });
  }
  await page.keyboard.press('Enter');
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
): Promise<String | null | undefined> {
  for (const action of actions) {
    {
      switch (action.action) {
        case "click":
          const element = await findElement(elements,Number(action.elementId) || 0);
          if (element) {
            await eventClick(page, element.x, element.y);
            return "clicked";
          }
          break;
        case "type":
          const typeelement = await findElement(
            elements,
           Number(action.elementId) || 0,
          );
          if (!typeelement) break;
          await eventClick(page, typeelement.x, typeelement.y);
          await eventType(page, action.text || "");
          return "typed";
        case "scroll":
          const scrollelement = await findElement(
            elements,
           Number(action.elementId) || 0,
          );
          if (!scrollelement) break;
          await scrollToElement(page, scrollelement.x, scrollelement.y);
          return "scrolled";
        case "memorize":
          return action.text || null;
      }
    }
  }
}
