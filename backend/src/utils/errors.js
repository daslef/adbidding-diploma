/**
 * Base Error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode, details = null) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Bad Request Error (400)
   */
  class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details = null) {
      super(message, 400, details);
    }
  }
  
  /**
   * Unauthorized Error (401)
   */
  class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details = null) {
      super(message, 401, details);
    }
  }
  
  /**
   * Forbidden Error (403)
   */
  class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details = null) {
      super(message, 403, details);
    }
  }
  
  /**
   * Not Found Error (404)
   */
  class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found', details = null) {
      super(message, 404, details);
    }
  }
  
  /**
   * Conflict Error (409)
   */
  class ConflictError extends AppError {
    constructor(message = 'Resource Conflict', details = null) {
      super(message, 409, details);
    }
  }
  
  /**
   * Validation Error (422)
   */
  class ValidationError extends AppError {
    constructor(message = 'Validation Error', details = null) {
      super(message, 422, details);
    }
  }
  
  /**
   * Rate Limit Error (429)
   */
  class RateLimitError extends AppError {
    constructor(message = 'Too Many Requests', details = null) {
      super(message, 429, details);
    }
  }
  
  /**
   * Server Error (500)
   */
  class ServerError extends AppError {
    constructor(message = 'Internal Server Error', details = null) {
      super(message, 500, details);
    }
  }
  
  module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    RateLimitError,
    ServerError
  };