import { sleep } from "bun";
import { BrowserInstance } from "../browser";
import { waitForEvent } from "../event";
import { highlightPage } from "../highlight";

export async function webScrapperAgent(
  url: string,
  schema: string,
  input: string,
) {
   
   const browser = await BrowserInstance()
   const page = await browser.newPage();

   await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 5000
   })

   await Promise.race([waitForEvent(page, "load"), sleep(5000)]);
   await highlightPage(page)

   await page.screenshot({
    path: `abc.jpeg`,
    fullPage: true,
  });
 
  console.log("fun")

   
}
