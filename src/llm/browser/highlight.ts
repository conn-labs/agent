// 
import { Page } from "puppeteer";
import { Elements, Item, Rect } from "../../types/browser";

export async function highlightAndLabelElements(
  page: Page,
): Promise<Elements[]> {
  return await page.evaluate(() => {


    // Utility functions
    function getElementRects(element: Element, vw: number, vh: number): Rect[] {
      return [...element.getClientRects()]
        .filter((bb) => {
          const center_x = bb.left + bb.width / 2;
          const center_y = bb.top + bb.height / 2;
          const elAtCenter = document.elementFromPoint(center_x, center_y);
          return elAtCenter === element || element.contains(elAtCenter);
        })
        .map((bb) => {
          const rect = {
            left: Math.max(0, bb.left),
            top: Math.max(0, bb.top),
            right: Math.min(vw, bb.right),
            bottom: Math.min(vh, bb.bottom),
          };
          return {
            ...rect,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top,
          };
        });
    }

    function shouldIncludeElement(element: Element): boolean {
      return (
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "IFRAME", "VIDEO"].includes(element.tagName) ||
        (element as HTMLElement).onclick != null ||
        window.getComputedStyle(element).cursor === "pointer"
      );
    }

    function createHighlightElement(bbox: Rect, id: number): HTMLElement {
      const borderColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 25%)`;
      const textColor = "white";

      const newElement = document.createElement("div");
      Object.assign(newElement.style, {
        outline: `2px dashed ${borderColor}`,
        position: "fixed",
        left: `${bbox.left}px`,
        top: `${bbox.top}px`,
        width: `${bbox.width}px`,
        height: `${bbox.height}px`,
        pointerEvents: "none",
        boxSizing: "border-box",
        zIndex: "2147483647",
      });

      const label = document.createElement("span");
      label.textContent = id.toString();
      Object.assign(label.style, {
        position: "absolute",
        top: `-${Math.min(19, bbox.top)}px`,
        left: "0px",
        background: borderColor,
        color: textColor,
        padding: "2px 4px",
        fontSize: "14px",
        fontFamily: "monospace",
        borderRadius: "2px",
      });
      newElement.appendChild(label);

      return newElement;
    }

    function getElementIdentifier(element: Element): string {
      if (element.tagName === 'A') {
        return (element as HTMLAnchorElement).href;
      } else if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
        return (element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).name;
      } else if (element.tagName === 'BUTTON') {
        return element.textContent?.trim() || '';
      } else {
        return '';
      }
    }

    function isTextElement(element: Element): boolean {
      return element.tagName !== 'IMG' && element.tagName !== 'SVG' && 
             (element.textContent?.trim().length ?? 0) > 0;
    }

    function getViewportDimensions(): { vw: number; vh: number } {
      return {
        vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
      };
    }

    function removeExistingHighlights(): void {
      const existingLabels = document.querySelectorAll('div[style*="outline"][style*="position: fixed"]');
      existingLabels.forEach((label) => label.parentNode?.removeChild(label));
    }

    function createItem(element: Element, vw: number, vh: number): Item {
      const rects = getElementRects(element, vw, vh);
      const area = rects.reduce((acc, rect) => acc + rect.width * rect.height, 0);

      return {
        element,
        include: shouldIncludeElement(element),
        area,
        rects,
        text: element.textContent?.trim().replace(/\s{2,}/g, " ") || "",
        identifier: getElementIdentifier(element),
        isText: isTextElement(element),
      };
    }

    function groupItemsByIdentifier(items: Item[]): Record<string, Item[]> {
      return items.reduce<Record<string, Item[]>>((acc, item) => {
        const identifier = item.identifier || '';
        if (!acc[identifier]) {
          acc[identifier] = [];
        }
        acc[identifier].push(item);
        return acc;
      }, {});
    }

    function selectPreferredItem(group: Item[]): Item {
      return group.reduce((preferred, current) => {
        if (preferred.isText && !current.isText) return preferred;
        if (!preferred.isText && current.isText) return current;
        return current.area > preferred.area ? current : preferred;
      });
    }

    function filterInnerItems(items: Item[]): Item[] {
      return items.filter(
        (x) => !items.some((y) => x.element.contains(y.element) && x !== y)
      );
    }

    function addHighlights(items: Item[]): void {
      items.forEach((item) => {
        item.rects.forEach((bbox) => {
          if (item.id !== undefined) {
            const highlightElement = createHighlightElement(bbox, item.id);
            document.body.appendChild(highlightElement);
          }
        });
      });
    }

    function createElementData(item: Item): Elements | null {
      if (item.id === undefined || item.rects.length === 0) {
        return null;
      }
      return {
        id: item.id,
        x: Math.round((item.rects[0].left + item.rects[0].right) / 2),
        y: Math.round((item.rects[0].top + item.rects[0].bottom) / 2),
        bboxs: item.rects.map(
          ({ left, top, width, height }) =>
            [
              Math.round(left),
              Math.round(top),
              Math.round(width),
              Math.round(height),
            ] as [number, number, number, number],
        ),
      };
    }

    function markPage(): Elements[] {
      removeExistingHighlights();
      const { vw, vh } = getViewportDimensions();

      const items = Array.from(document.querySelectorAll("*"))
        .map((element) => createItem(element, vw, vh))
        .filter((item) => item.include && item.area >= 20);

      const groupedItems = groupItemsByIdentifier(items);
      const filteredItems = Object.values(groupedItems).map(selectPreferredItem);
      const finalItems = filterInnerItems(filteredItems);

      const itemsWithIds = finalItems.map((item, index) => ({
        ...item,
        id: index + 1,
      }));

      addHighlights(itemsWithIds);

      return itemsWithIds.map(createElementData).filter((item): item is Elements => item !== null);
    }

    console.log("done");
    return markPage();
  });
}


export async function highlightPage(page: Page): Promise<void> {
  await page.evaluate(() => {
    function getElementRects(element: Element): Rect[] {
      return [...element.getClientRects()].map((bb) => {
        const rect = {
          left: Math.max(0, bb.left + window.scrollX),  // Adjust for scroll position
          top: Math.max(0, bb.top + window.scrollY),    // Adjust for scroll position
          right: bb.right + window.scrollX,
          bottom: bb.bottom + window.scrollY,
        };
        return {
          ...rect,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top,
        };
      });
    }

    function shouldIncludeElement(element: Element): boolean {
      // Only include links (a elements) for highlighting
      return element.tagName === "A";
    }

    function createHighlightElement(bbox: Rect): HTMLElement {
      const borderColor = "hsl(240, 100%, 50%)"; // Single color (blue)

      const newElement = document.createElement("div");
      newElement.style.outline = `2px dashed ${borderColor}`;
      newElement.style.position = "absolute";  // Absolute positioning for full page scroll coverage
      newElement.style.left = `${bbox.left}px`;
      newElement.style.top = `${bbox.top}px`;
      newElement.style.width = `${bbox.width}px`;
      newElement.style.height = `${bbox.height}px`;
      newElement.style.pointerEvents = "none";
      newElement.style.boxSizing = "border-box";
      newElement.style.zIndex = "2147483647";

      return newElement;
    }

    function markPage(): void {
      // Unmark existing highlights
      const existingLabels = document.querySelectorAll(
        'div[style*="outline"][style*="position: absolute"]',
      );
      existingLabels.forEach((label) => document.body.removeChild(label));

      const items: Item[] = Array.from(document.querySelectorAll("*"))
        .map((element) => {
          const rects = getElementRects(element);
          const area = rects.reduce(
            (acc, rect) => acc + rect.width * rect.height,
            0,
          );

          return {
            element,
            include: shouldIncludeElement(element),
            area,
            rects,
            text: element.textContent || '',
            identifier: element.id || element.className || element.tagName,
            isText: element.nodeType === Node.TEXT_NODE
          };
        })
        .filter((item) => item.include && item.area >= 20); // Include only valid items

      // Add highlights for filtered elements
      items.forEach((item) => {
        item.rects.forEach((bbox) => {
          const highlightElement = createHighlightElement(bbox);
          document.body.appendChild(highlightElement);
        });
      });
    }

    markPage();
  });
}