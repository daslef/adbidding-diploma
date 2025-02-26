const express = require('express');
const router = express.Router();
const { 
  getBidById, 
  getUserBids, 
  getHighestBids,
  updateBid, 
  deleteBid 
} = require('../controllers/bidController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/bids/:id - Get a specific bid
router.get('/:id', getBidById);

// GET /api/bids/user/:userId - Get all bids for a user (protected)
router.get('/user/:userId', authenticate, getUserBids);

// GET /api/bids/highest - Get highest bids across all ad spots
router.get('/highest', getHighestBids);

// PUT /api/bids/:id - Update a bid (protected, admin only)
router.put('/:id', authenticate, authorize('admin'), updateBid);

// DELETE /api/bids/:id - Delete a bid (protected, admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteBid);

module.exports = router;