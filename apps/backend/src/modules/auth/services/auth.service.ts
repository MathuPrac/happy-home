import { randomUUID } from 'crypto';
import { User, type IUser } from '@/modules/users';
import { jwtService, type TokenPair } from './jwt.service';
import { CacheService } from '@/infrastructure/cache/redis';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@/core/errors';
import { UserRole, UserStatus } from '@/types';
import { createLogger } from '@/shared/utils/logger';
import type { LoginDto, RegisterDto } from '../validations/auth.validators';

const log = createLogger('AuthService');

export class AuthService {
  private readonly cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  async register(dto: RegisterDto): Promise<{ user: IUser; tokens: TokenPair }> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictError('Email is already registered');

    const user = new User({
      email: dto.email,
      passwordHash: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role ?? UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      refreshTokenFamily: randomUUID(),
    });

    await user.save();
    log.info('New user registered', { userId: user._id, role: user.role });

    const tokens = jwtService.generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.refreshTokenFamily ? { refreshTokenFamily: user.refreshTokenFamily } : {}),
    });

    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: IUser; tokens: TokenPair }> {
    const userDoc = await User.findOne({ email: dto.email.toLowerCase() }).select(
      '+passwordHash +refreshTokenFamily',
    );

    if (!userDoc) {
      await new Promise((r) => setTimeout(r, 300));
      throw new UnauthorizedError('Invalid email or password');
    }

    if (userDoc.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedError('Account is suspended. Please contact support.');
    }

    if (userDoc.status === UserStatus.INACTIVE) {
      throw new UnauthorizedError('Account is inactive. Please verify your email.');
    }

    const passwordValid = await userDoc.comparePassword(dto.password);
    if (!passwordValid) {
      await this.incrementFailedAttempts(dto.email);
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.clearFailedAttempts(dto.email);
    await User.findByIdAndUpdate(userDoc._id, { lastLoginAt: new Date() });

    log.info('User logged in', { userId: userDoc._id, role: userDoc.role });

    const tokens = jwtService.generateTokenPair({
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      ...(userDoc.refreshTokenFamily ? { refreshTokenFamily: userDoc.refreshTokenFamily } : {}),
    });

    return { user: userDoc, tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload;
    try {
      payload = jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(payload.sub).select('+refreshTokenFamily');
    if (!user) throw new NotFoundError('User');

    if (user.refreshTokenFamily !== payload.family) {
      log.warn('Refresh token family mismatch — possible token theft', { userId: user._id });
      await User.findByIdAndUpdate(user._id, { refreshTokenFamily: randomUUID() });
      throw new UnauthorizedError('Refresh token reuse detected. Please log in again.');
    }

    const newFamily = randomUUID();
    await User.findByIdAndUpdate(user._id, { refreshTokenFamily: newFamily });

    return jwtService.generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      refreshTokenFamily: newFamily,
    });
  }

  async logout(accessToken: string): Promise<void> {
    const decoded = jwtService.decodeToken(accessToken);
    if (decoded?.jti && decoded.exp) {
      await jwtService.revokeToken(decoded.jti, decoded.exp);
    }
    log.info('User logged out', { sub: decoded?.sub });
  }

  private failedKey(email: string): string {
    return `login:failed:${email.toLowerCase()}`;
  }

  private async incrementFailedAttempts(email: string): Promise<void> {
    const key = this.failedKey(email);
    const count = await this.cache.increment(key, 15 * 60);
    if (count >= 5) {
      log.warn('Multiple failed login attempts', { email, count });
    }
  }

  private async clearFailedAttempts(email: string): Promise<void> {
    await this.cache.del(this.failedKey(email));
  }
}

export const authService = new AuthService();
