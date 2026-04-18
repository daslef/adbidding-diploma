import type { Request, Response, NextFunction } from "express";
import type { Socket } from "socket.io";
import jwt from 'jsonwebtoken'

import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { User } from '../models/index.js'
import { getRedisClient } from "../config/redis.js";


const redis = getRedisClient();

/**
 * Перехватчик аутентификации - проверка JWT-токена и дополнение запроса пользовательскими данными
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Токен не обнаружен');
    }

    const token = authHeader.split(' ')[1] as string;

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret_dev_only'
    );

    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Токен забанен');
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new UnauthorizedError('Пользователь не найден');
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error: unknown) {
    if ((error as Error).name === 'JsonWebTokenError' || (error as Error).name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Ошибка авторизации по токену'));
    }
    next(error);
  }
};

/**
 * Перехватчик авторизации - Проверка на соответствие требуемой роли
 * @param {string|string[]} roles - требуемая(ые) роль(роли)
 */
export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Нет пользовательских данных'));
    }

    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Недостаточно прав'));
    }

    next();
  };
};

/**
 * Перехватчик аутентификации протокола WebSocket
 */
export const socketAuth = (socket: Socket, next: NextFunction) => {
  type SocketWithAuth = Socket & {
    userId: string;
    authenticated: boolean;
  }

  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new UnauthorizedError('Отсутствует токен'));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret_dev_only'
    );

    (socket as SocketWithAuth).userId = decoded.id;
    (socket as SocketWithAuth).authenticated = true;

    next();
  } catch (error) {
    next(new UnauthorizedError('Ошибка авторизации по токену'));
  }
};