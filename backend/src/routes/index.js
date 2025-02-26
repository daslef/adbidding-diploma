const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const adSpotRoutes = require('./adSpotRoutes');
const bidRoutes = require('./bidRoutes');
const userRoutes = require('./userRoutes');
const watchlistRoutes = require('./watchlistRoutes');

// Use route modules
router.use('/auth', authRoutes);
router.use('/adspots', adSpotRoutes);
router.use('/bids', bidRoutes);
router.use('/users', userRoutes);
router.use('/watchlist', watchlistRoutes);

module.exports = router;