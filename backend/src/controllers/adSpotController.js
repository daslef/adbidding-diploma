const { AdSpot, AdSpotEvent, AdSpotTheme, WatchedListing } = require('../models');
const { getRedisClient } = require('../config/redis');
const { asyncHandler } = require('../middleware/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const redis = getRedisClient();

/**
 * Get all ad spots with pagination and filtering
 * @route GET /api/adspots
 * @access Public
 */
exports.getAllAdSpots = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search, status, minPrice, maxPrice } = req.query;
  
  const cacheKey = `adspots:list:${page}:${limit}:${search || ''}:${status || ''}:${minPrice || ''}:${maxPrice || ''}`;
  const cachedData = await redis.get(cacheKey);
  
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }
  
  const filters = {};
  
  if (status) filters.status = status;
  if (minPrice) filters.currentPrice = { $gte: parseFloat(minPrice) };
  if (maxPrice) filters.currentPrice = { ...filters.currentPrice, $lte: parseFloat(maxPrice) };
  if (search) {
    filters.$or = [
      { title: { $iLike: `%${search}%` } },
      { description: { $iLike: `%${search}%` } }
    ];
  }
  
  const offset = (page - 1) * limit;
  const { rows, count } = await AdSpot.findAndCountAll({
    where: filters,
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
    include: ['events', 'theme']
  });
  
  const result = {
    adSpots: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalAdSpots: count,
  };
  
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
  
  res.json(result);
});

/**
 * Get a single ad spot by ID
 * @route GET /api/adspots/:id
 * @access Public
 */
exports.getAdSpotById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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
    throw new NotFoundError('Ad spot not found');
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
 * Create a new ad spot
 * @route POST /api/adspots
 * @access Private/Admin
 */
exports.createAdSpot = asyncHandler(async (req, res) => {
  const { 
    title, description, startingPrice, reservePrice, 
    endDate, imageUrl, location, dimensions, 
    eventCount, estimatedViews, seasonDuration, events,
    theme
  } = req.body;
  
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
 * Update an ad spot
 * @route PUT /api/adspots/:id
 * @access Private/Admin
 */
exports.updateAdSpot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const adSpot = await AdSpot.findByPk(id);
  
  if (!adSpot) {
    throw new NotFoundError('Ad spot not found');
  }
  
  const updatedFields = req.body;
  
  delete updatedFields.currentPrice;
  delete updatedFields.totalBids;
  delete updatedFields.ownerId;
  
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
 * Delete an ad spot
 * @route DELETE /api/adspots/:id
 * @access Private/Admin
 */
exports.deleteAdSpot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const adSpot = await AdSpot.findByPk(id);
  
  if (!adSpot) {
    throw new NotFoundError('Ad spot not found');
  }
  
  await adSpot.destroy();
  
  // Invalidate cache
  await redis.del(`adspot:${id}`);
  await redis.del('adspots:list:*');
  
  res.json({ message: 'Ad spot deleted successfully' });
});

/**
 * Watch an ad spot
 * @route POST /api/adspots/:id/watch
 * @access Private
 */
exports.watchAdSpot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const adSpot = await AdSpot.findByPk(id);
  
  if (!adSpot) {
    throw new NotFoundError('Ad spot not found');
  }
  
  const existingWatch = await WatchedListing.findOne({
    where: { userId, adSpotId: id }
  });
  
  if (existingWatch) {
    return res.json({ message: 'Already watching this ad spot' });
  }
  
  await WatchedListing.create({
    userId,
    adSpotId: id
  });
  
  // Update cache
  await redis.del(`watchlist:${userId}`);
  
  res.status(201).json({ message: 'Ad spot added to watchlist' });
});

/**
 * Unwatch an ad spot
 * @route DELETE /api/adspots/:id/watch
 * @access Private
 */
exports.unwatchAdSpot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const watchRecord = await WatchedListing.findOne({
    where: { userId, adSpotId: id }
  });
  
  if (!watchRecord) {
    throw new NotFoundError('Watch record not found');
  }
  
  await watchRecord.destroy();
  
  await redis.del(`watchlist:${userId}`);
  
  res.json({ message: 'Ad spot removed from watchlist' });
});