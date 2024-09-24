import { Page } from "puppeteer";


export async function eventClick(
    page: Page,
    x: number,
    y: number,
  ): Promise<void> {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.up();
  }
  
  export async function eventType(
    page: Page,
    text: string,
  ): Promise<void> {
    for (const char of text) {
      await page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
    }
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
    await page.evaluate((x, y) => {
      const element = document.elementFromPoint(x, y);
      if (element) {
        element.scrollIntoView();
      }
    }, x, y);
}

export async function executeAgentAction() {
    
}