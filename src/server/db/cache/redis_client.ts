import { createClient } from 'redis';

// Define global type for Redis client
declare global {
  var redis: ReturnType<typeof createClient> | undefined;
}

// Check required environment variable
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

// Create Redis client if it doesn't exist
if (!global.redis) {
  global.redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 20) {
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  // Handle Redis events
  global.redis.on('connect', () => {
    console.log('Redis client connected');
  });

  global.redis.on('error', (error) => {
    console.error('Redis client error:', error);
  });

  global.redis.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
  });

  // Connect to Redis
  global.redis.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    global.redis?.quit().catch(console.error);
  });

  process.on('SIGINT', () => {
    global.redis?.quit().catch(console.error);
  });
}

// Export the singleton Redis client
export const redis = global.redis;

// Add the missing functions that cache.service.ts is trying to import
export const getRedisClient = () => {
  return global.redis;
};

export const isRedisConnected = () => {
  return global.redis?.isReady || false;
};
