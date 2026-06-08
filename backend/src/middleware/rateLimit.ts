import rateLimit from "express-rate-limit";

/**
 * Ограничение количества запросов,
 * 100 запросов с одного IP за 15 минут
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
