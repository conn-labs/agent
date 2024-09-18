import { Page } from "puppeteer";

export async function highlightLinks(page: Page): Promise<void> {
    await page.evaluate(() => {
        // Remove existing highlights and attributes
        document.querySelectorAll('[gpt-link-text], [gpt-element-type]').forEach(e => {
            e.removeAttribute("gpt-link-text");
            e.removeAttribute("gpt-element-type");
            (e as HTMLElement).style.border = '';
        });

        function isElementVisible(el: Element): boolean {
            const style = window.getComputedStyle(el as HTMLElement);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }

        function getElementType(el: Element): 'button' | 'link' | 'content' | 'other' {
            const tagName = el.tagName.toLowerCase();
            const role = el.getAttribute('role');

            if (tagName === 'button' || 
                (tagName === 'input' && ['button', 'submit'].includes((el as HTMLInputElement).type)) ||
                role === 'button') {
                return 'button';
            } else if (tagName === 'a' || role === 'link') {
                return 'link';
            } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'div', 'span'].includes(tagName)) {
                return 'content';
            } else {
                return 'other';
            }
        }

        function highlightElement(el: Element) {
            if (!isElementVisible(el)) return;

            const elementType = getElementType(el);
            let borderColor: string;

            switch (elementType) {
                case 'button':
                    borderColor = 'blue';
                    break;
                case 'link':
                    borderColor = 'green';
                    break;
                case 'content':
                    borderColor = 'red';
                    break;
                default:
                    borderColor = 'purple';
                    break;
            }

            (el as HTMLElement).style.border = `2px solid ${borderColor}`;

            const text = el.textContent?.replace(/[^a-zA-Z0-9 ]/g, '') || '';
            el.setAttribute("gpt-link-text", text);
            el.setAttribute("gpt-element-type", elementType);
        }

        // Highlight all visible elements
        document.body.querySelectorAll('*').forEach(highlightElement);
    });
}