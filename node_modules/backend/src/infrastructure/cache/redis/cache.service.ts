import type Redis from 'ioredis';
import { config } from '@/config';
import { getRedisClient } from './connection';

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
    const stripped = keys.map((k) => k.replace(config.redis.keyPrefix, ''));
    await this.client.del(...stripped);
    return stripped.length;
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return count;
  }
}
