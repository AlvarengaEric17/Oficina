import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socketRef.current) return;

    socketRef.current = io(API_BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinBudget = (budgetId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-budget', budgetId);
    }
  };

  const leaveBudget = (budgetId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-budget', budgetId);
    }
  };

  const onStatusUpdated = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('statusUpdated', callback);
    }
  };

  const onScheduleUpdated = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('scheduleUpdated', callback);
    }
  };

  const offStatusUpdated = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('statusUpdated', callback);
    }
  };

  const offScheduleUpdated = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('scheduleUpdated', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinBudget,
    leaveBudget,
    onStatusUpdated,
    onScheduleUpdated,
    offStatusUpdated,
    offScheduleUpdated,
  };
};
