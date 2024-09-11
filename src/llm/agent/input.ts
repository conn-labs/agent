/// <reference lib="dom" />

import { Page, ElementHandle } from 'puppeteer'; // Assuming you're using Puppeteer
import { waitForEvent } from './event';
import { sleep } from '../../utils/sleep';
import { highlightLinks } from './highlight';

export async function agentFillAndSubmit(
  page: Page,
  actions: { input: { fieldname: string, value: string }[], click?: string }
): Promise<boolean> {
  try {
    // Input text into form fields
    if (actions.input && actions.input.length > 0) {
      for (const action of actions.input) {
        const fieldname = action.fieldname.replace(/[^a-zA-Z0-9 ]/g, '');
        const value = action.value;

        console.log(`Filling field "${fieldname}" with value "${value}"`);

        const elements: ElementHandle<Element>[] = await page.$$('[gpt-link-text]');

        let inputElement: ElementHandle<Element> | null = null;

        for (const element of elements) {
          const attributeValue = await element.evaluate((el: Element) => el.getAttribute('gpt-link-text'));

          if (attributeValue && attributeValue.includes(fieldname)) {
            inputElement = element;
            break;
          }
        }

        if (inputElement) {
          await inputElement.type(value, { delay: 100 }); // Typing with a small delay to mimic human behavior
        } else {
          throw new Error(`Cannot find input field with name "${fieldname}"`);
        }
      }
    }

    // Optionally click a button
    if (actions.click) {
      const buttonName = actions.click.replace(/[^a-zA-Z0-9 ]/g, '');
      console.log(`Clicking button "${buttonName}"`);

      const elements: ElementHandle<Element>[] = await page.$$('[gpt-link-text]');

      let buttonElement: ElementHandle<Element> | null = null;

      for (const element of elements) {
        const attributeValue = await element.evaluate((el: Element) => el.getAttribute('gpt-link-text'));

        if (attributeValue && attributeValue.includes(buttonName)) {
          buttonElement = element;
          break;
        }
      }

      if (buttonElement) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch((e: Error) => console.log("Navigation timeout/error:", e.message)),
          buttonElement.click()
        ]);

        await Promise.race([
          waitForEvent(page, 'load'),
          sleep(5000)
        ]);
      } else {
        throw new Error(`Cannot find button with name "${buttonName}"`);
      }
    }

    // Re-highlight elements after submission
    await highlightLinks(page);

    // Take a screenshot for verification
    await page.screenshot({
      path: "screenshot.jpg",
      fullPage: true
    });

    return true;
  } catch (error) {
    console.error("Error in agentFillAndSubmit:", error);
    throw error;
  }
}
