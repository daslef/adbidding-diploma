import type { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis'

const redisUrl = process.env.REDIS_URL!;
console.log('Подключение к Redis:', redisUrl!.replace(/:\/\/.*?@/, '://***@'));

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    return Math.min(times * 100, 3000);
  },
  connectTimeout: 10000,
  lazyConnect: false
});

const redisSubscriber = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    return Math.min(times * 100, 3000);
  },
  connectTimeout: 10000,
  lazyConnect: false
});

redisClient.on('connect', () => {
  console.log('Клиент Redis подключился');
});

redisClient.on('error', (err) => {
  console.error('Ошибка клиента Redis:', err);
});

redisSubscriber.on('connect', () => {
  console.log('Подписчик Redis подключился');
});

redisSubscriber.on('error', (err) => {
  console.error('Ошибка подписчика Redis:', err);
});

export const getRedisClient = () => redisClient;

export const getRedisSubscriber = () => redisSubscriber;

export const setupRedis = () => ({ redisClient, redisSubscriber })


/**
 * Cache middleware
 * @param {string} key - Redis key prefix
 * @param {number} expiry - Cache expiry in seconds
 */
export const cache = (key: string, expiry: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method !== 'GET') {
        return next();
      }

      const queryString = JSON.stringify(req.query || {});
      const paramString = JSON.stringify(req.params || {});
      const cacheKey = `${key}:${req.originalUrl}:${queryString}:${paramString}`;

      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = function (data) {
        redisClient.set(cacheKey, JSON.stringify(data), 'EX', expiry);

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Очистка кеша по шаблону
 * @param {string} pattern - Шаблон Redis-ключей для очистки
 */
export const clearCache = async (pattern: string) => {
  try {
    if (!pattern) return;

    let cursor = '0';
    do {
      const reply = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply[0];
      const keys = reply[1];

      if (keys.length) {
        await redisClient.del(...keys);
        console.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
    } while (cursor !== '0');
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};