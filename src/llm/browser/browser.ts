import { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function BrowserInstance(): Promise<Browser> {
  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1,
    },
  });
  return browser;
}
