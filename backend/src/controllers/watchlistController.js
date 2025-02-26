const { WatchedListing, AdSpot, User } = require('../models');
const { getRedisClient } = require('../config/redis');
const { asyncHandler } = require('../middleware/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const redis = getRedisClient();

/**
 * Get user's watchlist
 * @route GET /api/watchlist
 * @access Private
 */
exports.getUserWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Try to get from cache first
  const cacheKey = `watchlist:${userId}`;
  const cachedWatchlist = await redis.get(cacheKey);
  
  if (cachedWatchlist) {
    return res.json(JSON.parse(cachedWatchlist));
  }
  
  // Get from database with associated ad spots
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
  
  // Format the response
  const formattedWatchlist = watchlist.map(item => ({
    id: item.id,
    adSpotId: item.adSpotId,
    addedAt: item.createdAt,
    adSpot: item.AdSpot
  }));
  
  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(formattedWatchlist), 'EX', 300);
  
  res.json(formattedWatchlist);
});

/**
 * Get watch count for an ad spot
 * @route GET /api/watchlist/count/:adSpotId
 * @access Public
 */
exports.getWatchlistCount = asyncHandler(async (req, res) => {
  const { adSpotId } = req.params;
  
  // Try to get from cache first
  const cacheKey = `watchlist:count:${adSpotId}`;
  const cachedCount = await redis.get(cacheKey);
  
  if (cachedCount) {
    return res.json({ count: parseInt(cachedCount) });
  }
  
  // Check if ad spot exists
  const adSpot = await AdSpot.findByPk(adSpotId);
  
  if (!adSpot) {
    throw new NotFoundError('Ad spot not found');
  }
  
  // Count watchers
  const count = await WatchedListing.count({
    where: { adSpotId }
  });
  
  // Cache for 10 minutes
  await redis.set(cacheKey, count.toString(), 'EX', 600);
  
  res.json({ count });
});

/**
 * Get users watching an ad spot (admin only)
 * @route GET /api/watchlist/users/:adSpotId
 * @access Private/Admin
 */
exports.getWatchingUsers = asyncHandler(async (req, res) => {
  const { adSpotId } = req.params;
  
  // Check if ad spot exists
  const adSpot = await AdSpot.findByPk(adSpotId);
  
  if (!adSpot) {
    throw new NotFoundError('Ad spot not found');
  }
  
  // Get watchers with user info
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