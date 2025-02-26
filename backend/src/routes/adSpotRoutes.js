const express = require('express');
const router = express.Router();
const { 
  getAllAdSpots, 
  getAdSpotById, 
  createAdSpot, 
  updateAdSpot, 
  deleteAdSpot,
  watchAdSpot,
  unwatchAdSpot
} = require('../controllers/adSpotController');
const { getBidsForAdSpot, placeBid } = require('../controllers/bidController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/adspots - Get all ad spots with filtering and pagination
router.get('/', getAllAdSpots);

// GET /api/adspots/:id - Get a specific ad spot
router.get('/:id', getAdSpotById);

// POST /api/adspots - Create a new ad spot (protected, admin only)
router.post('/', authenticate, authorize('admin'), createAdSpot);

// PUT /api/adspots/:id - Update an ad spot (protected, admin only)
router.put('/:id', authenticate, authorize('admin'), updateAdSpot);

// DELETE /api/adspots/:id - Delete an ad spot (protected, admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteAdSpot);

// GET /api/adspots/:id/bids - Get all bids for an ad spot
router.get('/:id/bids', getBidsForAdSpot);

// POST /api/adspots/:id/bids - Place a bid on an ad spot (protected)
router.post('/:id/bids', authenticate, placeBid);

// POST /api/adspots/:id/watch - Watch an ad spot (protected)
router.post('/:id/watch', authenticate, watchAdSpot);

// DELETE /api/adspots/:id/watch - Unwatch an ad spot (protected)
router.delete('/:id/watch', authenticate, unwatchAdSpot);

module.exports = router;