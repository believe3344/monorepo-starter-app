import { SocketMessage } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SocketGateway } from './socket.gateway';

export interface SendMessagePayload<T = any> {
  type: number;
  message?: string;
  code?: number;
  result?: T;
}

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  /**
   * 发送消息给指定客户端
   * 自动封装标准 SocketMessage 结构
   */
  sendMessage<T = any>(clientId: string, payload: SendMessagePayload<T>) {
    const { type, message = 'success', code = 200, result } = payload;

    const socketMessage: SocketMessage<T> = {
      code,
      message,
      type,
      result,
      timeStamp: Date.now(),
      uuid: uuidv4(),
    };

    this.socketGateway.send(clientId, socketMessage);
  }
}
