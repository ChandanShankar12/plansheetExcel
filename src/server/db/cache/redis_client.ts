import { createClient } from 'redis';
import { config } from '@/config/env.config';

// Define global type for Redis client
declare global {
  var redis: ReturnType<typeof createClient> | undefined;
}

// Create Redis client if it doesn't exist
if (!global.redis) {
  try {
    global.redis = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            console.error('[Redis] Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          const delay = Math.min(retries * 100, 3000);
          console.log(`[Redis] Reconnecting in ${delay}ms...`);
          return delay;
        }
      }
    });

    // Handle Redis events
    global.redis.on('connect', () => {
      console.log('[Redis] Client connected successfully');
    });

    global.redis.on('error', (error) => {
      console.error('[Redis] Client error:', error);
    });

    global.redis.on('reconnecting', () => {
      console.log('[Redis] Client reconnecting...');
    });

    // Connect to Redis
    global.redis.connect().catch((err) => {
      console.error('[Redis] Failed to connect:', err);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Redis] Shutting down gracefully...');
      global.redis?.quit().catch(console.error);
    });

    process.on('SIGINT', () => {
      console.log('[Redis] Shutting down gracefully...');
      global.redis?.quit().catch(console.error);
    });

  } catch (error) {
    console.error('[Redis] Failed to create client:', error);
    if (config.isDev) {
      console.warn('[Redis] Using mock client in development');
      global.redis = createMockRedisClient();
    } else {
      throw error;
    }
  }
}

function createMockRedisClient() {
  const storage = new Map<string, string>();
  return {
    connect: async () => {},
    quit: async () => {},
    on: () => {},
    set: async (key: string, value: string) => {
      storage.set(key, value);
      return 'OK';
    },
    get: async (key: string) => storage.get(key) || null,
    del: async (key: string) => {
      storage.delete(key);
      return 1;
    },
    keys: async (pattern: string) => Array.from(storage.keys())
  } as unknown as ReturnType<typeof createClient>;
}

// Export the singleton Redis client
export const redis = global.redis;

