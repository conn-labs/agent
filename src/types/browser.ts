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
