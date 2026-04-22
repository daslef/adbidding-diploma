import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { adSpotRoutes } from './adSpotRoutes.js';
import { bidRoutes } from "./bidRoutes.js";
import { userRoutes } from "./userRoutes.js";
import {watchlistRoutes } from './watchlistRoutes.js'

const router = Router();

// подключение обработчиков
router.use('/auth', authRoutes);
router.use('/adspots', adSpotRoutes);
router.use('/bids', bidRoutes);
router.use('/users', userRoutes);
router.use('/watchlist', watchlistRoutes);

export default router