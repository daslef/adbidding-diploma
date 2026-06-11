import type { Request, Response } from 'express';
import { Op } from 'sequelize';

import { Bid, AdSpot, User } from '../models/index.js';
import { getRedisClient } from '../providers/redis.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { createNotification } from '../utils/notifications.js';

const redis = getRedisClient();

/**
 * Получение всех ставок по споту
 * @route GET /api/adspots/:id/bids
 * @access Public
 */
export const getBidsForAdSpot = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Некорректный параметр id ставки');
  }

  const cacheKey = `bids:${id}`;
  const cachedBids = await redis.lrange(cacheKey, 0, -1);

  if (cachedBids.length > 0) {
    const bids = cachedBids.map(bid => JSON.parse(bid));
    return res.json(bids);
  }

  const adSpot = await AdSpot.findByPk(id);

  if (!adSpot) {
    throw new NotFoundError('Ставка не найдена');
  }

  const bids = await Bid.findAll({
    where: { adSpotId: id },
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'companyName']
      }
    ]
  });

  if (bids.length > 0) {
    const pipeline = redis.pipeline();
    bids.forEach(bid => {
      pipeline.lpush(cacheKey, JSON.stringify({
        id: bid.id,
        amount: bid.amount,
        userId: bid.userId,
        companyName: bid.User.companyName,
        createdAt: bid.createdAt,
        isHighestBid: bid.isHighestBid
      }));
    });
    pipeline.expire(cacheKey, 3600);
    await pipeline.exec();
  }

  res.json(bids);
});

/**
 * Получение ставки по ID
 * @route GET /api/bids/:id
 * @access Public
 */
export const getBidById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Некорректный параметр id ставки');
  }

  const bid = await Bid.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'companyName']
      },
      {
        model: AdSpot,
        attributes: ['id', 'title']
      }
    ]
  });

  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  res.json(bid);
});

/**
 * Get all bids for a user
 * @route GET /api/bids/user/:userId
 * @access Private
 */
export const getUserBids = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new BadRequestError('Not authorized to view these bids');
  }

  const bids = await Bid.findAll({
    where: { userId },
    order: [['created_at', 'DESC']],
    include: [
      {
        model: AdSpot,
        attributes: ['id', 'title', 'currentPrice', 'status', 'endDate']
      }
    ]
  });

  res.json(bids);
});

/**
 * Get highest bids across all ad spots
 * @route GET /api/bids/highest
 * @access Public
 */
export const getHighestBids = asyncHandler(async (req: Request, res: Response) => {
  // Try to get from cache first
  const cacheKey = 'bids:highest';
  const cachedBids = await redis.get(cacheKey);

  if (cachedBids) {
    return res.json(JSON.parse(cachedBids));
  }

  // Get highest bids from database
  const highestBids = await Bid.findAll({
    where: { isHighestBid: true },
    include: [
      {
        model: AdSpot,
        attributes: ['id', 'title', 'status']
      },
      {
        model: User,
        attributes: ['id', 'companyName']
      }
    ],
    order: [['amount', 'DESC']],
    limit: 10
  });

  await redis.set(cacheKey, JSON.stringify(highestBids), 'EX', 3600); // 1 hour

  res.json(highestBids);
});

/**
 * Place a new bid
 * @route POST /api/adspots/:id/bids
 * @access Private
 */
export const placeBid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.user.id;

  // проверка лимита запросов
  const rateLimitKey = `ratelimit:bid:${userId}`;
  const currentCount = await redis.incr(rateLimitKey);

  // First bid sets the expiry
  if (currentCount === 1) {
    await redis.expire(rateLimitKey, 60); // 60 seconds
  }

  if (currentCount > 5) {
    throw new BadRequestError('Вы делаете ставки слишком часто. Пожалуйста, подождите минуту.');
  }

  const adSpot = await AdSpot.findByPk(id);

  if (!adSpot) {
    throw new NotFoundError('Ad spot not found');
  }

  if (adSpot.status !== 'active') {
    throw new BadRequestError('Аукцион завершен');
  }

  if (new Date(adSpot.endDate) < new Date()) {
    // Update status to ended
    await adSpot.update({ status: 'ended' });
    throw new BadRequestError('Аукцион завершен');
  }

  if (amount <= adSpot.currentPrice) {
    throw new BadRequestError(`Новая ставка должна превышать текущую: $${adSpot.currentPrice}`);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  const bid = await Bid.create({
    adSpotId: id,
    userId,
    amount,
    isHighestBid: true,
  });

  // обновление прежней наивысшей ставки
  await Bid.update(
    { isHighestBid: false },
    {
      where: {
        adSpotId: id,
        isHighestBid: true,
        id: { [Op.ne]: bid.id }
      }
    }
  );

  await adSpot.update({
    currentPrice: amount,
    totalBids: adSpot.totalBids + 1,
  });

  // уведомление прежнего лидера аукциона

  const previousHighestBid = await Bid.findOne({
    where: { adSpotId: id, isHighestBid: false },
    order: [['amount', 'DESC']],
    limit: 1,
    include: [{ model: User }]
  });

  if (previousHighestBid && previousHighestBid.userId !== userId) {
    await createNotification({
      userId: previousHighestBid.userId,
      message: `Ваша ставка по аукциону "${adSpot.title}" перебита ${user.companyName}`,
      type: 'outbid',
      relatedAdSpotId: id
    });
  }

  await redis.del(`adspot:${id}`);
  await redis.lpush(`bids:${id}`, JSON.stringify({
    id: bid.id,
    amount: bid.amount,
    userId: bid.userId,
    companyName: user.companyName,
    createdAt: bid.createdAt,
    isHighestBid: true
  }));
  await redis.ltrim(`bids:${id}`, 0, 19); // Keep only 20 most recent
  await redis.set(`highestbid:${id}`, JSON.stringify(bid));
  await redis.del('bids:highest');

  // Publish to Redis for real-time updates
  await redis.publish('bid-updates', JSON.stringify({
    adSpotId: id,
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
      totalBids: adSpot.totalBids + 1,
    }
  }));

  res.status(201).json({
    id: bid.id,
    amount: bid.amount,
    userId: bid.userId,
    companyName: user.companyName,
    createdAt: bid.createdAt,
    isHighestBid: true
  });
});

/**
 * Update a bid (admin only)
 * @route PUT /api/bids/:id
 * @access Private/Admin
 */
export const updateBid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, isHighestBid } = req.body;

  const bid = await Bid.findByPk(id);

  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  const updatedBid = await bid.update({
    amount,
    isHighestBid
  });

  // If marked as highest bid, update other bids for this ad spot
  if (isHighestBid) {
    await Bid.update(
      { isHighestBid: false },
      {
        where: {
          adSpotId: bid.adSpotId,
          id: { [Op.ne]: id }
        }
      }
    );

    // Update ad spot current price if necessary
    await AdSpot.update(
      { currentPrice: amount },
      { where: { id: bid.adSpotId } }
    );
  }

  // Invalidate caches
  await redis.del(`adspot:${bid.adSpotId}`);
  await redis.del(`bids:${bid.adSpotId}`);
  await redis.del('bids:highest');

  res.json(updatedBid);
});

/**
 * Delete a bid (admin only)
 * @route DELETE /api/bids/:id
 * @access Private/Admin
 */
export const deleteBid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bid = await Bid.findByPk(id);

  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  const adSpotId = bid.adSpotId;
  const isHighestBid = bid.isHighestBid;

  await bid.destroy();

  // If it was the highest bid, update the ad spot and set the next highest bid
  if (isHighestBid) {
    const nextHighestBid = await Bid.findOne({
      where: { adSpotId },
      order: [['amount', 'DESC']],
      limit: 1
    });

    if (nextHighestBid) {
      await nextHighestBid.update({ isHighestBid: true });

      await AdSpot.update(
        { currentPrice: nextHighestBid.amount },
        { where: { id: adSpotId } }
      );
    } else {
      // No more bids, reset to starting price
      const adSpot = await AdSpot.findByPk(adSpotId);
      await adSpot.update({ currentPrice: adSpot.startingPrice });
    }
  }

  // Update total bids count
  const adSpot = await AdSpot.findByPk(adSpotId);
  await adSpot.update({ totalBids: adSpot.totalBids - 1 });

  // Invalidate caches
  await redis.del(`adspot:${adSpotId}`);
  await redis.del(`bids:${adSpotId}`);
  await redis.del('bids:highest');

  res.json({ message: 'Bid deleted successfully' });
});