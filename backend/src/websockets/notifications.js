const { Notification } = require('../models');
const { getRedisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

const redis = getRedisClient();

/**
 * Handle user notification subscriptions
 */
exports.handleUserNotifications = (io, socket) => {
  const userId = socket.userId;
  
  if (!userId) {
    socket.emit('notification-error', {
      message: 'Not authenticated'
    });
    return;
  }
  
  // Subscribe to user's notification channel in Redis
  const userChannel = `user:${userId}:notifications`;
  
  // Send unread notifications count
  sendUnreadNotificationsCount(socket, userId);
  
  // Set up listener for new user notifications
  redis.subscribe(userChannel);
  
  redis.on('message', (channel, message) => {
    if (channel === userChannel) {
      try {
        const notification = JSON.parse(message);
        socket.emit('new-notification', notification);
      } catch (error) {
        logger.error(`Error processing user notification: ${error.message}`, {
          channel,
          userId,
          error: error.stack
        });
      }
    }
  });
  
  // Clean up on disconnect
  socket.on('disconnect', () => {
    redis.unsubscribe(userChannel);
  });
};

/**
 * Send unread notifications count to the user
 */
async function sendUnreadNotificationsCount(socket, userId) {
  try {
    // Get from cache first
    const cacheKey = `unread:${userId}`;
    let count = await redis.get(cacheKey);
    
    if (count === null) {
      // Count from database
      count = await Notification.count({
        where: {
          userId,
          read: false
        }
      });
      
      // Cache for 5 minutes
      await redis.set(cacheKey, count, 'EX', 300);
    }
    
    socket.emit('unread-count', { count: parseInt(count) });
  } catch (error) {
    logger.error(`Error getting unread notifications count: ${error.message}`, {
      userId,
      error: error.stack
    });
  }
}