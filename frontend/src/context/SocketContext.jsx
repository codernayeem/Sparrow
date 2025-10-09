import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Create socket connection
    const newSocket = io(
      import.meta.env.VITE_NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5000',
      {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      }
    );

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      // Re-authenticate if we have a userId
      if (userId) {
        newSocket.emit('authenticate', userId);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Re-authenticate if we have a userId
      if (userId) {
        newSocket.emit('authenticate', userId);
      }
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection failed:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Update userId when it changes and re-authenticate
  useEffect(() => {
    if (socket && socket.connected && userId) {
      socket.emit('authenticate', userId);
    }
  }, [socket, userId]);

  const connectSocket = useCallback((newUserId) => {
    setUserId(newUserId);
    if (socket && !socket.connected) {
      socket.connect();
    } else if (socket && socket.connected) {
      socket.emit('authenticate', newUserId);
    }
  }, [socket]);

  const disconnectSocket = useCallback(() => {
    setUserId(null);
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }, [socket]);

  const joinConversation = useCallback((conversationId) => {
    if (socket && socket.connected && conversationId) {
      console.log('Joining conversation:', conversationId);
      socket.emit('joinConversation', conversationId);
    } else {
      console.warn('Cannot join conversation - socket not connected or no conversationId');
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket && socket.connected && conversationId) {
      console.log('Leaving conversation:', conversationId);
      socket.emit('leaveConversation', conversationId);
    }
  }, [socket]);

  const emitTyping = useCallback((conversationId, isTyping) => {
    if (socket && socket.connected && conversationId) {
      console.log('Emitting typing:', { conversationId, isTyping });
      socket.emit('typing', { conversationId, isTyping });
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
    joinConversation,
    leaveConversation,
    emitTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};