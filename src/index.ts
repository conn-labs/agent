/// <reference lib="dom" />


// import puppeteer, {} from 'puppeteer-extra';
// import { Browser, Page, ElementHandle } from 'puppeteer'
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import OpenAI from 'openai';
// import { createInterface } from 'readline';
// import { readFile } from 'fs/promises';


// puppeteer.use(StealthPlugin());

// const openai = new OpenAI();
// const timeout = 5000;



// interface Message {
//     role: string;
//     content: string | { type: string; text?: string; image_url?: string }[];
// }

// (async () => {
//     console.log("###########################################");
//     console.log("# GPT4V-Browsing by Unconventional Coding #");
//     console.log("###########################################\n");

//     const browser: Browser = await puppeteer.launch({
//         headless: false,
//     });

//     const page: Page = await browser.newPage();

//     await page.setViewport({
//         width: 1200,
//         height: 1200,
//         deviceScaleFactor: 1,
//     });

//     const messages: Message[] = [
//         {
//             role: "system",
//             content: `You are a website crawler. You will be given instructions on what to do by browsing. You are connected to a web browser and you will be given the screenshot of the website you are on. The links on the website will be highlighted in red in the screenshot. Always read what is in the screenshot. Don't guess link names.

//             You can go to a specific URL by answering with the following JSON format:
//             {"url": "url goes here"}

//             You can click links on the website by referencing the text inside of the link/button, by answering in the following JSON format:
//             {"click": "Text in link"}

//             Once you are on a URL and you have found the answer to the user's question, you can answer with a regular message.

//             Use google search by set a sub-page like 'https://google.com/search?q=search' if applicable. Prefer to use Google for simple queries. If the user provides a direct URL, go to that one. Do not make up links`,
//         }
//     ];

//     console.log("GPT: How can I assist you today?")
//     const prompt = await input("You: ");
//     console.log();

//     messages.push({
//         role: "user",
//         content: prompt,
//     });

//     let url: string | null = null;
//     let screenshot_taken = false;

//     while (true) {
//         if (url) {
//             console.log("Crawling " + url);
//             await page.goto(url, {
//                 waitUntil: "domcontentloaded",
//                 timeout: timeout,
//             });

//             await Promise.race([
//                 waitForEvent(page, 'load'),
//                 sleep(timeout)
//             ]);

//             await highlight_links(page);

//             await page.screenshot({
//                 path: "screenshot.jpg",
//                 fullPage: true,
//             });

//             screenshot_taken = true;
//             url = null;
//         }

//         if (screenshot_taken) {
//             const base64_image = await image_to_base64("screenshot.jpg");

//             messages.push({
//                 role: "user",
//                 content: [
//                     {
//                         type: "image_url",
//                         image_url: base64_image,
//                     },
//                     {
//                         type: "text",
//                         text: "Here's the screenshot of the website you are on right now. You can click on links with {\"click\": \"Link text\"} or you can crawl to another URL if this one is incorrect. If you find the answer to the user's question, you can respond normally.",
//                     }
//                 ]
//             });

//             screenshot_taken = false;
//         }

//         const response = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             max_tokens: 1024,
//             messages: messages as any    , // Type assertion needed due to OpenAI types
//         });

//         const message = response.choices[0].message;
//         const message_text = message.content || '';

//         messages.push({
//             role: "assistant",
//             content: message_text,
//         });

//         console.log("GPT: " + message_text);

//         if (typeof message_text === 'string') {
//             if (message_text.includes('{"click": "')) {
//                 const match = message_text.match(/\{"click": "(.*?)"\}/);
//                 if (match) {
//                     const link_text = match[1].replace(/[^a-zA-Z0-9 ]/g, '');
//                     console.log("Clicking on " + link_text);

//                     try {
//                         const elements: ElementHandle<Element>[] = await page.$$('[gpt-link-text]');

//                         let partial: ElementHandle<Element> | null = null;
//                         let exact: ElementHandle<Element> | null = null;

//                         for (const element of elements) {
//                             const attributeValue = await element.evaluate((el: { getAttribute: (arg0: string) => any; }) => el.getAttribute('gpt-link-text'));

//                             if (attributeValue && attributeValue.includes(link_text)) {
//                                 partial = element;
//                             }

//                             if (attributeValue === link_text) {
//                                 exact = element;
//                             }
//                         }

//                         if (exact || partial) {
//                             const [response] = await Promise.all([
//                                 page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch((e: { message: any; }) => console.log("Navigation timeout/error:", e.message)),
//                                 (exact || partial)!.click()
//                             ]);

//                             await Promise.race([
//                                 waitForEvent(page, 'load'),
//                                 sleep(timeout)
//                             ]);

//                             await highlight_links(page);

//                             await page.screenshot({
//                                 path: "screenshot.jpg",
//                                 fullPage: true
//                             });

//                             screenshot_taken = true;
//                         } else {
//                             throw new Error("Can't find link");
//                         }
//                     } catch (error) {
//                         console.log("ERROR: Clicking failed", error);

//                         messages.push({
//                             role: "user",
//                             content: "ERROR: I was unable to click that element",
//                         });
//                     }

//                     continue;
//                 }
//             } else if (message_text.includes('{"url": "')) {
//                 const match = message_text.match(/\{"url": "(.*?)"\}/);
//                 if (match) {
//                     url = match[1];
//                     continue;
//                 }
//             }
//         }

//         const new_prompt = await input("You: ");
//         console.log();

//         messages.push({
//             role: "user",
//             content: new_prompt,
//         });
//     }
// })();


import { executeAgent } from "./llm/agent/agent";


executeAgent("Go too google.com and search fossil watch and tell me cheapest one there")