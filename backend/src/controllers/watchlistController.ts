import type { Request, Response } from 'express';
import { WatchedListing, AdSpot, User } from '../models/index.js';
import { getRedisClient } from '../config/redis.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js'

const redis = getRedisClient();

/**
 * Получение списка наблюдаемых спотов для пользователя
 * @route GET /api/watchlist
 * @access Пользователь/Администратор
 */
export const getUserWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Не найдены пользовательские данные');
  }

  const userId = req.user.id;

  // поиск результата в кеше
  const cacheKey = `watchlist:${userId}`;
  const cachedWatchlist = await redis.get(cacheKey);

  if (cachedWatchlist) {
    return res.json(JSON.parse(cachedWatchlist));
  }

  const watchlist = await WatchedListing.findAll({
    where: { userId },
    include: [
      {
        model: AdSpot,
        as: 'AdSpot',
        attributes: [
          'id', 'title', 'currentPrice', 'status', 'endDate',
          'imageUrl', 'location', 'estimatedViews', 'totalBids'
        ]
      }
    ],
    order: [[{ model: AdSpot, as: 'AdSpot' }, 'endDate', 'ASC']]
  });

  const formattedWatchlist = watchlist.map(item => ({
    id: item.id,
    adSpotId: item.adSpotId,
    addedAt: item.createdAt,
    adSpot: item.AdSpot
  }));

  // кэширование на 5 минут
  await redis.set(cacheKey, JSON.stringify(formattedWatchlist), 'EX', 300);

  res.json(formattedWatchlist);
});

/**
 * Получение количества пользователей, наблюдающих за спотом
 * @route GET /api/watchlist/count/:adSpotId
 * @access Public
 */
export const getWatchlistCount = asyncHandler(async (req: Request, res: Response) => {
  const { adSpotId } = req.params;

  if (!adSpotId || Array.isArray(adSpotId)) {
    throw new NotFoundError('Спот не найден');
  }

  // поиск результата в кеше
  const cacheKey = `watchlist:count:${adSpotId}`;
  const cachedCount = await redis.get(cacheKey);

  if (cachedCount) {
    return res.json({ count: parseInt(cachedCount) });
  }

  const adSpot = await AdSpot.findByPk(adSpotId);

  if (!adSpot) {
    throw new NotFoundError('Спот не найден');
  }

  const count = await WatchedListing.count({
    where: { adSpotId }
  });

  // кеш на 10 минут
  await redis.set(cacheKey, count.toString(), 'EX', 600);

  res.json({ count });
});

/**
 * Получение данных о пользователях, наблюдающих за спотом (админский доступ)
 * @route GET /api/watchlist/users/:adSpotId
 * @access Администратор
 */
export const getWatchingUsers = asyncHandler(async (req: Request, res: Response) => {
  const { adSpotId } = req.params;

  if (!adSpotId || Array.isArray(adSpotId)) {
    throw new NotFoundError('Спот не найден');
  }

  const adSpot = await AdSpot.findByPk(adSpotId);

  if (!adSpot) {
    throw new NotFoundError('Спот не найден');
  }

  const watchers = await WatchedListing.findAll({
    where: { adSpotId },
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'companyName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const formattedWatchers = watchers.map(watcher => ({
    id: watcher.id,
    userId: watcher.userId,
    addedAt: watcher.createdAt,
    user: watcher.User
  }));

  res.json(formattedWatchers);
});