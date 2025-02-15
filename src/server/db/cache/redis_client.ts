import { createClient } from 'redis';

// Create Redis client
const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000,
  },
});

// Handle Redis connection events
client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));
client.on('reconnecting', () => console.log('Redis Client Reconnecting'));

// Connect to Redis
(async () => {
  if (!client.isOpen) {
    await client.connect();
  }
})();

// Ensure Redis client is properly closed when the application exits
process.on('SIGTERM', async () => {
  await client.quit();
  process.exit(0);
});
export { client as redis };

