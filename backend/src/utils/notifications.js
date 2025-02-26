const { Notification } = require('../models');
const { getRedisClient } = require('../config/redis');
const { logger } = require('./logger');

const redis = getRedisClient();

/**
 * Create a notification and publish to Redis
 * @param {Object} notification - Notification data
 * @param {string} notification.userId - User ID
 * @param {string} notification.message - Notification message
 * @param {string} notification.type - Notification type
 * @param {string} [notification.relatedAdSpotId] - Related ad spot ID
 * @returns {Promise<Object>} Created notification
 */
exports.createNotification = async ({ userId, message, type, relatedAdSpotId = null }) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedAdSpotId,
      read: false
    });

    // Increment unread count in Redis
    const unreadKey = `unread:${userId}`;
    await redis.incr(unreadKey);
    
    // Set expiry on unread count if new key
    const ttl = await redis.ttl(unreadKey);
    if (ttl < 0) {
      await redis.expire(unreadKey, 300); // 5 minutes
    }

    // Prepare notification data to send
    const notificationData = {
      id: notification.id,
      userId,
      message,
      type,
      relatedAdSpotId,
      createdAt: notification.createdAt
    };

    // Publish to Redis for real-time updates
    await redis.publish('user-notification', JSON.stringify(notificationData));
    
    // Also publish to user's specific channel
    await redis.publish(`user:${userId}:notifications`, JSON.stringify(notificationData));

    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`, { error: error.stack });
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
exports.markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return false;
    }
    
    // If already read, no need to update
    if (notification.read) {
      return true;
    }
    
    // Update notification
    await notification.update({ read: true });
    
    // Decrement unread count in Redis
    const unreadKey = `unread:${notification.userId}`;
    await redis.decr(unreadKey);
    
    return true;
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`, { error: error.stack });
    throw error;
  }
};

/**
 * Mark all notifications for a user as read
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
exports.markAllNotificationsAsRead = async (userId) => {
  try {
    // Get count of unread notifications
    const unreadCount = await Notification.count({
      where: {
        userId,
        read: false
      }
    });
    
    if (unreadCount === 0) {
      return 0;
    }
    
    // Update all notifications
    await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );
    
    // Reset unread count in Redis
    await redis.set(`unread:${userId}`, 0, 'EX', 300);
    
    return unreadCount;
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`, { error: error.stack });
    throw error;
  }
};

/**
 * Send system notification to all users
 * @param {string} message - Notification message
 * @returns {Promise<void>}
 */
exports.sendSystemNotification = async (message) => {
  try {
    // For large systems, this would be done with a job queue
    // For simplicity, we'll do it directly here
    
    // Get all user IDs
    const { User } = require('../models');
    const users = await User.findAll({ attributes: ['id'] });
    
    // Create notifications for each user
    for (const user of users) {
      await exports.createNotification({
        userId: user.id,
        message,
        type: 'system'
      });
    }
  } catch (error) {
    logger.error(`Error sending system notification: ${error.message}`, { error: error.stack });
    throw error;
  }
};