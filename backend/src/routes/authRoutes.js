const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, refreshToken, logoutUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/register - Register a new user
router.post('/register', registerUser);

// POST /api/login - Login user
router.post('/login', loginUser);

// GET /api/auth/me - Get current user (protected)
router.get('/me', authenticate, getMe);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, logoutUser);

module.exports = router;