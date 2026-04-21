import { Router } from "express";
import * as userController from '../controllers/userController.js';
import * as auth from '../middleware/auth.js';

export const userRoutes = Router();

// GET /api/users - Получить данные обо всех пользователях (требуются права администратора)
userRoutes.get('/', auth.authenticate, auth.authorize('admin'), userController.getAllUsers);

// GET /api/users/:id - Получить данные о пользователе (требуются права пользователя)
userRoutes.get('/:id', auth.authenticate, userController.getUserById);

// PUT /api/users/:id - Обновить данные пользователя (требуются права пользователя)
userRoutes.put('/:id', auth.authenticate, userController.updateUser);

// DELETE /api/users/:id - Удалить пользователя (требуются права администратора)
userRoutes.delete('/:id', auth.authenticate, auth.authorize('admin'), userController.deleteUser);

// GET /api/users/:id/notifications - Получить все уведомления пользователя (требуются права пользователя)
userRoutes.get('/:id/notifications', auth.authenticate, userController.getUserNotifications);

// PUT /api/users/notifications/:id - Отметить уведомление как прочитанное (требуются права пользователя)
userRoutes.put('/notifications/:id', auth.authenticate, userController.markNotificationAsRead);
