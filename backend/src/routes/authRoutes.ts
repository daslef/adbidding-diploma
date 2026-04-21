import { Router } from "express";
import * as authController from '../controllers/authController.js';
import * as auth from '../middleware/auth.js';

export const authRoutes = Router();

// POST /api/register - Регистрация
authRoutes.post('/register', authController.registerUser);

// POST /api/login - Логин
authRoutes.post('/login', authController.loginUser);

// GET /api/auth/me - Информация о текущем пользователе (требуются права пользователя)
authRoutes.get('/me', auth.authenticate, authController.getMe);

// POST /api/auth/refresh - Обновление токена
authRoutes.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Выход
authRoutes.post('/logout', auth.authenticate, authController.logoutUser);
