import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { JwtAccessPayload, JwtRefreshPayload, UserRole } from '../../types';
import { TokenBlacklist } from '../../shared/redis';
import { UnauthorizedError } from '../../shared/errors';
import { createLogger } from '../../shared/logger';

const log = createLogger('JwtService');

// ── Token Pair ────────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
}

// ── JWT Service ───────────────────────────────────────────────────────────────

export class JwtService {
  private readonly blacklist: TokenBlacklist;

  constructor() {
    this.blacklist = new TokenBlacklist();
  }

  // ── Generate Access Token ─────────────────────────────────────────────────

  generateAccessToken(payload: Omit<JwtAccessPayload, 'jti' | 'iat' | 'exp'>): string {
    const jti = uuidv4();
    return jwt.sign(
      { ...payload, jti } satisfies Omit<JwtAccessPayload, 'iat' | 'exp'>,
      config.jwt.accessSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: config.jwt.accessExpiresIn as any },
    );
  }

  // ── Generate Refresh Token ────────────────────────────────────────────────

  generateRefreshToken(userId: string, family?: string): string {
    const payload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: userId,
      jti: uuidv4(),
      family: family ?? uuidv4(),
    };
    return jwt.sign(
      payload,
      config.jwt.refreshSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: config.jwt.refreshExpiresIn as any },
    );
  }

  // ── Generate Token Pair ───────────────────────────────────────────────────

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

  // ── Verify Access Token ───────────────────────────────────────────────────

  async verifyAccessToken(token: string): Promise<JwtAccessPayload> {
    let payload: JwtAccessPayload;

    try {
      payload = jwt.verify(token, config.jwt.accessSecret) as JwtAccessPayload;
    } catch (err) {
      throw err; // Re-throw for global handler to normalize
    }

    // Check blacklist
    if (await this.blacklist.isRevoked(payload.jti)) {
      log.warn('Attempted use of revoked token', { jti: payload.jti, sub: payload.sub });
      throw new UnauthorizedError('Token has been revoked');
    }

    return payload;
  }

  // ── Verify Refresh Token ──────────────────────────────────────────────────

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtRefreshPayload;
  }

  // ── Decode Without Verification ───────────────────────────────────────────

  decodeToken(token: string): jwt.JwtPayload | null {
    return jwt.decode(token) as jwt.JwtPayload | null;
  }

  // ── Revoke Token ──────────────────────────────────────────────────────────

  async revokeToken(jti: string, expiresAt: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = Math.max(expiresAt - now, 0);
    if (remainingSeconds > 0) {
      await this.blacklist.add(jti, remainingSeconds);
    }
  }

  // ── Extract Bearer Token ──────────────────────────────────────────────────

  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    return token.length > 0 ? token : null;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const jwtService = new JwtService();
