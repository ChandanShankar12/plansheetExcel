import { createClient } from 'redis';

/**
 * Redis Client Singleton
 * Manages a single instance of Redis client throughout the application
 */
class RedisClientSingleton {
  private static instance: ReturnType<typeof createClient> | null = null;
  private static isConnected: boolean = false;
  private static isConnecting: boolean = false;

  /**
   * Get the Redis client instance
   * Creates a new instance if one doesn't exist
   */
  public static getClient(): ReturnType<typeof createClient> | null {
    if (!this.instance && !this.isConnecting) {
      this.initialize();
    }
    return this.instance;
  }

  /**
   * Check if Redis is connected
   */
  public static isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Initialize the Redis client
   * Reads configuration from environment variables
   */
  private static initialize(): void {
    try {
      this.isConnecting = true;
      console.log('[Redis] Creating client...');
      
      // Read Redis configuration from environment variables
      const host = process.env.REDIS_HOST || 'redis-14882.c80.us-east-1-2.ec2.redns.redis-cloud.com';
      const port = parseInt(process.env.REDIS_PORT || '14882');
      const username = process.env.REDIS_USERNAME || 'default';
      const password = process.env.REDIS_PASSWORD || 'OzY2aSx25plG8Qwxaq3nIqnK0C1AlNBF';
      
      console.log(`[Redis] Connecting to ${host}:${port} with username: ${username}`);

      this.instance = createClient({
        username,
        password,
        socket: {
          host,
          port,
          reconnectStrategy: (retries) => {
            console.log(`[Redis] Reconnection attempt ${retries + 1}`);
            return Math.min(retries * 500, 5000);
          },
        },
      });

      // Set up event handlers with detailed logging
      this.instance.on('connect', () => {
        console.log('[Redis] Connected successfully');
        this.isConnected = true;
      });

      this.instance.on('error', (err) => {
        console.error('[Redis] Error:', err);
        this.isConnected = false;
      });

      this.instance.on('end', () => {
        console.log('[Redis] Connection closed');
        this.isConnected = false;
      });

      console.log('[Redis] Attempting to connect...');
      // Connect to Redis in the background
      this.instance.connect()
        .then(() => {
          console.log('[Redis] Connection established');
          this.isConnected = true;
          this.isConnecting = false;
        })
        .catch((err) => {
          console.error('[Redis] Connection failed:', err);
          console.error('[Redis] Connection details:', { host, port, username: username ? '(set)' : '(not set)', password: password ? '(set)' : '(not set)' });
          this.isConnected = false;
          this.isConnecting = false;
          this.instance = null;
        });
    } catch (error) {
      console.error('[Redis] Initialization error:', error);
      this.isConnected = false;
      this.isConnecting = false;
      this.instance = null;
    }
  }
}

/**
 * Get the Redis client instance
 */
export const getRedisClient = () => RedisClientSingleton.getClient();

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => RedisClientSingleton.isRedisConnected();
