import { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";


export async function BrowserInstance(
  headless: boolean = false,
): Promise<Browser> {
  puppeteer.use(StealthPlugin());
  const browser: Browser = await puppeteer.launch({
    userDataDir: "./data",
    headless,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
  });
  return browser;
}
