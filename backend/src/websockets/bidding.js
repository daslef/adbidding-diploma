const { AdSpot, Bid, User } = require('../models');
const { getRedisClient } = require('../config/redis');
const { logger } = require('../utils/logger');
const { createNotification } = require('../utils/notifications');

const redis = getRedisClient();

/**
 * Handle bid placement via WebSocket
 */
exports.handleBidding = (io, socket) => {
  return async (data) => {
    try {
      const { adSpotId, amount } = data;
      const userId = socket.userId;
      
      // Validate required fields
      if (!adSpotId || !amount) {
        return socket.emit('bid-error', {
          message: 'Missing required fields'
        });
      }
      
      // Rate limiting check
      const rateLimitKey = `ratelimit:bid:${userId}`;
      const currentCount = await redis.incr(rateLimitKey);
      
      // First bid sets the expiry
      if (currentCount === 1) {
        await redis.expire(rateLimitKey, 60); // 60 seconds
      }
      
      if (currentCount > 5) {
        return socket.emit('bid-error', {
          message: 'You are bidding too frequently. Please wait a minute.'
        });
      }
      
      // Get ad spot
      const adSpot = await AdSpot.findByPk(adSpotId);
      
      if (!adSpot) {
        return socket.emit('bid-error', {
          message: 'Ad spot not found'
        });
      }
      
      if (adSpot.status !== 'active') {
        return socket.emit('bid-error', {
          message: 'This auction has ended'
        });
      }
      
      if (new Date(adSpot.endDate) < new Date()) {
        // Update status to ended
        await adSpot.update({ status: 'ended' });
        
        // Broadcast auction end to all clients in the room
        io.to(`bidding:${adSpotId}`).emit('auction-ended', {
          adSpotId,
          message: 'This auction has ended'
        });
        
        return socket.emit('bid-error', {
          message: 'This auction has ended'
        });
      }
      
      // Check if bid amount is valid
      if (amount <= adSpot.currentPrice) {
        return socket.emit('bid-error', {
          message: `Bid must be higher than current price: $${adSpot.currentPrice}`
        });
      }
      
      // Get user for company name
      const user = await User.findByPk(userId);
      
      if (!user) {
        return socket.emit('bid-error', {
          message: 'User not found'
        });
      }
      
      // Create the bid
      const bid = await Bid.create({
        adSpotId,
        userId,
        amount,
        isHighestBid: true,
      });
      
      // Update previous highest bid
      await Bid.update(
        { isHighestBid: false },
        { where: { adSpotId, isHighestBid: true, id: { $ne: bid.id } } }
      );
      
      // Update ad spot price and bid count
      await adSpot.update({
        currentPrice: amount,
        totalBids: adSpot.totalBids + 1,
      });
      
      // Find previous highest bidder to notify them
      const previousHighestBid = await Bid.findOne({
        where: { adSpotId, isHighestBid: false },
        order: [['amount', 'DESC']],
        limit: 1,
        include: [{ model: User }]
      });
      
      if (previousHighestBid && previousHighestBid.userId !== userId) {
        // Create outbid notification
        await createNotification({
          userId: previousHighestBid.userId,
          message: `You've been outbid on "${adSpot.title}" by ${user.companyName}`,
          type: 'outbid',
          relatedAdSpotId: adSpotId
        });
      }
      
      // Clear and update caches
      await redis.del(`adspot:${adSpotId}`);
      await redis.lpush(`bids:${adSpotId}`, JSON.stringify({
        id: bid.id,
        amount: bid.amount,
        userId: bid.userId,
        companyName: user.companyName,
        createdAt: bid.createdAt,
        isHighestBid: true
      }));
      await redis.ltrim(`bids:${adSpotId}`, 0, 19); // Keep only 20 most recent
      await redis.set(`highestbid:${adSpotId}`, JSON.stringify(bid));
      await redis.del('bids:highest');
      
      // Prepare data for broadcast
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
      
      // Publish to Redis for broadcast to all connected servers
      await redis.publish('bid-updates', JSON.stringify(bidData));
      
      // Send success message to bidder
      socket.emit('bid-success', bidData);
      
      logger.info(`User ${userId} placed bid of ${amount} on ad spot ${adSpotId}`);
    } catch (error) {
      logger.error(`Error handling bid: ${error.message}`, { error: error.stack });
      
      socket.emit('bid-error', {
        message: 'An error occurred while processing your bid'
      });
    }
  };
};