import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

import { User } from '../models/index.js'
import { getRedisClient } from '../providers/redis.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors.js'
import { logger } from '../utils/logger.js';

const redis = getRedisClient();

/**
 * Регистрация
 * @route POST /api/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, companyName } = req.body;

  logger.info(`Попытка регистрации пользователя: ${email}`);

  if (!name || !email || !password || !companyName) {
    throw new BadRequestError('Отсутствует часть данных');
  }

  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    throw new BadRequestError('Пользователь с этой почтой уже существует');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    companyName,
    role: 'user'
  });

  logger.info(`Пользователь успешно зарегистрирован: ${user.id}`);

  // генерация токенов, сохранение рефреш-токена в Redis
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await redis.set(`refreshToken:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      role: user.role
    },
    token: accessToken,
    refreshToken
  });
});

/**
 * Логин
 * @route POST /api/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info(`Попытка логина для пользователя: ${email}`);

  if (!email || !password) {
    throw new BadRequestError('Задайте почту и пароль');
  }

  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user) {
    logger.warn(`Ошибка логина: Пользователь с почтой ${email} не найден`);
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    logger.warn(`Ошибка логина: некорректный пароль для пользователя ${user.id}`);
    throw new UnauthorizedError('Неверные данные');
  }

  await user.update({ lastLogin: new Date() });

  logger.info(`Пользователь успешно вошел: ${user.id}`);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await redis.set(`refreshToken:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      role: user.role
    },
    token: accessToken,
    refreshToken
  });
});

/**
 * Получение информации о текущем пользователе
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json(user);
});

/**
 * Обновление токена
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev_only');

    const storedToken = await redis.get(`refreshToken:${decoded.id}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const accessToken = generateAccessToken(decoded.id);

    res.json({ token: accessToken });
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
});

/**
 * Выход
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await redis.del(`refreshToken:${req.user.id}`);

  res.json({ message: 'Logged out successfully' });
});

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET || 'access_secret_dev_only',
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev_only',
    { expiresIn: '7d' }
  );
};