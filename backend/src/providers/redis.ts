import { Redis } from 'ioredis'

const redisUrl = process.env['REDIS_URL']!;

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



