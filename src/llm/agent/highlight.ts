import { Page } from "puppeteer";

export async function highlightLinks(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.querySelectorAll('[gpt-link-text]').forEach(e => {
            e.removeAttribute("gpt-link-text");
        });
    });

    const elements = await page.$$(
        "a, button, input[type='button'], input[type='submit'], [role='button'], [role='link'], [role='treeitem']"
    );

    for (const e of elements) {
        await page.evaluate((el: Element) => {
            function isElementVisible(el: Element): boolean {
                if (!el) return false;

                function isStyleVisible(el: Element): boolean {
                    const style = window.getComputedStyle(el as HTMLElement);
                    return style.width !== '0' &&
                           style.height !== '0' &&
                           style.opacity !== '0' &&
                           style.display !== 'none' &&
                           style.visibility !== 'hidden';
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

                if (!isStyleVisible(el)) return false;

                let parent: Element | null = el;
                while (parent) {
                    if (!isStyleVisible(parent)) return false;
                    parent = parent.parentElement;
                }

                return isElementInViewport(el);
            }

            function getElementType(el: Element): 'button' | 'link' | 'other' {
                const tagName = el.tagName.toLowerCase();
                const role = el.getAttribute('role');

                if (tagName === 'button' || 
                    (tagName === 'input' && (el as HTMLInputElement).type === 'button') ||
                    (tagName === 'input' && (el as HTMLInputElement).type === 'submit') ||
                    role === 'button') {
                    return 'button';
                } else if (tagName === 'a' || role === 'link') {
                    return 'link';
                } else {
                    return 'other';
                }
            }

            const elementType = getElementType(el);
            let borderColor: string;

            switch (elementType) {
                case 'button':
                    borderColor = 'blue';
                    break;
                case 'link':
                    borderColor = 'green';
                    break;
                default:
                    borderColor = 'red';
                    break;
            }

            (el as HTMLElement).style.border = `2px solid ${borderColor}`;

            const position = el.getBoundingClientRect();

            if (position.width > 5 && position.height > 5 && isElementVisible(el)) {
                const link_text = el.textContent?.replace(/[^a-zA-Z0-9 ]/g, '') || '';
                el.setAttribute("gpt-link-text", link_text);
                el.setAttribute("gpt-element-type", elementType);
            }
        }, e);
    }
}

