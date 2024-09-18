const { JSDOM } = require('jsdom');

export function cleanHTML(html: string): string {
    // Create a DOM from the provided HTML string
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Recursively remove unwanted elements
    const unwantedTags = ['script', 'style', 'link', 'meta'];

    // Function to recursively clean elements
    function cleanNode(node: HTMLElement): HTMLElement {
        // Remove unwanted tags
        unwantedTags.forEach(tag => {
            const elements = node.getElementsByTagName(tag);
            for (let i = elements.length - 1; i >= 0; i--) {
                elements[i].remove();
            }
        });

        // Simplify nested tags that don't contain meaningful content
        Array.from(node.children).forEach(child => {
            cleanNode(child as HTMLElement);

            // If a tag has no text content or useful children, remove it
            if (child.textContent?.trim() === '' && child.children.length === 0) {
                child.remove();
            }
        });

        return node;
    }

    // Start cleaning from the body of the document
    const cleanedDocument = cleanNode(document.body);

    // Format HTML into a more human-readable format
    const prettyHTML = (cleanedDocument.innerHTML as string)
        .replace(/>\s+</g, '>\n<')  // Add line breaks between tags
        .replace(/^\s+|\s+$/gm, '')  // Trim whitespace from each line
        .replace(/\n{2,}/g, '\n')    // Collapse multiple newlines into one
        .replace(/\s{2,}/g, ' ');    // Collapse excessive spaces

    return prettyHTML;
}


