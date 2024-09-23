import { Page } from 'puppeteer';

interface LabelData {
  id: string;
  x: number;
  y: number;
}

interface NextAction {
  action: 'click' | 'type';
  element: string;
  text?: string;
}

interface Data {
  nextAction: NextAction;
}

async function simulateHumanClick(page: Page, x: number, y: number): Promise<void> {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
}

export async function simulateHumanTyping(page: Page, text: string): Promise<void> {
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
  }
}
async function findLabel(labelData: LabelData[], elementId: string): Promise<LabelData | undefined> {
  const data = labelData.filter(i => i.id === "1")
  console.log(data)
  return data[0]
}

export async function performAction(page: Page, data: Data | null, labelData: any): Promise<void> {
  if (!data) return;

  const  nextAction  = { action: 'type', element: "21", text: 'Hello world' };
  const label = labelData[0]
  console.log(label)    
  if (!label) {
    console.error(`Label not found for element: ${nextAction.element}`);
    return;
  }
  console.log(nextAction)
  console.log(validateCoordinates(label.x, label.y))
  switch (nextAction.action) {
    case 'click':
      console.log(`Clicking ${JSON.stringify(label)}`);
      await simulateHumanClick(page, label.x, label.y);
      break;

    case 'type':
      if (!nextAction.text) {
        console.error('Text is required for type action');
        return;
      }
      console.log(`Typing "${nextAction.text}" into ${JSON.stringify(label)}`);
      await simulateHumanClick(page, label.x, label.y);
      await simulateHumanTyping(page, nextAction.text);
      break;

    default:
      console.error(`Unknown action: ${nextAction.action}`);
  }
}


function validateCoordinates(x: number, y: number): boolean {
  console.log(x, y)
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0;
}