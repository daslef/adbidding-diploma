const express = require('express');
const router = express.Router();
const { 
  getUserWatchlist,
  getWatchlistCount
} = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');

// GET /api/watchlist - Get all watched ad spots for current user (protected)
router.get('/', authenticate, getUserWatchlist);

// GET /api/watchlist/count/:adSpotId - Get watch count for an ad spot
router.get('/count/:adSpotId', getWatchlistCount);

module.exports = router;