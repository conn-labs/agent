import OpenAI from "openai";

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Item {
  element: Element;
  include: boolean;
  area: number;
  rects: Rect[];
  text: string;
  id?: number;
}

export interface Elements {
  x: number;
  y: number;
  bboxs: [number, number, number, number][];
  id: number;
}

export interface LinkInfo {
  tagName: string;
  faceValue: string;
  link: string;
}

export interface AgentExecutionContext {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  elements: Elements[];
  screenshot: string;
  screenshotTaken: boolean;
  url: string | null;
  screenshotHash: number;
}
