import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

@WebSocketGateway({
  path: '/websocket',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  private clients: Map<string, WebSocket> = new Map();

  /**
   * 客户端连接处理
   * 从 URL 中提取 clientId 并保存连接
   */
  handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const clientId = url.searchParams.get('clientId');

    if (clientId) {
      this.clients.set(clientId, client);
      console.log(`Client connected: ${clientId}`);
    }

    // 心跳机制
    client.on('message', (data) => {
      const message = data.toString();
      if (message === 'ping') {
        client.send('pong');
      } else if (message.startsWith('ping:')) {
        client.send('pongtoken');
      }
    });
  }

  /**
   * 客户端断开连接处理
   */
  handleDisconnect(client: WebSocket) {
    for (const [id, socket] of this.clients.entries()) {
      if (socket === client) {
        this.clients.delete(id);
        console.log(`Client disconnected: ${id}`);
        break;
      }
    }
  }

  /**
   * 发送消息到底层 Socket
   */
  send(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}
