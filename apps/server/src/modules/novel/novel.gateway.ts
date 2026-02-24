import { SocketMessage } from '@app/shared';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';

@WebSocketGateway({
  path: '/websocket',
})
export class NovelGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  private clients: Map<string, WebSocket> = new Map();

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const clientId = url.searchParams.get('clientId');

    if (clientId) {
      this.clients.set(clientId, client);
      console.log(`Client connected: ${clientId}`);
    }

    // Heartbeat mechanism
    client.on('message', (data) => {
      const message = data.toString();
      if (message === 'ping') {
        client.send('pong');
      } else if (message.startsWith('ping:')) {
        client.send('pongtoken');
      }
    });
  }

  handleDisconnect(client: WebSocket) {
    for (const [id, socket] of this.clients.entries()) {
      if (socket === client) {
        this.clients.delete(id);
        console.log(`Client disconnected: ${id}`);
        break;
      }
    }
  }

  sendToClient(clientId: string, type: number, message: string, result: any) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      const payload: SocketMessage = {
        code: 200,
        message,
        type,
        result,
        timeStamp: Date.now(),
        uuid: uuidv4(),
      };
      client.send(JSON.stringify(payload));
    }
  }
}
