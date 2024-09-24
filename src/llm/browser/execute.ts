

import { BrowserInstance } from "./browser"; 
import { Page } from "puppeteer";
import { highlightAndLabelElements } from "./highlight";
import {executeAgentAction} from "./actions";
import OpenAI from "openai";
import { basePrompt } from "../prompt/agent";
import { llmRequest } from "./llm";
import { waitForEvent } from "./event";
import { Elements } from "../../types/browser";
import { imgToBase64 } from "../../utils/img";
import { AgentAction } from "../../types/action";


export async function executeAgent(
    input: string,
    context: string,
    sessionId: string,
    
) {
   const memeorizedText = new Set<string>(); 

   const browser = await BrowserInstance();
   
   const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: basePrompt,
    },
    {
        role: "user",
        content: input,
    }
   ]
   
   let elements: Elements[] =[];    
   let screenshot: string = ""
   let screenshotTaken: boolean = false
    let url: string | null =  null; 
    let screenshotHash: number = 1;
    while (true) {
        
        const page = await browser.newPage();
        
        if(url) {
        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 5000,
        });
        
        await Promise.race([
            waitForEvent(page, 'load'),
            sleep(5000)
        ]);

         elements = await highlightAndLabelElements(page);
        await page.screenshot({
            path: `${sessionId}/${screenshotHash}.jpg`,
            fullPage: true,
        });
        screenshotHash++;
        screenshotTaken = true
        screenshot =  await imgToBase64(`${sessionId}/${screenshotHash}.jpg`)
        url = null
      }
      
      if(screenshotTaken) {
        messages.push({
            role: "user",
            content: [
                {
                    type: "image_url",
                    image_url: {
                        "url": screenshot,
                        "detail": "high"
                    },
                },
                {
                    type: "text",
                    text: "Here's the ss now continue the workflow accurately", 
                }
            ]
        });

        screenshot = ""
        screenshotTaken = false
      }

      const response = await llmRequest(messages);

      if(!response) break;
      
      messages.push({
        role: "assistant",
        content: response.toString(),
    })

      const data: any = JSON.parse(response.toString());
      
      if(data.url) {
          url = data.url
      }

      if(data.success) {
        console.log(data.success)
        break;
      }
      if(data.action) {
        const mem: String | null | undefined = await executeAgentAction(
            page,
            data.action as AgentAction[],
            elements 
        )
        console.log(mem)
      }
        
     break;

    }


}

// src/utils/sleep.ts
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}