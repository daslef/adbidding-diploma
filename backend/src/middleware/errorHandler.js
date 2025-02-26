const { logger } = require('../utils/logger');

/**
 * Error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  // Log full error details for server (don't expose to client)
  logger.error(`${req.method} ${req.url}: ${err.message}`, { error: err.stack });
  
  // Get error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Determine error type
  let errorType = 'SERVER_ERROR';
  
  switch (statusCode) {
    case 400:
      errorType = 'BAD_REQUEST';
      break;
    case 401:
      errorType = 'UNAUTHORIZED';
      break;
    case 403:
      errorType = 'FORBIDDEN';
      break;
    case 404:
      errorType = 'NOT_FOUND';
      break;
    case 409:
      errorType = 'CONFLICT';
      break;
    case 422:
      errorType = 'VALIDATION_ERROR';
      break;
    case 429:
      errorType = 'TOO_MANY_REQUESTS';
      break;
    default:
      if (statusCode >= 500) {
        errorType = 'SERVER_ERROR';
      }
  }
  
  // Response for the client
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      // Only include validation errors in development or for validation errors
      ...(errorType === 'VALIDATION_ERROR' || process.env.NODE_ENV === 'development' 
        ? { details: err.details } 
        : {})
    }
  });
};