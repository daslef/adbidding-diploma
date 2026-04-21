import type { Request, Response } from 'express';

import { AdSpot, AdSpotEvent, AdSpotTheme, WatchedListing } from '../models/index.js';
import { getRedisClient } from '../config/redis.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

const redis = getRedisClient();

/**
 * Получение всех спотов с пагинацией и фильтрацией
 * @route GET /api/adspots
 * @access Public
 */
export const getAllAdSpots = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1
  const limit = req.query.limit ? Number(req.query.limit) : 12
  const search = req.query.search ?? null
  const status = req.query.status ?? null
  const minPrice = req.query.minPrice ?? null
  const maxPrice = req.query.maxPrice ?? null

  const cacheKey = `adspots:list:${page}:${limit}:${search || ''}:${status || ''}:${minPrice || ''}:${maxPrice || ''}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const filters: any = {};

  if (status) {
    filters.status = status
  };

  if (minPrice && typeof minPrice === "string") {
    filters.currentPrice = { $gte: parseFloat(minPrice) };
  }

  if (maxPrice) {
    filters.currentPrice = { ...filters.currentPrice, $lte: parseFloat(maxPrice) };
  }

  if (search) {
    filters.$or = [
      { title: { $iLike: `%${search}%` } },
      { description: { $iLike: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await AdSpot.findAndCountAll({
    where: filters,
    limit: limit,
    offset,
    order: [['created_at', 'DESC']],
    include: ['events', 'theme']
  });

  const result = {
    adSpots: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalAdSpots: count,
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

  res.json(result);
});

/**
 * Получение информации по споту
 * @route GET /api/adspots/:id
 * @access Public
 */
export const getAdSpotById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Ad spot not found');
  }

  const cacheKey = `adspot:${id}`;
  const cachedData = await redis.hgetall(cacheKey);

  if (Object.keys(cachedData).length > 0) {
    return res.json({
      ...cachedData,
      currentPrice: parseFloat(cachedData.currentPrice),
      totalBids: parseInt(cachedData.totalBids),
      events: JSON.parse(cachedData.events || '[]'),
      theme: cachedData.theme ? JSON.parse(cachedData.theme) : null
    });
  }

  const adSpot = await AdSpot.findByPk(id, {
    include: ['events', 'theme']
  });

  if (!adSpot) {
    throw new NotFoundError('Спот не найден');
  }

  const cacheData = {
    id: adSpot.id,
    title: adSpot.title,
    description: adSpot.description,
    currentPrice: adSpot.currentPrice.toString(),
    totalBids: adSpot.totalBids.toString(),
    startingPrice: adSpot.startingPrice.toString(),
    reservePrice: adSpot.reservePrice.toString(),
    endDate: adSpot.endDate,
    status: adSpot.status,
    imageUrl: adSpot.imageUrl,
    location: adSpot.location,
    dimensions: adSpot.dimensions,
    eventCount: adSpot.eventCount.toString(),
    estimatedViews: adSpot.estimatedViews.toString(),
    seasonDuration: adSpot.seasonDuration,
    events: JSON.stringify(adSpot.events || []),
    theme: adSpot.theme ? JSON.stringify(adSpot.theme) : null
  };

  await redis.hset(cacheKey, cacheData);
  await redis.expire(cacheKey, 300);

  res.json(adSpot);
});

/**
 * Создание нового спота
 * @route POST /api/adspots
 * @access Private/Admin
 */
export const createAdSpot = asyncHandler(async (req: Request, res: Response) => {
  const {
    title, description, startingPrice, reservePrice,
    endDate, imageUrl, location, dimensions,
    eventCount, estimatedViews, seasonDuration, events,
    theme
  } = req.body;

  if (!req.user) {
    throw new UnauthorizedError('Отсутствуют пользовательские данные')
  }

  const adSpot = await AdSpot.create({
    title,
    description,
    currentPrice: startingPrice,
    startingPrice,
    reservePrice,
    endDate,
    status: 'active',
    totalBids: 0,
    imageUrl,
    location,
    dimensions,
    eventCount,
    estimatedViews,
    seasonDuration,
    ownerId: req.user.id,
  });

  if (events && events.length > 0) {
    await Promise.all(events.map(event =>
      AdSpotEvent.create({
        adSpotId: adSpot.id,
        eventName: event
      })
    ));
  }

  if (theme) {
    await AdSpotTheme.create({
      adSpotId: adSpot.id,
      ...theme
    });
  }

  await redis.del('adspots:list:*');

  res.status(201).json(adSpot);
});

/**
 * Обновление спота
 * @route PUT /api/adspots/:id
 * @access Private/Admin
 */
export const updateAdSpot = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Спот не найден');
  }

  const adSpot = await AdSpot.findByPk(id);

  if (!adSpot) {
    throw new NotFoundError('Спот не найден');
  }

  const { currentPrice, totalBids, ownerId, ...updatedFields } = req.body;

  await adSpot.update(updatedFields);

  if (updatedFields.events) {
    await AdSpotEvent.destroy({ where: { adSpotId: id } });

    if (updatedFields.events.length > 0) {
      await Promise.all(updatedFields.events.map(event =>
        AdSpotEvent.create({
          adSpotId: adSpot.id,
          eventName: event
        })
      ));
    }
  }

  if (updatedFields.theme) {
    const existingTheme = await AdSpotTheme.findOne({ where: { adSpotId: id } });

    if (existingTheme) {
      await existingTheme.update(updatedFields.theme);
    } else {
      await AdSpotTheme.create({
        adSpotId: adSpot.id,
        ...updatedFields.theme
      });
    }
  }

  await redis.del(`adspot:${id}`);
  await redis.del('adspots:list:*');

  const updatedAdSpot = await AdSpot.findByPk(id, {
    include: ['events', 'theme']
  });

  res.json(updatedAdSpot);
});

/**
 * Удаление спота
 * @route DELETE /api/adspots/:id
 * @access Private/Admin
 */
export const deleteAdSpot = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Спот не найден');
  }

  const adSpot = await AdSpot.findByPk(id);

  if (!adSpot) {
    throw new NotFoundError('Спот не найден');
  }

  await adSpot.destroy();

  await redis.del(`adspot:${id}`);
  await redis.del('adspots:list:*');

  res.json({ message: 'Спот успешно удалён' });
});

/**
 * Добавить спот в список наблюдения
 * @route POST /api/adspots/:id/watch
 * @access Private
 */
export const watchAdSpot = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Спот не найден');
  }

  if (!req.user) {
    throw new UnauthorizedError('Отсутствуют пользовательские данные')
  }

  const userId = req.user.id;

  const adSpot = await AdSpot.findByPk(id);

  if (!adSpot) {
    throw new NotFoundError('Спот не найден');
  }

  const existingWatch = await WatchedListing.findOne({
    where: { userId, adSpotId: id }
  });

  if (existingWatch) {
    return res.json({ message: 'Спот уже отслеживается' });
  }

  await WatchedListing.create({
    userId,
    adSpotId: id
  });

  await redis.del(`watchlist:${userId}`);

  res.status(201).json({ message: 'Наблюдение за спотом включено' });
});

/**
 * Удалить спот из списка наблюдения
 * @route DELETE /api/adspots/:id/watch
 * @access Private
 */
export const unwatchAdSpot = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Отсутствуют пользовательские данные')
  }

  const userId = req.user.id;

  const watchRecord = await WatchedListing.findOne({
    where: { userId, adSpotId: id }
  });

  if (!watchRecord) {
    throw new NotFoundError('Спот не найден в списке наблюдаемых');
  }

  await watchRecord.destroy();

  await redis.del(`watchlist:${userId}`);

  res.json({ message: 'Спот удалён из списка наблюдения' });
});