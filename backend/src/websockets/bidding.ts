import type { Server, Socket } from 'socket.io';

import { AdSpot, Bid, User } from '../models/index.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import * as notificationProvider from '../utils/notifications.js'

const redis = getRedisClient();

/**
 * Обработка ставок через WebSocket
 */
export const handleBidding = (io: Server, socket: Socket) => {
  return async (data) => {
    try {
      const { adSpotId, amount } = data;
      const userId = socket.userId;

      // проверка данных
      if (!adSpotId || !amount) {
        return socket.emit('bid-error', {
          message: 'Отсутствуют обязательные данные'
        });
      }

      // проверка ограничений на количество запросов
      const rateLimitKey = `ratelimit:bid:${userId}`;
      const currentCount = await redis.incr(rateLimitKey);

      // First bid sets the expiry
      if (currentCount === 1) {
        await redis.expire(rateLimitKey, 60); // 60 seconds
      }

      if (currentCount > 5) {
        return socket.emit('bid-error', {
          message: 'Вы делаете ставки слишком часто. Подождите минуту.'
        });
      }

      const adSpot = await AdSpot.findByPk(adSpotId);

      if (!adSpot) {
        return socket.emit('bid-error', {
          message: 'Спот не найден'
        });
      }

      if (adSpot.status !== 'active') {
        return socket.emit('bid-error', {
          message: 'Этот аукцион уже завершен'
        });
      }

      if (new Date(adSpot.endDate) < new Date()) {
        await adSpot.update({ status: 'ended' });

        // рассылка сообщений о завершении аукциона всем подключенным клиентам
        io.to(`bidding:${adSpotId}`).emit('auction-ended', {
          adSpotId,
          message: 'Этот аукцион завершен'
        });

        return socket.emit('bid-error', {
          message: 'Этот аукцион завершен'
        });
      }

      // проверка величины ставки
      if (amount <= adSpot.currentPrice) {
        return socket.emit('bid-error', {
          message: `Ставка должна превышать текущую: $${adSpot.currentPrice}`
        });
      }

      // Get user for company name
      const user = await User.findByPk(userId);

      if (!user) {
        return socket.emit('bid-error', {
          message: 'Пользователь не найден'
        });
      }

      const bid = await Bid.create({
        adSpotId,
        userId,
        amount,
        isHighestBid: true,
      });

      await Bid.update(
        { isHighestBid: false },
        { where: { adSpotId, isHighestBid: true, id: { $ne: bid.id } } }
      );

      await adSpot.update({
        currentPrice: amount,
        totalBids: adSpot.totalBids + 1,
      });

      // поиск автора предыдущей наивысшей ставки для его уведомления
      const previousHighestBid = await Bid.findOne({
        where: { adSpotId, isHighestBid: false },
        order: [['amount', 'DESC']],
        limit: 1,
        include: [{ model: User }]
      });

      if (previousHighestBid && previousHighestBid.userId !== userId) {
        // уведомление о перебивке предыдущей наивысшей ставки
        await notificationProvider.createNotification({
          userId: previousHighestBid.userId,
          message: `Вашу ставку по споту "${adSpot.title}" перебили ${user.companyName}`,
          type: 'outbid',
          relatedAdSpotId: adSpotId
        });
      }

      // очистка и обновление кеша
      await redis.del(`adspot:${adSpotId}`);
      await redis.lpush(`bids:${adSpotId}`, JSON.stringify({
        id: bid.id,
        amount: bid.amount,
        userId: bid.userId,
        companyName: user.companyName,
        createdAt: bid.createdAt,
        isHighestBid: true
      }));
      await redis.ltrim(`bids:${adSpotId}`, 0, 19); // храним 20 последних
      await redis.set(`highestbid:${adSpotId}`, JSON.stringify(bid));
      await redis.del('bids:highest');

      const bidData = {
        adSpotId,
        bid: {
          id: bid.id,
          amount: bid.amount,
          userId: bid.userId,
          companyName: user.companyName,
          createdAt: bid.createdAt,
          isHighestBid: true,
        },
        adSpot: {
          id: adSpot.id,
          currentPrice: amount,
          totalBids: adSpot.totalBids,
        }
      };

      // отправка в Redis для рассылки всем подписчикам
      await redis.publish('bid-updates', JSON.stringify(bidData));

      // отправка уведомления об успехе создателю ставки
      socket.emit('bid-success', bidData);

      logger.info(`Новая ставка от ${userId} размером ${amount} на споте ${adSpotId}`);
    } catch (error: unknown) {
      logger.error(`Ошибка при обработке ставки: ${(error as Error).message}`, { error: (error as Error).stack });

      socket.emit('bid-error', {
        message: 'Не удалось обработать Вашу ставку'
      });
    }
  };
};