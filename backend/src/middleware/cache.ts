import type { NextFunction, Request, Response } from 'express';
import { getRedisClient } from '../providers/redis.js';

/**
 * Кеширование на базе Redis
 * @param {string} key - Redis key prefix
 * @param {number} expiry - Cache expiry in seconds
 */
export const cache = (key: string, expiry: number = 300) => {
    const redisClient = getRedisClient()

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