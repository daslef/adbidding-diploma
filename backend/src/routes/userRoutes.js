const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getUserNotifications,
  markNotificationAsRead
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users - Get all users (protected, admin only)
router.get('/', authenticate, authorize('admin'), getAllUsers);

// GET /api/users/:id - Get a specific user (protected)
router.get('/:id', authenticate, getUserById);

// PUT /api/users/:id - Update a user (protected)
router.put('/:id', authenticate, updateUser);

// DELETE /api/users/:id - Delete a user (protected, admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// GET /api/users/:id/notifications - Get all notifications for a user (protected)
router.get('/:id/notifications', authenticate, getUserNotifications);

// PUT /api/users/notifications/:id - Mark a notification as read (protected)
router.put('/notifications/:id', authenticate, markNotificationAsRead);

module.exports = router;