
import { WebSocket } from "ws";

export default function agentHandler(ws: WebSocket, data: any): void {
    console.log(data)
    ws.send(JSON.stringify({ route: "/agent", data }));
}
