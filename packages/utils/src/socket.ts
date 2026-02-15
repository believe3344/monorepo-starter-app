import { storageUtil } from './storage';
import { uuid } from './util';

// 心跳检测
class HeartCheck {
  websocket: WebSocket;
  connectionTimeout = 5 * 1000; // 重连时间
  timeout = 30000; // 30s发一次心跳
  timeoutObj: ReturnType<typeof setInterval> | null = null;
  lockReconnect = false; // 是否真正建立连接

  constructor({ websocket }: { websocket: WebSocket }) {
    this.websocket = websocket;
  }

  reset(): this {
    if (this.timeoutObj) {
      clearTimeout(this.timeoutObj);
    }
    return this;
  }

  start(): void {
    this.timeoutObj = setInterval(() => {
      // 这里发送一个心跳，后端收到后，返回一个心跳消息，
      // onmessage拿到返回的心跳就说明连接正常
      if (this.websocket.readyState === WebSocket.OPEN) {
        const token = storageUtil.get('localStorage', 'token');
        if (token) {
          this.websocket.send(`ping:${token}`);
        } else {
          this.websocket.send('ping');
        }
      }
      if (
        this.websocket.readyState === WebSocket.CLOSING ||
        this.websocket.readyState === WebSocket.CLOSED
      ) {
        this.websocket.close();
      }
    }, this.timeout);
  }
}

export interface SocketData {
  [uid: string]: string;
}

export interface SocketMessage {
  uid?: string;
  code: number;
  content?: string;
  isSplit?: boolean;
  timeStamp?: number;
  message: string;
  index?: number;
  type?: number;
  uuid?: string;
  result?: any;
}

export interface CallbackMap {
  [key: string]: (data: SocketMessage) => void;
}

export class Socket {
  private failNum = 0; // 失败次数
  private maxFailNum = 5; // 最大失败次数
  private url: string; // ws地址
  private heartCheck!: HeartCheck; // 心跳对象
  private websocket: WebSocket | null = null; // ws对象
  private callback: CallbackMap = {}; // 回调函数集合
  private isReconnect = true; // 关闭socket是否重连
  private socketData: SocketData = {}; // 保存分割socket数据

  constructor({ url, success }: { url: string; success?: (data: SocketMessage) => void }) {
    this.url = url;
    this.initSocket(false, success);
  }

  // 自动重连
  private reconnect(): void {
    // 避免ws重复连接
    if (this.heartCheck.lockReconnect) return;
    this.heartCheck.lockReconnect = true;
    setTimeout(() => {
      this.initSocket(true);
      this.heartCheck.lockReconnect = false;
    }, this.heartCheck.connectionTimeout);
  }

  // 拼接socket分割数据
  private spliceSocketSplitData(data: SocketMessage): void {
    if (!data.uid) return;

    if (!this.socketData[data.uid]) {
      this.socketData[data.uid] = data.content || '';
    } else {
      this.socketData[data.uid] += data.content || '';
    }

    if (!data.index) {
      // 拼接结束
      try {
        const content = JSON.parse(this.socketData[data.uid]) as SocketMessage;
        if (this.callback[content.uuid || '']) {
          this.callback[content.uuid || ''](content);
        } else if (content.type !== undefined) {
          this.callback[content.type]?.(content);
        }
      } catch (error) {
        console.error('解析socket数据失败:', error);
      }
    }
  }

  // 初始化socket
  private initSocket(isReconnect: boolean, success?: (data: SocketMessage) => void): void {
    if (isReconnect && this.websocket) {
      this.websocket.close();
    }

    const token = storageUtil.get('localStorage', 'token');
    let clientId = storageUtil.get('sessionStorage', 'clientId');
    if (!clientId) {
      clientId = uuid();
      storageUtil.set('sessionStorage', 'clientId', clientId);
    }
    const websocket = new WebSocket(
      `${this.url}/websocket?clientId=${clientId}`,
      token ? [token] : [],
    );

    // 心跳对象
    this.heartCheck = new HeartCheck({ websocket });

    // 接收服务端信息
    websocket.onmessage = (e: MessageEvent) => {
      // 拿到任何消息都说明当前连接是正常的 心跳检测重置
      this.heartCheck.reset().start();

      if (e.data !== 'pongtoken' && e.data !== 'pong' && e.data !== 'pongbroken') {
        try {
          const res = JSON.parse(e.data || null) as SocketMessage;
          if (res.isSplit) {
            // 拼接socket分割数据
            this.spliceSocketSplitData(res);
          } else {
            const content = JSON.parse(res.content as string) as SocketMessage;
            if (content.type === 0) {
              if (content.result?.socketId) {
                // 如果报错说明是第一次挂载（避免重复创建Vue实例）
                success?.(content);
              }
            } else {
              const callback =
                this.callback[content.uuid || ''] || this.callback[content.type || ''];
              if (callback) {
                callback(content);
              } else {
                console.log('未找到对应的回调！');
              }
            }
          }
        } catch (error) {
          console.error('解析socket消息失败:', error);
        }
      }
    };

    // 连接成功
    websocket.onopen = () => {
      this.failNum = 0;
      console.info('websocket连接成功！');
      this.heartCheck.reset().start();
    };

    // socket连接失败
    websocket.onerror = () => {
      console.warn('websocket连接失败！');
      if (this.isReconnect) {
        if (this.failNum > this.maxFailNum) {
          console.error('websocket连接失败，刷新后重试！', 4000);
        } else {
          this.failNum++;
          this.reconnect();
        }
      }
    };

    // socket连接关闭
    websocket.onclose = (e: CloseEvent) => {
      console.warn(`connect closed(${e.code})`);
      if (this.isReconnect && this.failNum < this.maxFailNum) {
        this.reconnect();
      }
    };

    this.websocket = websocket;
  }

  // 添加回调
  addCallback(type: string, callback: (data: SocketMessage) => void): void {
    this.callback[type] = callback;
  }

  // 移除回调
  removeCallback(type: string): void {
    if (this.callback[type]) {
      delete this.callback[type];
    } else {
      console.warn('未找到对应回调，无法删除！');
    }
  }

  // 发送数据
  send(data: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    } else {
      setTimeout(() => {
        this.send(data);
      }, 1000);
    }
  }

  // 关闭socket连接
  close(): void {
    this.isReconnect = false;
    if (this.websocket) {
      this.websocket.close();
    }
  }
}
