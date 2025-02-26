'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BidUpdate, NotificationUpdate, AuctionEndUpdate } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinBidding: (adSpotId: string | number) => void;
  leaveBidding: (adSpotId: string | number) => void;
  placeBid: (adSpotId: string | number, amount: number) => Promise<void>;
  subscribeToNotifications: () => void;
  unreadCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5010';
    console.log('Connecting to WebSocket at:', socketUrl);
    
    const socketInstance = io(socketUrl, {
      auth: {
        token,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected!');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected!');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for unread notifications count
    socketInstance.on('unread-count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [user, token]);

  // Join a bidding room
  const joinBidding = (adSpotId: string | number) => {
    if (socket && isConnected) {
      console.log(`Joining bidding room for ad spot ${adSpotId}`);
      socket.emit('join-bidding', adSpotId);
    } else {
      console.warn('Cannot join bidding room: Socket not connected');
    }
  };

  // Leave a bidding room
  const leaveBidding = (adSpotId: string | number) => {
    if (socket && isConnected) {
      console.log(`Leaving bidding room for ad spot ${adSpotId}`);
      socket.emit('leave-bidding', adSpotId);
    }
  };

  // Place a bid via WebSocket and handle response with a Promise
  const placeBid = (adSpotId: string | number, amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        console.error('Cannot place bid: Socket not connected');
        reject(new Error('Socket not connected'));
        return;
      }

      // Set up one-time listeners for this specific bid
      const onSuccess = (data: any) => {
        socket.off('bid-success', onSuccess);
        socket.off('bid-error', onError);
        resolve();
      };

      const onError = (error: any) => {
        socket.off('bid-success', onSuccess);
        socket.off('bid-error', onError);
        reject(error);
      };

      // Listen for responses - these are one-time listeners for this specific bid
      socket.once('bid-success', onSuccess);
      socket.once('bid-error', onError);

      // Place the bid
      console.log(`Placing bid of ${amount} on ad spot ${adSpotId}`);
      socket.emit('place-bid', { adSpotId, amount });

      // Set a timeout in case the server doesn't respond
      setTimeout(() => {
        // If we're still waiting, clean up listeners and reject
        socket.off('bid-success', onSuccess);
        socket.off('bid-error', onError);
        reject(new Error('Bid timeout: No response from server'));
      }, 10000); // 10 second timeout
    });
  };

  // Subscribe to notifications
  const subscribeToNotifications = () => {
    if (socket && isConnected) {
      console.log('Subscribing to notifications');
      socket.emit('subscribe-notifications');
    } else {
      console.warn('Cannot subscribe to notifications: Socket not connected');
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      joinBidding, 
      leaveBidding, 
      placeBid,
      subscribeToNotifications,
      unreadCount 
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function useBidUpdates(callback: (update: BidUpdate) => void) {
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleNewBid = (data: BidUpdate) => {
      callback(data);
    };
    
    socket.on('new-bid', handleNewBid);
    
    return () => {
      socket.off('new-bid', handleNewBid);
    };
  }, [socket, callback]);
}

export function useAuctionEndUpdates(callback: (update: AuctionEndUpdate) => void) {
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleAuctionEnd = (data: AuctionEndUpdate) => {
      callback(data);
    };
    
    socket.on('auction-ended', handleAuctionEnd);
    
    return () => {
      socket.off('auction-ended', handleAuctionEnd);
    };
  }, [socket, callback]);
}

export function useNotifications(callback: (notification: NotificationUpdate) => void) {
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (data: NotificationUpdate) => {
      callback(data);
    };
    
    socket.on('new-notification', handleNewNotification);
    
    return () => {
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, callback]);
}