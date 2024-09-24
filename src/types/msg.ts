export interface Message {
  role: string;
  content: string | { type: string; text?: string; image_url?: any }[];
}
