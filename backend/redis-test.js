require('dotenv').config();
const Redis = require('ioredis');

// Get Redis URL from environment or use the default
const redisUrl = process.env.REDIS_URL;

console.log('Testing Redis connection...');
console.log('Redis URL (redacted):', redisUrl.replace(/:\/\/.*?@/, '://***@'));

// Create Redis client
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    console.log(`Retrying connection (attempt ${times})...`);
    return Math.min(times * 500, 5000); // Increasing back-off
  },
  connectTimeout: 10000,
});

// Log connection events
redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('ready', async () => {
  console.log('Redis client ready and operational');
  
  try {
    // Test basic operations
    console.log('\nTesting basic Redis operations:');
    
    // Set a key
    await redis.set('test-key', 'Hello from AdTech Platform!');
    console.log('✓ SET operation successful');
    
    // Get the key
    const value = await redis.get('test-key');
    console.log(`✓ GET operation successful: ${value}`);
    
    // Delete the key
    await redis.del('test-key');
    console.log('✓ DEL operation successful');
    
    // Test server info
    const info = await redis.info();
    console.log('\nRedis Server Info (excerpt):');
    console.log(info.split('\n').slice(0, 10).join('\n'));
    
    console.log('\nAll Redis operations completed successfully!');
  } catch (error) {
    console.error('Error during Redis operations:', error);
  } finally {
    // Close connection
    redis.quit();
    console.log('\nRedis connection closed');
    process.exit(0);
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  process.exit(1);
});