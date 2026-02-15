import type { CallbackMap, SocketData, SocketMessage } from './socket';
import { storageUtil } from './storage';
import { uuid } from './util';

/**
 * SSE 客户端配置选项
 */
export interface SSEClientOptions {
  /** SSE 服务地址 */
  url: string;
  /** 连接成功回调 */
  success?: (data: SocketMessage) => void;
  /** 心跳超时时间 (毫秒)，默认 30000 */
  heartbeatTimeout?: number;
  /** 重连间隔 (毫秒)，默认 5000 */
  retryInterval?: number;
  /** 最大重连次数，默认 5 */
  maxRetries?: number;
  /** 发送消息的 API 路径，默认 /sse/sendMessage */
  sendApiEndpoint?: string;
}

/**
 * SSE 心跳检测类
 * 用于检测连接是否假死
 */
class HeartCheck {
  private timeout: number;
  private timeoutObj: ReturnType<typeof setTimeout> | null = null;
  private reconnectCallback: () => void;

  constructor(timeout: number, reconnectCallback: () => void) {
    this.timeout = timeout;
    this.reconnectCallback = reconnectCallback;
  }

  /**
   * 重置心跳检测
   * 每次收到消息时调用，刷新超时计时器
   */
  reset(): this {
    if (this.timeoutObj) {
      clearTimeout(this.timeoutObj);
      this.timeoutObj = null;
    }
    return this;
  }

  /**
   * 开始心跳检测
   */
  start(): void {
    if (this.timeoutObj) {
      clearTimeout(this.timeoutObj);
    }
    this.timeoutObj = setTimeout(() => {
      // 如果超时未收到消息，认为连接断开，触发重连
      console.warn('SSE 心跳超时，尝试重连...');
      this.reconnectCallback();
    }, this.timeout);
  }

  /**
   * 停止心跳检测
   */
  stop(): void {
    this.reset();
  }
}

/**
 * SSE 客户端类
 * 封装 EventSource 连接、消息处理、自动重连等功能
 */
export class SSEClient {
  private failNum = 0; // 当前失败次数
  private maxFailNum: number; // 最大失败次数
  private retryInterval: number; // 重连间隔
  private url: string; // SSE地址
  private sendApiEndpoint: string; // 发送消息的接口地址
  private eventSource: EventSource | null = null;
  private callback: CallbackMap = {}; // 回调函数集合
  private isReconnect = true; // 关闭连接是否重连
  private socketData: SocketData = {}; // 保存分割数据
  private heartCheck: HeartCheck;
  private successCallback?: (data: SocketMessage) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: SSEClientOptions) {
    this.url = options.url;
    this.successCallback = options.success;
    this.maxFailNum = options.maxRetries ?? 5;
    this.retryInterval = options.retryInterval ?? 5000;
    this.sendApiEndpoint = options.sendApiEndpoint ?? '/sse/sendMessage';

    const heartbeatTimeout = options.heartbeatTimeout ?? 30000;
    this.heartCheck = new HeartCheck(heartbeatTimeout, () => {
      this.eventSource?.close();
      // 心跳超时视为异常断开，触发重连
      this.reconnect();
    });

    this.initSSE(false);
  }

  /**
   * 自动重连逻辑
   */
  private reconnect(): void {
    if (this.failNum >= this.maxFailNum) {
      console.error('SSE 连接失败次数过多，停止重连！');
      return;
    }

    // 如果已经有重连定时器在运行，则不重复设置
    if (this.reconnectTimer) {
      return;
    }

    this.failNum++;
    console.warn(`SSE 尝试第 ${this.failNum} 次重连...`);

    this.reconnectTimer = setTimeout(() => {
      this.initSSE(true);
      this.reconnectTimer = null;
    }, this.retryInterval);
  }

  /**
   * 拼接分割数据
   * @param data Socket 消息数据
   */
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
        this.handleMessageContent(content);
        delete this.socketData[data.uid]; // 清理缓存
      } catch (error) {
        console.error('解析 SSE 分割数据失败:', error);
      }
    }
  }

  /**
   * 处理消息内容分发
   * @param content 消息内容
   */
  private handleMessageContent(content: SocketMessage): void {
    if (content.type === 0) {
      if (content.result?.socketId) {
        this.successCallback?.(content);
      }
    } else {
      const callback =
        this.callback[content.uuid || ''] ||
        (content.type ? this.callback[content.type] : undefined);
      if (callback) {
        callback(content);
      } else {
        // console.log('未找到对应的回调！', content);
      }
    }
  }

  /**
   * 初始化 SSE 连接
   * @param isReconnect 是否为重连模式
   */
  private initSSE(isReconnect: boolean): void {
    if (isReconnect && this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // 确保之前的连接彻底关闭
    this.heartCheck.stop();

    const token = storageUtil.get('localStorage', 'token');
    let clientId = storageUtil.get('sessionStorage', 'clientId');
    if (!clientId) {
      clientId = uuid();
      storageUtil.set('sessionStorage', 'clientId', clientId);
    }
    // SSE 不支持 headers，通常通过 URL query 参数传递 token
    const sseUrl = `${this.url}/sse/connect?clientId=${clientId}&token=${token || ''}`;

    try {
      // 注意：如果需要跨域携带 cookie，需设置 withCredentials: true
      // 这里假设同域或通过 token 认证
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        console.info('SSE 连接成功！');
        this.failNum = 0; // 重置失败次数
        this.heartCheck.reset().start();
      };

      // 处理 CONNECT 事件
      this.eventSource.addEventListener('CONNECT', (e: any) => {
        this.heartCheck.reset().start();
        try {
          const res = JSON.parse(e.data);
          if (res.sessionId) {
            const message: SocketMessage = {
              type: 0,
              code: 200,
              message: res.message,
              result: { socketId: res.sessionId },
            };
            console.log('CONNECT 消息:', message);
            this.handleMessageContent(message);
          }
        } catch (error) {
          console.error('解析 SSE CONNECT 消息失败:', error);
        }
      });

      // 处理 HEARTBEAT 事件
      this.eventSource.addEventListener('HEARTBEAT', (_e: any) => {
        // 收到心跳包，重置心跳检测
        this.heartCheck.reset().start();
      });

      // 处理普通消息事件
      this.eventSource.addEventListener('MESSAGE', (e: any) => {
        this.heartCheck.reset().start();
        this.processMessage(e.data);
      });

      // 处理连接错误事件
      this.eventSource.onerror = (e) => {
        console.warn('SSE 连接断开或错误:', e);
        this.eventSource?.close();
        this.heartCheck.stop();

        if (this.isReconnect) {
          this.reconnect();
        }
      };
    } catch (error) {
      console.error('创建 SSE 连接异常:', error);
      if (this.isReconnect) {
        this.reconnect();
      }
    }
  }

  /**
   * 统一处理消息解析
   * @param data 原始消息数据
   */
  private processMessage(data: string): void {
    try {
      const res = JSON.parse(data) as SocketMessage;
      if (res.isSplit) {
        this.spliceSocketSplitData(res);
      } else {
        // 兼容原有逻辑，如果 content 是字符串 JSON，则解析
        // 如果直接是对象，则直接使用
        let content: SocketMessage;
        if (typeof res.content === 'string') {
          try {
            content = JSON.parse(res.content);
          } catch {
            // 如果解析失败，可能 content 本身就是普通字符串消息，或者 res 就是消息体
            content = res;
          }
        } else {
          content = res;
        }

        this.handleMessageContent(content);
      }
    } catch (error) {
      console.error('解析 SSE 消息失败:', error);
    }
  }

  /**
   * 添加回调
   * @param type 回调类型/ID
   * @param callback 回调函数
   */
  addCallback(type: string, callback: (data: SocketMessage) => void): void {
    this.callback[type] = callback;
  }

  /**
   * 移除回调
   * @param type 回调类型/ID
   */
  removeCallback(type: string): void {
    if (this.callback[type]) {
      delete this.callback[type];
    } else {
      console.warn('未找到对应回调，无法删除！');
    }
  }

  /**
   * 发送数据
   * 注意：SSE (Server-Sent Events) 本身是单向通信协议（仅服务端向客户端发送），不支持客户端通过 SSE 连接直接发送消息。
   * 此方法是为了保持与 Socket 接口的兼容性而实现的“模拟发送”。
   * 它实际上是发起一个独立的 HTTP POST 请求来发送数据（Side-channel）。
   * @param data 发送的数据
   */
  send<T = any>(data: T): void {
    const token = storageUtil.get('localStorage', 'token');
    // 假设发送接口为 /sse/message，根据实际情况调整
    // 这是一个约定的 HTTP 接口，用于接收客户端的消息

    // 移除末尾的斜杠以避免双斜杠
    const baseUrl = this.url.endsWith('/') ? this.url.slice(0, -1) : this.url;
    const endpoint = this.sendApiEndpoint.startsWith('/')
      ? this.sendApiEndpoint
      : `/${this.sendApiEndpoint}`;
    const sendUrl = `${baseUrl}${endpoint}`;

    fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
      body: JSON.stringify(data),
    }).catch((err) => {
      console.error('SSE (HTTP) 发送消息失败:', err);
    });
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.isReconnect = false;
    this.heartCheck.stop();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
