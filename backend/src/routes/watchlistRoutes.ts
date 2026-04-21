import { Router } from "express";
import * as watchlistController from '../controllers/watchlistController.js';
import * as auth from '../middleware/auth.js';

export const watchlistRoutes = Router()

// GET /api/watchlist - Получение всех наблюдаемых спотов для пользователя (требуются права пользователя)
watchlistRoutes.get('/', auth.authenticate, watchlistController.getUserWatchlist);

// GET /api/watchlist/count/:adSpotId - Получение количества пользователей, наблюдающих за спотом
watchlistRoutes.get('/count/:adSpotId', watchlistController.getWatchlistCount);
