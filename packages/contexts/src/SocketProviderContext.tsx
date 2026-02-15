import { Socket, SSEClient } from '@app/utils';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

type ClientType = Socket | SSEClient;

interface SocketContextType {
  socketId: string;
  socket: ClientType | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  url?: string;
  auto?: boolean;
  mode?: 'socket' | 'sse';
}

export const SocketProviderContext: React.FC<SocketProviderProps> = ({
  children,
  url,
  auto = true,
  mode = 'socket',
}) => {
  const [socketId, setSocketId] = useState('');
  const [socket, setSocket] = useState<ClientType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!url) return;
    setSocket((prevSocket) => {
      if (prevSocket) {
        prevSocket.close();
      }

      const successCallback = (data: any) => {
        setSocketId(data.result?.socketId || '');
        setIsConnected(true);
      };

      let newSocket: ClientType;
      if (mode === 'sse') {
        newSocket = new SSEClient({ url, success: successCallback });
      } else {
        newSocket = new Socket({ url, success: successCallback });
      }
      return newSocket;
    });
  }, [url, mode]);

  const disconnect = useCallback(() => {
    setSocket((prevSocket) => {
      if (prevSocket) {
        prevSocket.close();
      }
      return null;
    });
    setSocketId('');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // 当 url 或 mode 变化时，如果 auto 为 true，则重新连接
    // 如果只是 url 变了，之前的 effect 清理函数会调用 disconnect
    // 然后这里调用 connect
    if (auto && url) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [url, auto, mode, connect, disconnect]);

  // 防止子组件重渲染
  const value = useMemo(() => {
    return {
      socketId,
      socket,
      isConnected,
      connect,
      disconnect,
    };
  }, [socketId, socket, isConnected, connect, disconnect]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
