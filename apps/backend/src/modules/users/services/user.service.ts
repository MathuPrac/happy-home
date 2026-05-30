import bcrypt from 'bcryptjs';
import { ForbiddenError, NotFoundError, UnauthorizedError, ConflictError } from '@/core/errors';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { createLogger } from '@/shared/utils/logger';
import { config } from '@/config';
import { UserRole } from '@restaurant/shared-types';
import type { UpdateProfileDto, ChangePasswordDto, AdminUpdateUserDto, ListUsersQuery } from '../dtos/user.dto';
import type { IUser } from 'backend/dist/modules/users/models/user.model';
import type { UserRepository } from '../repositories/user.repository';

const USER_TTL = 300; // 5 min

function userCacheKey(id: string): string {
  return `user:${id}`;
}

const log = createLogger('UserService');

export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly cache:    CacheService,
  ) {}

  // ── Read own profile ──────────────────────────────────────────────────────

  async getMe(userId: string) {
    const cached = await this.cache.get(userCacheKey(userId));
    if (cached) return cached;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    await this.cache.set(userCacheKey(userId), user, USER_TTL);
    return user;
  }

  // ── Update own profile ────────────────────────────────────────────────────

  async updateMe(dto: UpdateProfileDto, userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const { avatarUrl, phone, ...rest } = dto;
    const updateFields: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'role' | 'status' | 'passwordHash'>> = {
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(phone !== undefined ? { phone } : {}),
    };
    if (rest.firstName !== undefined) updateFields.firstName = rest.firstName;
    if (rest.lastName !== undefined) updateFields.lastName = rest.lastName;

    const updated = await this.userRepo.updateById(userId, updateFields);
    if (!updated) throw new NotFoundError('User');

    log.info(`User profile updated: ${userId}`);
    await this.cache.del(userCacheKey(userId));
    return updated;
  }

  // ── Change own password ───────────────────────────────────────────────────

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const user = await this.userRepo.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError('User');

    const valid = await user.comparePassword(dto.currentPassword);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      config.security.bcryptRounds,
    );

    await this.userRepo.updateById(userId, { passwordHash });

    log.info(`Password changed: ${userId}`);
    await this.cache.del(userCacheKey(userId));
  }

  // ── Admin: list users ─────────────────────────────────────────────────────

  async listUsers(query: ListUsersQuery) {
    return this.userRepo.findAll(query);
  }

  // ── Admin: get any user ───────────────────────────────────────────────────

  async getUserById(userId: string) {
    const cached = await this.cache.get(userCacheKey(userId));
    if (cached) return cached;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    await this.cache.set(userCacheKey(userId), user, USER_TTL);
    return user;
  }

  // ── Admin: update any user ────────────────────────────────────────────────

  async adminUpdateUser(
    userId:    string,
    dto:       AdminUpdateUserDto,
    actorId:   string,
    actorRole: UserRole,
  ) {
    if (actorRole !== UserRole.ADMIN) throw new ForbiddenError('Admin access required');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    // Prevent demoting the last admin
    if (dto.role !== undefined && user.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
      const stats = await this.userRepo.countByRole();
      if ((stats[UserRole.ADMIN] ?? 0) <= 1) {
        throw new ConflictError('Cannot demote the last admin account');
      }
    }

    const { avatarUrl, phone, ...rest } = dto;
    const updateFields: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'role' | 'status' | 'passwordHash'>> = {
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(phone !== undefined ? { phone } : {}),
    };
    if (rest.firstName !== undefined) updateFields.firstName = rest.firstName;
    if (rest.lastName !== undefined) updateFields.lastName = rest.lastName;
    if (rest.role !== undefined) updateFields.role = rest.role;
    if (rest.status !== undefined) updateFields.status = rest.status;

    const updated = await this.userRepo.updateById(userId, updateFields);
    if (!updated) throw new NotFoundError('User');

    log.info(`User ${userId} updated by admin ${actorId}`);
    await this.cache.del(userCacheKey(userId));
    return updated;
  }

  // ── Admin: delete user ────────────────────────────────────────────────────

  async deleteUser(userId: string, actorId: string, actorRole: UserRole) {
    if (actorRole !== UserRole.ADMIN) throw new ForbiddenError('Admin access required');
    if (userId === actorId) throw new ConflictError('Cannot delete your own account');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    await this.userRepo.deleteById(userId);

    log.info(`User ${userId} deleted by admin ${actorId}`);
    await this.cache.del(userCacheKey(userId));
  }

  // ── Admin: stats ──────────────────────────────────────────────────────────

  async getUserStats() {
    return this.userRepo.countByRole();
  }
}
