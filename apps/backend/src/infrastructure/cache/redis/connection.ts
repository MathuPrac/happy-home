import Redis, { type RedisOptions } from 'ioredis';
import { config } from '@/config';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('Redis');

let redisClient: Redis | null = null;

function buildRedisOptions(): RedisOptions {
  const base: RedisOptions = {
    keyPrefix: config.redis.keyPrefix,
    retryStrategy: (times: number) => {
      if (times > 5) {
        log.error('Redis max retry attempts reached');
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      log.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 10_000,
  };

  if (config.redis.url) {
    return { ...base, ...parseRedisUrl(config.redis.url) };
  }

  return {
    ...base,
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  };
}

function parseRedisUrl(url: string): RedisOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    password: parsed.password || undefined,
    db: parsed.pathname ? Number(parsed.pathname.replace('/', '')) || 0 : 0,
  };
}

export function createRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis(buildRedisOptions());

  redisClient.on('connect', () => log.info('Redis connecting…'));
  redisClient.on('ready', () => log.info('Redis ready'));
  redisClient.on('error', (err) => log.error('Redis error', { error: err.message }));
  redisClient.on('close', () => log.warn('Redis connection closed'));
  redisClient.on('reconnecting', () => log.info('Redis reconnecting…'));

  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = createRedisClient();
  await client.connect();
  await client.ping();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    log.info('Redis disconnected');
  }
}

/** @deprecated Use createRedisClient / connectRedis */
export class RedisConnection {
  static connect = connectRedis;
  static disconnect = disconnectRedis;
  static getInstance = getRedisClient;
}
