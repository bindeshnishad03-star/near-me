'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  onlineUsers: new Set(),
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Establish connection
    const socketInstance = io(typeof window !== 'undefined' ? window.location.origin : '', {
      autoConnect: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to websocket server');
      if (session?.user?.id) {
        socketInstance.emit('register-user', session.user.id);
      }
    });

    socketInstance.on('user-status-change', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        if (status === 'online') {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  // Re-emit register user if session loads after socket connect
  useEffect(() => {
    if (socket && socket.connected && session?.user?.id) {
      socket.emit('register-user', session.user.id);
    }
  }, [socket, session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
