
import { WebSocket } from "ws";
import { wsPayload } from "../../types/ws";

export default async function agentHandler(ws: WebSocket, data: any): Promise<void> {
    const payload = data as wsPayload;
 

}

