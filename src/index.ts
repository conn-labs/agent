// import { Browser, Page } from "puppeteer";
import { JSDOM } from "jsdom";




import { executeAgent } from "./llm/browser/execute";

await executeAgent("go to google.com and search flipkart, click on flipkart, search macbook and complete by describing all the products in json format including all important data", "", "one");