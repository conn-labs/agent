import { Page } from "puppeteer";
import { LabelData, Item, Rect } from "../../types/browser";

export async function highlightAndLabelElements(
  page: Page,
): Promise<LabelData[]> {
  return await page.evaluate(() => {
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
        [
          "INPUT",
          "TEXTAREA",
          "SELECT",
          "BUTTON",
          "A",
          "IFRAME",
          "VIDEO",
        ].includes(element.tagName) ||
        (element as HTMLElement).onclick != null ||
        window.getComputedStyle(element).cursor === "pointer"
      );
    }

    function createHighlightElement(bbox: Rect, id: number): HTMLElement {
      const borderColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 25%)`;
      const textColor = "white";

      const newElement = document.createElement("div");
      newElement.style.outline = `2px dashed ${borderColor}`;
      newElement.style.position = "fixed";
      newElement.style.left = `${bbox.left}px`;
      newElement.style.top = `${bbox.top}px`;
      newElement.style.width = `${bbox.width}px`;
      newElement.style.height = `${bbox.height}px`;
      newElement.style.pointerEvents = "none";
      newElement.style.boxSizing = "border-box";
      newElement.style.zIndex = "2147483647";

      const label = document.createElement("span");
      label.textContent = id.toString();
      label.style.position = "absolute";
      label.style.top = `-${Math.min(19, bbox.top)}px`;
      label.style.left = "0px";
      label.style.background = borderColor;
      label.style.color = textColor;
      label.style.padding = "2px 4px";
      label.style.fontSize = "14px";
      label.style.fontFamily = "monospace";
      label.style.borderRadius = "2px";
      newElement.appendChild(label);

      return newElement;
    }

    function markPage(): LabelData[] {
      // Unmark existing highlights
      const existingLabels = document.querySelectorAll(
        'div[style*="outline"][style*="position: fixed"]',
      );
      existingLabels.forEach((label) => document.body.removeChild(label));

      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      );

      const items: Item[] = Array.from(document.querySelectorAll("*"))
        .map((element) => {
          const rects = getElementRects(element, vw, vh);
          const area = rects.reduce(
            (acc, rect) => acc + rect.width * rect.height,
            0,
          );

          return {
            element,
            include: shouldIncludeElement(element),
            area,
            rects,
            text: element.textContent?.trim().replace(/\s{2,}/g, " ") || "",
          };
        })
        .filter((item) => item.include && item.area >= 20);

      // Only keep inner clickable items
      const filteredItems = items.filter(
        (x) => !items.some((y) => x.element.contains(y.element) && x !== y),
      );

      // Add sequential IDs
      const itemsWithIds = filteredItems.map((item, index) => ({
        ...item,
        id: index + 1,
      }));

      // Create highlighting elements
      itemsWithIds.forEach((item) => {
        item.rects.forEach((bbox) => {
          const highlightElement = createHighlightElement(bbox, item.id!);
          document.body.appendChild(highlightElement);
        });
      });

      return itemsWithIds.map((item) => ({
        id: item.id!,
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
      }));
    }

    return markPage();
  });
}
