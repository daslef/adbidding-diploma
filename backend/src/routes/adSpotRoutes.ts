import { Router } from "express";

import * as adSpotController from '../controllers/adSpotController.js'
import * as bidController from '../controllers/bidController.js';
import * as auth from '../middleware/auth.js'

export const adSpotRoutes = Router();

// GET /api/adspots - Все споты с фильтрацией и пагинацией
adSpotRoutes.get('/', adSpotController.getAllAdSpots);

// GET /api/adspots/:id - Получение данных о споте
adSpotRoutes.get('/:id', adSpotController.getAdSpotById);

// POST /api/adspots - Создание нового спота (требуются права администратора)
adSpotRoutes.post('/', auth.authenticate, auth.authorize('admin'), adSpotController.createAdSpot);

// PUT /api/adspots/:id - Обновление спота (требуются права администратора)
adSpotRoutes.put('/:id', auth.authenticate, auth.authorize('admin'), adSpotController.updateAdSpot);

// DELETE /api/adspots/:id - Удаление спота права администратора)
adSpotRoutes.delete('/:id', auth.authenticate, auth.authorize('admin'), adSpotController.deleteAdSpot);

// GET /api/adspots/:id/bids - Получение всех ставок по споту
adSpotRoutes.get('/:id/bids', bidController.getBidsForAdSpot);

// POST /api/adspots/:id/bids - Сделать ставку (требуются права пользователя)
adSpotRoutes.post('/:id/bids', auth.authenticate, bidController.placeBid);

// POST /api/adspots/:id/watch - Начать отслеживать спот (требуются права пользователя)
adSpotRoutes.post('/:id/watch', auth.authenticate, adSpotController.watchAdSpot);

// DELETE /api/adspots/:id/watch - Перестать отслеживать спот (требуются права пользователя)
adSpotRoutes.delete('/:id/watch', auth.authenticate, adSpotController.unwatchAdSpot);