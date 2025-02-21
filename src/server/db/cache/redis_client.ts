import { createClient } from 'redis';

// Define global type for Redis client
declare global {
  var redis: ReturnType<typeof createClient> | undefined;
}

// Check required environment variables
const requiredEnvVars = ['REDIS_USERNAME', 'REDIS_PASSWORD', 'REDIS_HOST', 'REDIS_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined in environment variables`);
  }
}

// Create Redis client if it doesn't exist
if (!global.redis) {
  global.redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
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

