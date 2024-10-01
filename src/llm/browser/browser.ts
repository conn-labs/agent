import { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function BrowserInstance(
  headless: boolean = false,
): Promise<Browser> {
  const browser: Browser = await puppeteer.launch({
    headless,
    defaultViewport: {
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1,
    },
  });
  return browser;
}
