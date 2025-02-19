import { Redis } from 'ioredis';

// Prevent multiple Redis instances during development hot reloading
const globalForRedis = global as unknown as {
  redis: Redis | undefined;
};

// Get Redis URL from environment variables with fallback
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client with error handling
export const redis = globalForRedis.redis || 
  new Redis(REDIS_URL, {
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
    lazyConnect: true, // Only connect when needed
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('close', () => {
  console.warn('Redis connection closed');
});


