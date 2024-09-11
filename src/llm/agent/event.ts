import { Page } from "puppeteer";

export async function waitForEvent(page: Page, event: string): Promise<void> {
    return page.evaluate((event: string) => {
        return new Promise<void>((resolve) => {
            document.addEventListener(event, function() {
                resolve();
            });
        });
    }, event);
}