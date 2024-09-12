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
            if (!el) return false;
            const style = window.getComputedStyle(el as HTMLElement);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }

        function isElementInViewport(el: Element): boolean {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
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

        function shouldHighlightContent(el: Element): boolean {
            const elementType = getElementType(el);
            if (elementType !== 'content') return false;
            
            const text = el.textContent?.trim() || '';
            return text.length > 0 && text.length < 1000 && !el.querySelector('a, button, input[type="button"], input[type="submit"]');
        }

        // Highlight interactive elements (buttons and links)
        document.querySelectorAll(
            "a, button, input[type='button'], input[type='submit'], [role='button'], [role='link'], [role='treeitem']"
        ).forEach(el => {
            if (isElementVisible(el) && isElementInViewport(el)) {
                const elementType = getElementType(el);
                const borderColor = elementType === 'button' ? 'blue' : 'green';
                (el as HTMLElement).style.border = `2px solid ${borderColor}`;

                const position = el.getBoundingClientRect();
                if (position.width > 5 && position.height > 5) {
                    const link_text = el.textContent?.replace(/[^a-zA-Z0-9 ]/g, '') || '';
                    el.setAttribute("gpt-link-text", link_text);
                    el.setAttribute("gpt-element-type", elementType);
                }
            }
        });

        // Highlight content elements
        document.body.querySelectorAll('*').forEach(el => {
            if (isElementVisible(el) && isElementInViewport(el) && !el.hasAttribute("gpt-element-type")) {
                if (shouldHighlightContent(el)) {
                    (el as HTMLElement).style.border = '2px solid red';
                    const content_text = el.textContent?.replace(/[^a-zA-Z0-9 ]/g, '') || '';
                    el.setAttribute("gpt-link-text", content_text);
                    el.setAttribute("gpt-element-type", 'content');
                }
            }
        });
    });
}