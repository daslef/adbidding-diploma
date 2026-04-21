import { Notification, User } from "../models/index.js";
import { getRedisClient } from "../config/redis.js";
import { logger } from "./logger.js";

const redis = getRedisClient();

/**
 * Создание и публикация уведомления в Redis
 * @param {Object} notification - Уведомление
 * @param {string} notification.userId - ID пользователя
 * @param {string} notification.message - Сообщение
 * @param {string} notification.type - Тип уведомления
 * @param {string} [notification.relatedAdSpotId] - ID соответствующего спота
 * @returns {Promise<Object>} Созданное уведомление
 */
export const createNotification = async ({ userId, message, type, relatedAdSpotId = null }) => {
  try {
    // Добавление уведомления в базу данных
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedAdSpotId,
      read: false
    });

    // Увеличение счетчика непрочитанных уведомлений у пользователя
    const unreadKey = `unread:${userId}`;
    await redis.incr(unreadKey);

    const ttl = await redis.ttl(unreadKey);
    if (ttl < 0) {
      await redis.expire(unreadKey, 300); // 5 minutes
    }

    const notificationData = {
      id: notification.id,
      userId,
      message,
      type,
      relatedAdSpotId,
      createdAt: notification.createdAt
    };

    // Публикация в Redis
    await redis.publish('user-notification', JSON.stringify(notificationData));
    await redis.publish(`user:${userId}:notifications`, JSON.stringify(notificationData));

    return notification;
  } catch (error: unknown) {
    logger.error(`Ошибка создания уведомления: ${(error as Error).message}`, { error: (error as Error).stack });
    throw error;
  }
};

/**
 * Отметить уведомление как прочитанное
 * @param {string} notificationId - ID уведомления
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const notification = await Notification.findByPk(notificationId);

    if (!notification) {
      return false;
    }

    if (notification.read) {
      return true;
    }

    await notification.update({ read: true });

    // Уменьшение счетчика непрочитанных уведомлений у пользователя
    const unreadKey = `unread:${notification.userId}`;
    await redis.decr(unreadKey);

    return true;
  } catch (error) {
    logger.error(`Ошибка при смене статуса уведомления: ${(error as Error).message}`, { error: (error as Error).stack });
    throw error;
  }
};

/**
 * Отметить все уведомления пользователя как прочитанные
 * @param {string} userId - User ID
 * @returns {Promise<number>} Количество уведомлений, отмеченных как прочитанные
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const unreadCount = await Notification.count({
      where: {
        userId,
        read: false
      }
    });

    if (unreadCount === 0) {
      return 0;
    }

    await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );

    await redis.set(`unread:${userId}`, 0, 'EX', 300);

    return unreadCount;
  } catch (error) {
    logger.error(`Ошибка при смене статуса всех уведомлений: ${(error as Error).message}`, { error: (error as Error).stack });
    throw error;
  }
};

/**
 * Отправить системную рассылку всем пользователем
 * @param {string} message - сообщение
 * @returns {Promise<void>}
 */
export const sendSystemNotification = async (message: string): Promise<void> => {
  try {
    // Получение идентификаторов всех пользователей
    const users = await User.findAll({ attributes: ['id'] });

    for (const user of users) {
      await exports.createNotification({
        userId: user.id,
        message,
        type: 'system'
      });
    }
  } catch (error) {
    logger.error(`Ошибка при отправке системной рассылки: ${(error as Error).message}`, { error: (error as Error).stack });
    throw error;
  }
};