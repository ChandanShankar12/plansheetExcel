import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        keepAlive: 5000,
        noDelay: true,
      }
    });

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers() {
    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error:', err.message);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      if (!this.isConnected) {
        console.log('Redis Client Connected');
        this.isConnected = true;
      }
    });

    this.client.on('end', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });

    // Graceful shutdown
    const cleanup = async () => {
      console.log('Shutting down Redis client...');
      await this.quit();
      process.exit(0);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  private async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Redis connection error:', error);
      }
    }
  }

  public static getInstance(): RedisClient {
    if (!global.redisClient) {
      global.redisClient = new RedisClient();
    }
    return global.redisClient;
  }

  // Redis operations
  public async set(key: string, value: string): Promise<string | null> {
    try {
      return await this.client.set(key, value);
    } catch (error) {
      console.error('Redis set error:', error);
      return null;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      return 0;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  public async quit(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        console.log('Redis connection closed successfully');
      } catch (error) {
        console.error('Redis quit error:', error);
      }
    }
  }
}

// Use global instance to prevent multiple instances during development
const redis = global.redisClient || RedisClient.getInstance();

export { redis };

