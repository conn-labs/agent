import axios from 'axios';
import { JSDOM } from 'jsdom';
import { LinkInfo } from '../types/browser';


export async function parseLinksFromHtml(url: string): Promise<LinkInfo[]> {
  try {

    const response = await axios.get(url);
    const html = response.data;


    const dom = new JSDOM(html);
    const document = dom.window.document;

    const links: LinkInfo[] = Array.from(document.querySelectorAll('a')).map(element => {
      let href = element.getAttribute('href') || '';

      if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
        href = new URL(href, url).href;
      }

      return {
        tagName: element.tagName.toLowerCase(),
        faceValue: element.textContent?.trim() || '',
        link: href
      };
    });
    return links;
  } catch (error) {
    console.error('Error fetching or parsing the webpage:', error);
    return [];
  }
}
