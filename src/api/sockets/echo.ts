import { WebSocket } from "ws";

export default function echoHandler(ws: WebSocket, data: any): void {
  // Echo the data back to the sender
  ws.send(JSON.stringify({ route: "/echo", data }));
}



