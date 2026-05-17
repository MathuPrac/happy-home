import Redis from 'ioredis';
import { config } from '../../config';
import { createLogger } from '../logger';

const log = createLogger('Redis');

// ── Client Singleton ──────────────────────────────────────────────────────────

let redisClient: Redis | null = null;

export function createRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password ?? undefined,
    db: config.redis.db,
    keyPrefix: config.redis.keyPrefix,
    retryStrategy: (times) => {
      if (times > 5) {
        log.error('Redis max retry attempts reached. Giving up.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 200, 2000);
      log.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 10_000,
  });

  redisClient.on('connect', () => log.info('Redis connecting…'));
  redisClient.on('ready', () => log.info('✅ Redis ready'));
  redisClient.on('error', (err) => log.error('Redis error', { error: err.message }));
  redisClient.on('close', () => log.warn('Redis connection closed'));
  redisClient.on('reconnecting', () => log.info('Redis reconnecting…'));
  redisClient.on('end', () => log.warn('Redis connection ended'));

  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) throw new Error('Redis client not initialized. Call createRedisClient() first.');
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = createRedisClient();
  await client.connect();
  await client.ping(); // Verify connection
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    log.info('Redis disconnected');
  }
}

// ── Cache Helper ──────────────────────────────────────────────────────────────

export class CacheService {
  private readonly client: Redis;
  private readonly defaultTtl: number;

  constructor(client?: Redis) {
    this.client = client ?? getRedisClient();
    this.defaultTtl = config.redis.ttlDefault;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const ttl = ttlSeconds ?? this.defaultTtl;
    await this.client.setex(key, ttl, serialized);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    // Strip keyPrefix for del (ioredis adds it automatically)
    const stripped = keys.map((k) => k.replace(config.redis.keyPrefix, ''));
    await this.client.del(...stripped);
    return stripped.length;
  }

  /** Atomic increment with optional TTL on first set */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return count;
  }

  /** Store a token in a set for enumeration / revocation */
  async addToSet(key: string, member: string, ttlSeconds?: number): Promise<void> {
    await this.client.sadd(key, member);
    if (ttlSeconds) await this.client.expire(key, ttlSeconds);
  }

  async isMember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1;
  }

  async removeFromSet(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }
}

// ── Token Blacklist ───────────────────────────────────────────────────────────

export class TokenBlacklist {
  private static readonly PREFIX = 'blacklist:';
  private readonly cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  async add(jti: string, expiresInSeconds: number): Promise<void> {
    await this.cache.set(`${TokenBlacklist.PREFIX}${jti}`, '1', expiresInSeconds);
  }

  async isRevoked(jti: string): Promise<boolean> {
    return this.cache.exists(`${TokenBlacklist.PREFIX}${jti}`);
  }
}
