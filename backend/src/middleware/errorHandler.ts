import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';


/**
 * Промежуточная функция для обработки ошибок
 */
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.url}: ${err.message}`, { error: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  const errorMapping = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'TOO_MANY_REQUESTS',
    500: 'SERVER_ERROR'
  } as const;

  const errorType = errorMapping[statusCode] ?? 500

  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      ...(errorType === 'VALIDATION_ERROR' || process.env.NODE_ENV === 'development'
        ? { details: err.details }
        : {})
    }
  });
};