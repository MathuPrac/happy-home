import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '@/config';
import { TokenBlacklist } from '@/infrastructure/cache/redis';
import { UnauthorizedError } from '@/core/errors';
import { createLogger } from '@/shared/utils/logger';
import type { JwtAccessPayload, JwtRefreshPayload, UserRole } from '@/types';

const log = createLogger('JwtService');

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
}

export class JwtService {
  private readonly blacklist: TokenBlacklist;

  constructor() {
    this.blacklist = new TokenBlacklist();
  }

  generateAccessToken(payload: Omit<JwtAccessPayload, 'jti' | 'iat' | 'exp'>): string {
    const jti = randomUUID();
    return jwt.sign(
      { ...payload, jti } satisfies Omit<JwtAccessPayload, 'iat' | 'exp'>,
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn } as SignOptions,
    );
  }

  generateRefreshToken(userId: string, family?: string): string {
    const payload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: userId,
      jti: randomUUID(),
      family: family ?? randomUUID(),
    };
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);
  }

  generateTokenPair(user: {
    id: string;
    email: string;
    role: UserRole;
    refreshTokenFamily?: string;
  }): TokenPair {
    const accessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken(user.id, user.refreshTokenFamily);

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: config.jwt.accessExpiresIn,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtAccessPayload> {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtAccessPayload;

    if (await this.blacklist.isRevoked(payload.jti)) {
      log.warn('Attempted use of revoked token', { jti: payload.jti, sub: payload.sub });
      throw new UnauthorizedError('Token has been revoked');
    }

    return payload;
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtRefreshPayload;
  }

  decodeToken(token: string): jwt.JwtPayload | null {
    return jwt.decode(token) as jwt.JwtPayload | null;
  }

  async revokeToken(jti: string, expiresAt: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = Math.max(expiresAt - now, 0);
    if (remainingSeconds > 0) {
      await this.blacklist.add(jti, remainingSeconds);
    }
  }

  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    return token.length > 0 ? token : null;
  }
}

export const jwtService = new JwtService();
