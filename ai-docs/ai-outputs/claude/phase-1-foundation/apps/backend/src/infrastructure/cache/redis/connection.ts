import Redis from 'ioredis';
import { config } from '../../../config';
import { Logger } from '../../../shared/utils/logger';

const logger = new Logger('Redis');

export class RedisConnection {
  private static instance: Redis | null = null;

  static async connect(): Promise<Redis> {
    if (this.instance) return this.instance;

    this.instance = new Redis(config.REDIS_URL, {
      keyPrefix: config.REDIS_PREFIX,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.instance.on('ready', () => logger.info('Redis ready'));
    this.instance.on('error', (err) => logger.error('Redis error', err));
    this.instance.on('reconnecting', () => logger.warn('Redis reconnecting'));

    return this.instance;
  }

  static getInstance(): Redis {
    if (!this.instance) throw new Error('Redis not connected. Call connect() first.');
    return this.instance;
  }

  static async disconnect(): Promise<void> {
    await this.instance?.quit();
    this.instance = null;
  }
}
