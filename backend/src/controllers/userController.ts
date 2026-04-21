import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import type { Attributes } from "sequelize";
import { User, Notification } from "../models/index.js";
import { getRedisClient } from "../config/redis.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { NotFoundError, BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import * as notificationsProvider from '../utils/notifications.js'

const redis = getRedisClient();

/**
 * Получить данные обо всех пользователях
 * @route GET /api/users
 * @access Администратор
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const search = req.query.search;

  const filters: any = {};

  if (search) {
    filters.$or = [
      { name: { $iLike: `%${search}%` } },
      { email: { $iLike: `%${search}%` } },
      { companyName: { $iLike: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await User.findAndCountAll({
    where: filters,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] }
  });

  res.json({
    users: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalUsers: count,
  });
});

/**
 * Получение данных о пользователе
 * @route GET /api/users/:id
 * @access Пользователь/Администратор
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Пользователь не найден');
  }

  if (!req.user) {
    throw new UnauthorizedError('Не найдены пользовательские данные');
  }

  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Недостаточно прав для просмотра');
  }

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  res.json(user);
});

/**
 * Обновление данных пользователя
 * @route PUT /api/users/:id
 * @access Private
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Пользователь не найден');
  }

  if (!req.user) {
    throw new UnauthorizedError('Не найдены пользовательские данные');
  }

  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Недостаточно прав для обновления');
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  const { name, email, password, companyName } = req.body;

  const updateData: Partial<Attributes<typeof user>> = {};

  if (name) {
    updateData.name = name
  };

  if (email) {
    updateData.email = email
  };

  if (companyName) {
    updateData.companyName = companyName
  };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  if (req.body.role && req.user.role === 'admin' && req.user.id !== id) {
    updateData.role = req.body.role;
  }

  await user.update(updateData);

  const updatedUser = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });

  res.json(updatedUser);
});

/**
 * Удаление пользователя
 * @route DELETE /api/users/:id
 * @access Администратор
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Пользователь не найден');
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  await user.destroy();

  res.json({ message: 'Пользователь успешно удалён' });
});

/**
 * Получение уведомлений пользователя
 * @route GET /api/users/:id/notifications
 * @access Пользователь/Администратор
 */
export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Пользователь не найден');
  }

  if (!req.user) {
    throw new UnauthorizedError('Не найдены пользовательские данные');
  }

  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Недостаточно прав для просмотра уведомлений');
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const unreadOnly = req.query.unreadOnly || false;
  const offset = (page - 1) * limit;

  const filters: {
    userId: string,
    read?: boolean
  } = { userId: id };

  if (unreadOnly === 'true') {
    filters.read = false;
  }

  const { rows, count } = await Notification.findAndCountAll({
    where: filters,
    limit: limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: 'AdSpot',
        as: 'adSpot',
        attributes: ['id', 'title'],
        required: false
      }
    ]
  });

  res.json({
    notifications: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalNotifications: count,
  });
});

/**
 * Отметить уведомление как прочитанное
 * @route PUT /api/users/notifications/:id
 * @access Пользователь/Администратор
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Пользователь не найден');
  }

  const notification = await Notification.findByPk(id);

  if (!notification) {
    throw new NotFoundError('Уведомление не найдено');
  }


  if (!req.user) {
    throw new UnauthorizedError('Не найдены пользовательские данные');
  }

  if (req.user.id !== notification.userId && req.user.role !== 'admin') {
    throw new ForbiddenError('Недостаточно прав для обновления статуса уведомления');
  }

  const success = await notificationsProvider.markNotificationAsRead(id);

  if (!success) {
    throw new BadRequestError('Не удалось отметить уведомление как прочитанное');
  }

  res.json({ message: 'Уведомление отмечено как прочитанное' });
});

/**
 * Отметить все уведомления как прочитанные
 * @route PUT /api/users/:id/notifications/read-all
 * @access Пользователь/Администратор
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new NotFoundError('Пользователь не найден');
  }

  if (!req.user) {
    throw new UnauthorizedError('Не найдены пользовательские данные');
  }
  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Недостаточно прав для обновления статуса уведомлений');
  }

  const count = await notificationsProvider.markAllNotificationsAsRead(id);

  res.json({
    message: 'All notifications marked as read',
    count
  });
});