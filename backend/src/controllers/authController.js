const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getRedisClient } = require('../config/redis');
const { asyncHandler } = require('../middleware/asyncHandler');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { logger } = require('../utils/logger');

const redis = getRedisClient();

/**
 * Register a new user
 * @route POST /api/register
 * @access Public
 */
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, companyName } = req.body;
  
  logger.info(`Attempting to register user: ${email}`);
  
  // Input validation
  if (!name || !email || !password || !companyName) {
    throw new BadRequestError('Please provide all required fields');
  }
  
  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  
  if (userExists) {
    throw new BadRequestError('User already exists with this email');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    companyName,
    role: 'user' // Default role
  });
  
  logger.info(`User registered successfully: ${user.id}`);
  
  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  // Store refresh token in Redis
  await redis.set(`refreshToken:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days
  
  // Send response
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
 * Login user
 * @route POST /api/login
 * @access Public
 */
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  logger.info(`Login attempt for user: ${email}`);
  
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  const user = await User.scope('withPassword').findOne({ where: { email } });
  
  if (!user) {
    logger.warn(`Login failed: User not found for email ${email}`);
    throw new UnauthorizedError('Invalid credentials');
  }
  
  logger.info(`Login attempt - User found, password from DB: ${user.password ? 'exists' : 'missing'}`);
  
  if (!user.password) {
    logger.error(`User ${user.id} has no password stored`);
    throw new UnauthorizedError('Account error. Please contact support.');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    logger.warn(`Login failed: Incorrect password for user ${user.id}`);
    throw new UnauthorizedError('Invalid credentials');
  }
  
  await user.update({ lastLogin: new Date() });
  
  logger.info(`User logged in successfully: ${user.id}`);
  
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
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json(user);
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
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
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logoutUser = asyncHandler(async (req, res) => {
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