import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import browser from './browser'


const app = new Hono()
app.get('/', (c) => c.text('Asta agent'))
app.use(prettyJSON())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const page = await browser.newPage();
await page.goto('https://google.com');

export default {  
    port: 3000, 
    fetch: app.fetch, 
}