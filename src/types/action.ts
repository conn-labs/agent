export interface LabelData {
  id: string;
  x: number;
  y: number;
}

export interface NextAction {
  action: "click" | "type" ;
  element: string;
  text?: string;
}

export interface Data {
  nextAction: NextAction;
}
