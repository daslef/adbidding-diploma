const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { User } = require('../models');
const { getRedisClient } = require('../config/redis');

const redis = getRedisClient();

/**
 * Authenticate middleware - Verify JWT token and attach user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Not authorized, no token');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_ACCESS_SECRET || 'access_secret_dev_only'
    );
    
    // Check for token in blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Not authorized, token blacklisted');
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Not authorized, token failed'));
    }
    next(error);
  }
};

/**
 * Authorization middleware - Check if user has required role
 * @param {string|string[]} roles - Required role(s)
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authorized, no user'));
    }
    
    // Convert to array if single role
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Not authorized, insufficient permissions'));
    }
    
    next();
  };
};

/**
 * WebSocket authentication middleware
 */
exports.socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new UnauthorizedError('Not authorized, no token'));
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_ACCESS_SECRET || 'access_secret_dev_only'
    );
    
    // Attach user to socket
    socket.userId = decoded.id;
    socket.authenticated = true;
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Not authorized, token failed'));
  }
};