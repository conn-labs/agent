import { Page } from "puppeteer";

export async function extractAndSaveCookies(page: Page) {
    const cookies = await page.cookies()
                                        
    console.log("cookies", cookies);
                                     
}

