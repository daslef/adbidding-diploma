const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;

console.log('Connecting to Redis at:', redisUrl.replace(/:\/\/.*?@/, '://***@')); 

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
  console.log('Redis client connected successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisSubscriber.on('connect', () => {
  console.log('Redis subscriber connected successfully');
});

redisSubscriber.on('error', (err) => {
  console.error('Redis Subscriber Error:', err);
});


exports.getRedisClient = () => {
  return redisClient;
};


exports.getRedisSubscriber = () => {
  return redisSubscriber;
};


exports.setupRedis = () => {
  console.log('Redis already set up');
  return { redisClient, redisSubscriber };
};

/**
 * Cache middleware
 * @param {string} key - Redis key prefix
 * @param {number} expiry - Cache expiry in seconds
 */
exports.cache = (key, expiry = 300) => {
  return async (req, res, next) => {
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
      res.json = function(data) {
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
 * Clear cache by pattern
 * @param {string} pattern - Redis key pattern to clear
 */
exports.clearCache = async (pattern) => {
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