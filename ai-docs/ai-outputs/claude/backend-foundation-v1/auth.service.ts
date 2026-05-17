import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from '../users/user.model';
import { jwtService, TokenPair } from './jwt.service';
import { CacheService } from '../../shared/redis';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../shared/errors';
import { UserRole, UserStatus } from '../../types';
import { createLogger } from '../../shared/logger';
import { RegisterDto, LoginDto } from './auth.validators';

const log = createLogger('AuthService');

// ── Auth Service ──────────────────────────────────────────────────────────────

export class AuthService {
  private readonly cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  // ── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ user: IUser; tokens: TokenPair }> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictError('Email is already registered');

    const user = new User({
      email: dto.email,
      passwordHash: dto.password,   // Pre-save hook will hash it
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role ?? UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      refreshTokenFamily: uuidv4(),
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

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ user: IUser; tokens: TokenPair }> {
    // Explicitly select passwordHash (excluded by default)
    const user = await User.findOne({ email: dto.email.toLowerCase() })
      .select('+passwordHash +refreshTokenFamily')
      .lean<IUser & { passwordHash: string; refreshTokenFamily?: string }>();

    if (!user) {
      // Timing-safe: don't reveal whether email exists
      await new Promise((r) => setTimeout(r, 300));
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedError('Account is suspended. Please contact support.');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedError('Account is inactive. Please verify your email.');
    }

    const passwordValid = await User.findById(user._id)
      .select('+passwordHash')
      .then((u) => u?.comparePassword(dto.password));

    if (!passwordValid) {
      await this.incrementFailedAttempts(dto.email);
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.clearFailedAttempts(dto.email);
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    log.info('User logged in', { userId: user._id, role: user.role });

    const tokens = jwtService.generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.refreshTokenFamily ? { refreshTokenFamily: user.refreshTokenFamily } : {}),
    });

    return { user: user as unknown as IUser, tokens };
  }

  // ── Refresh Tokens ────────────────────────────────────────────────────────

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload;
    try {
      payload = jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(payload.sub)
      .select('+refreshTokenFamily');

    if (!user) throw new NotFoundError('User');

    if (user.refreshTokenFamily !== payload.family) {
      // Possible token reuse — invalidate entire family
      log.warn('Refresh token family mismatch — possible token theft', {
        userId: user._id,
        payloadFamily: payload.family,
      });
      await User.findByIdAndUpdate(user._id, { refreshTokenFamily: uuidv4() });
      throw new UnauthorizedError('Refresh token reuse detected. Please log in again.');
    }

    // Rotate: generate new family ID to invalidate old refresh tokens
    const newFamily = uuidv4();
    await User.findByIdAndUpdate(user._id, { refreshTokenFamily: newFamily });

    return jwtService.generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      refreshTokenFamily: newFamily,
    });
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout(accessToken: string): Promise<void> {
    const decoded = jwtService.decodeToken(accessToken);
    if (decoded?.jti && decoded.exp) {
      await jwtService.revokeToken(decoded.jti, decoded.exp);
    }
    log.info('User logged out', { sub: decoded?.sub });
  }

  // ── Brute-force Protection ────────────────────────────────────────────────

  private failedKey(email: string) {
    return `login:failed:${email.toLowerCase()}`;
  }

  async incrementFailedAttempts(email: string): Promise<void> {
    const key = this.failedKey(email);
    const count = await this.cache.increment(key, 15 * 60); // 15-min window
    if (count >= 5) {
      log.warn('Multiple failed login attempts', { email, count });
    }
  }

  async clearFailedAttempts(email: string): Promise<void> {
    await this.cache.del(this.failedKey(email));
  }

  async getFailedAttempts(email: string): Promise<number> {
    const val = await this.cache.get<number>(this.failedKey(email));
    return val ?? 0;
  }
}

export const authService = new AuthService();
