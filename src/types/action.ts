export interface ElementData {
  id: number;
  x: number;
  y: number;
}

export interface NextAction {
  action: "click" | "type";
  element: string;
  text?: string;
}

export interface Data {
  nextAction: NextAction;
}

export interface AgentAction {
  action: "click" | "type" | "scroll" | "memorize";
  elementId?: number;
  text?: string;
}
