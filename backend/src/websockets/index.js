const { getRedisSubscriber } = require('../config/redis');
const { logger } = require('../utils/logger');
const { socketAuth } = require('../middleware/auth');
const { handleBidding } = require('./bidding');
const { handleUserNotifications } = require('./notifications');

module.exports = (io) => {
  // Authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}, userId: ${socket.userId}`);

    // Join user to their private channel
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining an ad spot's bidding room
    socket.on('join-bidding', (adSpotId) => {
      socket.join(`bidding:${adSpotId}`);
      logger.info(`User ${socket.userId} joined bidding for ad spot ${adSpotId}`);
    });

    // Handle leaving an ad spot's bidding room
    socket.on('leave-bidding', (adSpotId) => {
      socket.leave(`bidding:${adSpotId}`);
      logger.info(`User ${socket.userId} left bidding for ad spot ${adSpotId}`);
    });

    // Handle new bid submission
    socket.on('place-bid', handleBidding(io, socket));

    // Handle notification subscriptions
    socket.on('subscribe-notifications', () => {
      handleUserNotifications(io, socket);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  // Setup Redis Pub/Sub listeners
  const subscriber = getRedisSubscriber();
  
  // Subscribe to channels
  subscriber.subscribe('bid-updates');
  subscriber.subscribe('auction-end');
  subscriber.subscribe('user-notification');

  subscriber.on('message', (channel, message) => {
    try {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'bid-updates':
          // Broadcast to everyone in the bidding room
          io.to(`bidding:${data.adSpotId}`).emit('new-bid', data);
          break;
          
        case 'auction-end':
          // Broadcast auction end event
          io.to(`bidding:${data.adSpotId}`).emit('auction-ended', data);
          break;
          
        case 'user-notification':
          // Send notification to specific user
          if (data.userId) {
            io.to(`user:${data.userId}`).emit('new-notification', data);
          }
          break;
          
        default:
          logger.warn(`Received message on unknown channel: ${channel}`);
          break;
      }
    } catch (error) {
      logger.error(`Error processing Redis message: ${error.message}`, {
        channel,
        message,
        error: error.stack
      });
    }
  });
};