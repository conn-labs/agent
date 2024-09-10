import { launch } from "puppeteer";


const browser = await launch({
    headless: false,
     // Set to true if you want to run in headless mode
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-size=1200,1200',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-dev-shm-usage',
    ],
    timeout: 30000, // Set a timeout for launching the browser
})


export default browser;