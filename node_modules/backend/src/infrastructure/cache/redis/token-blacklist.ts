import { CacheService } from './cache.service';

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
