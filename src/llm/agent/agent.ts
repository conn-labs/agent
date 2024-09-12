
import puppeteer, {} from 'puppeteer-extra';
import { Browser, Page, ElementHandle } from 'puppeteer'
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Message } from '../../types/msg';
import Openai from 'openai';
import { waitForEvent } from './event';
import { sleep } from '../../utils/sleep';
import { highlightLinks } from './highlight';
import { imgToBase64 } from '../../utils/img';
import { agentClick } from './click';
import { agentFillAndSubmit } from './input';
import { getSimplifiedHtml } from './parseHtml';
puppeteer.use(StealthPlugin());

const openai = new Openai()
export async function executeAgent(input: string) {
    const browser: Browser = await puppeteer.launch({
        headless: false,
    });

    const page: Page = await browser.newPage();

    await page.setViewport({
        width: 1200,
        height: 1200,
        deviceScaleFactor: 1,
    });
    
    const messages: Message[] = [
        {
          role: "system",
          content: `You are an advanced website crawler and automative AI agent with the ability to navigate complex workflows across multiple sites. You will be given instructions on what to do by browsing. You are connected to a web browser and will be provided screenshots of the websites you visit. The links on the website will be highlighted in green in the screenshots, Buttons would be highlighted in Blue and rest would be the content. Always carefully read and analyze what is in the screenshot. Do not guess or assume link names or content.
      
          You can perform the following actions:
      
          1. Go to a specific URL: 
          {"url": "https://example.com"}  
      
          2. Click links or buttons on the website:
          {"click": "Text in link or button"}
      
          3. Input text into form fields:
          {"input": [
            {"fieldname": "Username", "value": "johndoe"},
            {"fieldname": "Password", "value": "secretpass123"}
          ]}

              4. Input text and then click a button (common for form submissions):
    {"input": [
      {"fieldname": "Search", "value": "example query"}
    ],
    "click": "Submit"}
      
          5. Perform a Google search:
          {"url": "https://google.com/search?q=your+search+query+here"}
      
          6. On success:  
          {"msg": "The success message"}
          
      
          Navigation instructions:
          - Your workflow may involve complex navigation across multiple websites.
          - Use Google search for simple queries by setting the URL as shown above.
          - If the user provides a direct URL or has it in the input, prioritize going to that specific address.
          - Do not invent or make up links that are not visible in the provided screenshots.
          - Give response in JSON format only as specified above.
          - Once your workflow is complete return the msg json with the success message of the data user asked to extract from the page.
          - If user has asked you to route to a specific url dont use click directly provid url
          - If the data or result user asked is already present on the screenshot, just extract data from it rather than clicking and going to the exact page
          - Some pages might have pop ups to sign in, you can always click the cross button and remove them and if they are unskipable just go to another url
          - Only go to deep urls when Needed.
      
          Always base your actions and responses on the information visible in the screenshots. If you need clarification or additional information, ask the user before proceeding.`
        }
      ];

      messages.push({
        "role": "user",
        "content": input,
      })
      let url: string | null = null;
      let ss = false;
      


    while(true){
      if(url) {
        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 5000,
        });
        
        await Promise.race([
            waitForEvent(page, 'load'),
            sleep(5000)
        ]);

        await highlightLinks(page)
        await page.screenshot({
            path: "screenshot.jpg",
            fullPage: true,
        });

        ss = true;
        url = null;
      }


      if(ss) {
        console.log((await getSimplifiedHtml(page)))
        const img = await imgToBase64("screenshot.jpg");
        messages.push({
            role: "user",
            content: [
                {
                    type: "image_url",
                    image_url: {
                        "url": img,
                        "detail": "high"
                    },
                },
                {
                    type: "text",
                    text: "Here's the ss now continue the workflow",
                }
            ]
        });
        ss = false;
      }
      console.log(messages)
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as any,
           response_format: {
            type: "json_object"
        } // Type assertion needed due to OpenAI types
    });
    const message = response.choices[0].message.content || ""

    messages.push({
        role: "assistant",
        content: message,
    })

    const json = JSON.parse(message)
    if(json.url) {
        url = json.url
    }
    if(json.msg) {
        console.log(json.msg);
        break;
    }
   
    if(json.click) {
      const bool = await agentClick(json.click, page)
      ss = bool
    }

    if(json.input) {
      const bool = await agentFillAndSubmit(page, json);
      ss = bool
    }
    

}

}