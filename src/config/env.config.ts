interface RedisConfig {
  username: string;
  password: string;
  host: string;
  port: number;
  url: string;
}

interface AppConfig {
  redis: RedisConfig;
  isDev: boolean;
}

function getRedisConfig(): RedisConfig {
  const username = process.env.REDIS_USERNAME || 'default';
  const password = process.env.REDIS_PASSWORD || '';
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379');

  return {
    username,
    password,
    host,
    port,
    url: `redis://${username}:${password}@${host}:${port}`
  };
}

export const config: AppConfig = {
  redis: getRedisConfig(),
  isDev: process.env.NODE_ENV === 'development'
}; 