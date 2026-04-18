import { Router } from "express";
import * as bidController from '../controllers/bidController.js';
import * as auth from '../middleware/auth.js';

export const bidRoutes = Router();

// GET /api/bids/:id - Получение информации о ставке
bidRoutes.get('/:id', bidController.getBidById);

// GET /api/bids/user/:userId - Получение всех ставок пользователя (требуются права пользователя)
bidRoutes.get('/user/:userId', auth.authenticate, bidController.getUserBids);

// GET /api/bids/highest - Получение наивысших ставок по всем спотам
bidRoutes.get('/highest', bidController.getHighestBids);

// PUT /api/bids/:id - Обновление ставки (требуются права администратора)
bidRoutes.put('/:id', auth.authenticate, auth.authorize('admin'), bidController.updateBid);

// DELETE /api/bids/:id - Удаление ставки (требуются права администратора)
bidRoutes.delete('/:id', auth.authenticate, auth.authorize('admin'), bidController.deleteBid);
