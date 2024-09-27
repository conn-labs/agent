// import { Browser, Page } from "puppeteer";
import { JSDOM } from "jsdom";




import { executeAgent } from "./llm/browser/execute";

await executeAgent("Go to google.com, search google finance, go to google finance, search apple stocks and complete ur workflow by telling me apple stock price from it", "", "one");