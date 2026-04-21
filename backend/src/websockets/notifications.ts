import type { Server, Socket } from "socket.io";
import { Notification } from "../models/index.js";
import { getRedisClient } from "../config/redis.js";
import { logger } from "../utils/logger.js";


const redis = getRedisClient();

/**
 * Обработка пользовательских подписок на уведомления
 */
export const handleUserNotifications = (io: Server, socket: Socket) => {
  type SocketWithAuth = Socket & { userId: string };

  const userId = (socket as SocketWithAuth).userId;

  if (!userId) {
    socket.emit('notification-error', {
      message: 'Отсутствуют пользовательские данные'
    });
    return;
  }

  // Подписка на канал уведомлений пользователя в Redis
  const userChannel = `user:${userId}:notifications`;

  // Отправка количества непрочитанных уведомлений
  sendUnreadNotificationsCount(socket, userId);

  redis.subscribe(userChannel);

  redis.on('message', (channel, message) => {
    if (channel === userChannel) {
      try {
        const notification = JSON.parse(message);
        socket.emit('new-notification', notification);
      } catch (error) {
        logger.error(`Ошибка при обработке пользовательских уведомлений: ${(error as Error).message}`, {
          channel,
          userId,
          error: (error as Error).stack
        });
      }
    }
  });

  // Отписка при завершении соединения
  socket.on('disconnect', () => {
    redis.unsubscribe(userChannel);
  });
};

/**
 * Отправка количества непрочитанных уведомлений пользователю
 */
async function sendUnreadNotificationsCount(socket: Socket, userId: string) {
  try {
    // поиск в кеше
    const cacheKey = `unread:${userId}`;
    let count = await redis.get(cacheKey);

    if (count === null) {
      count = await Notification.count({
        where: {
          userId,
          read: false
        }
      });

      // кеш на 5 минут
      await redis.set(cacheKey, count, 'EX', 300);
    }

    socket.emit('unread-count', { count: parseInt(count) });
  } catch (error: unknown) {
    logger.error(`Ошибка при получении количества непрочитанных уведомлений: ${(error as Error).message}`, {
      userId,
      error: (error as Error).stack
    });
  }
}