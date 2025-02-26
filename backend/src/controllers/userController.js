const bcrypt = require('bcryptjs');
const { User, Notification } = require('../models');
const { getRedisClient } = require('../config/redis');
const { asyncHandler } = require('../middleware/asyncHandler');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const { markNotificationAsRead, markAllNotificationsAsRead } = require('../utils/notifications');

const redis = getRedisClient();

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  
  // Build query filters
  const filters = {};
  
  if (search) {
    filters.$or = [
      { name: { $iLike: `%${search}%` } },
      { email: { $iLike: `%${search}%` } },
      { companyName: { $iLike: `%${search}%` } }
    ];
  }
  
  // Execute query with pagination
  const offset = (page - 1) * limit;
  const { rows, count } = await User.findAndCountAll({
    where: filters,
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] }
  });
  
  res.json({
    users: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalUsers: count,
  });
});

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check authorization (user can only access their own profile unless admin)
  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to access this user profile');
  }
  
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json(user);
});

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check authorization
  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to update this user');
  }
  
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  const { name, email, password, companyName } = req.body;
  
  // Prepare update data
  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (companyName) updateData.companyName = companyName;
  
  // Hash password if provided
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }
  
  // Update role if admin (admins can only update other users' roles)
  if (req.body.role && req.user.role === 'admin' && req.user.id !== id) {
    updateData.role = req.body.role;
  }
  
  // Update user
  await user.update(updateData);
  
  // Return updated user without password
  const updatedUser = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  
  res.json(updatedUser);
});

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Admin can't delete themselves
  if (req.user.id === id) {
    throw new BadRequestError('Cannot delete your own account');
  }
  
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  await user.destroy();
  
  res.json({ message: 'User deleted successfully' });
});

/**
 * Get user notifications
 * @route GET /api/users/:id/notifications
 * @access Private
 */
exports.getUserNotifications = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check authorization
  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to access these notifications');
  }
  
  // Pagination
  const { page = 1, limit = 10, unreadOnly = false } = req.query;
  const offset = (page - 1) * limit;
  
  // Build query filters
  const filters = { userId: id };
  
  if (unreadOnly === 'true') {
    filters.read = false;
  }
  
  // Get notifications
  const { rows, count } = await Notification.findAndCountAll({
    where: filters,
    limit: parseInt(limit),
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
    currentPage: parseInt(page),
    totalNotifications: count,
  });
});

/**
 * Mark notification as read
 * @route PUT /api/users/notifications/:id
 * @access Private
 */
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const notification = await Notification.findByPk(id);
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  
  // Check authorization
  if (req.user.id !== notification.userId && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to update this notification');
  }
  
  // Mark as read
  const success = await markNotificationAsRead(id);
  
  if (!success) {
    throw new BadRequestError('Failed to mark notification as read');
  }
  
  res.json({ message: 'Notification marked as read' });
});

/**
 * Mark all notifications as read
 * @route PUT /api/users/:id/notifications/read-all
 * @access Private
 */
exports.markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check authorization
  if (req.user.id !== id && req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to update these notifications');
  }
  
  // Mark all as read
  const count = await markAllNotificationsAsRead(id);
  
  res.json({ 
    message: 'All notifications marked as read',
    count
  });
});