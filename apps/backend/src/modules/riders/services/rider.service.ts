import { ConflictError, ForbiddenError, NotFoundError, BadRequestError } from '@/core/errors';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { createLogger } from '@/shared/utils/logger';
import type { CreateRiderProfileDto, UpdateRiderProfileDto, AdminPatchRiderDto } from '../dtos/rider.dto';
import type { RiderRepository, NearbyQuery } from '../repositories/rider.repository';

const RIDER_TTL       = 300; // 5 min
const AVAILABLE_TTL   = 30;  // 30 sec — available list changes frequently

function riderCacheKey(id: string): string {
  return `rider:${id}`;
}

function riderByUserCacheKey(userId: string): string {
  return `rider:user:${userId}`;
}

const log = createLogger('RiderService');

export class RiderService {
  constructor(
    private readonly riderRepo:  RiderRepository,
    private readonly cache:      CacheService,
  ) {}

  // ── Create profile ────────────────────────────────────────────────────────

  async createProfile(dto: CreateRiderProfileDto, userId: string) {
    const existing = await this.riderRepo.existsByUserId(userId);
    if (existing) {
      throw new ConflictError('Rider profile already exists for this account');
    }

    const rider = await this.riderRepo.create({
      ...dto,
      userId,
      isOnline:        false,
      isApproved:      false,
      rating:          0,
      totalDeliveries: 0,
    });

    log.info(`Rider profile created: ${String(rider._id)} for user ${userId}`);
    await this.cache.del(riderByUserCacheKey(userId));
    return rider;
  }

  // ── Read — own profile ────────────────────────────────────────────────────

  async getMyProfile(userId: string) {
    const cacheKey = riderByUserCacheKey(userId);
    const cached   = await this.cache.get(cacheKey);
    if (cached) return cached;

    const rider = await this.riderRepo.findByUserId(userId);
    if (!rider) throw new NotFoundError('Rider profile');

    await this.cache.set(cacheKey, rider, RIDER_TTL);
    return rider;
  }

  // ── Read — by riderId (ADMIN / RESTAURANT_OWNER for dispatch) ────────────

  async getRiderById(riderId: string) {
    const cacheKey = riderCacheKey(riderId);
    const cached   = await this.cache.get(cacheKey);
    if (cached) return cached;

    const rider = await this.riderRepo.findById(riderId);
    if (!rider) throw new NotFoundError('Rider');

    await this.cache.set(cacheKey, rider, RIDER_TTL);
    return rider;
  }

  // ── Update profile ────────────────────────────────────────────────────────

  async updateProfile(dto: UpdateRiderProfileDto, userId: string) {
    const rider = await this.riderRepo.findByUserId(userId);
    if (!rider) throw new NotFoundError('Rider profile');

    const updated = await this.riderRepo.update(String(rider._id), dto);
    if (!updated) throw new NotFoundError('Rider profile');

    log.info(`Rider profile updated: ${String(rider._id)}`);
    await Promise.all([
      this.cache.del(riderCacheKey(String(rider._id))),
      this.cache.del(riderByUserCacheKey(userId)),
    ]);

    return updated;
  }

  // ── Toggle online status ──────────────────────────────────────────────────

  async setOnlineStatus(isOnline: boolean, userId: string) {
    const rider = await this.riderRepo.findByUserId(userId);
    if (!rider) throw new NotFoundError('Rider profile');

    if (isOnline && !rider.isApproved) {
      throw new ForbiddenError('Your rider account has not been approved yet');
    }

    const updated = await this.riderRepo.update(String(rider._id), { isOnline });
    if (!updated) throw new NotFoundError('Rider profile');

    log.info(`Rider ${String(rider._id)} is now ${isOnline ? 'online' : 'offline'}`);
    await Promise.all([
      this.cache.del(riderCacheKey(String(rider._id))),
      this.cache.del(riderByUserCacheKey(userId)),
      this.cache.invalidatePattern('rider:available*'),
    ]);

    return updated;
  }

  // ── Update location ───────────────────────────────────────────────────────

  async updateLocation(lat: number, lng: number, userId: string) {
    const rider = await this.riderRepo.findByUserId(userId);
    if (!rider) throw new NotFoundError('Rider profile');

    if (!rider.isOnline) {
      throw new BadRequestError('Cannot update location while offline');
    }

    const updated = await this.riderRepo.updateLocation(String(rider._id), lat, lng);
    if (!updated) throw new NotFoundError('Rider profile');

    // Location updates are high-frequency — only bust geo cache, not full profile
    await this.cache.invalidatePattern('rider:available*');

    return updated;
  }

  // ── Available riders (for dispatch) ──────────────────────────────────────

  async getAvailableRiders(nearby?: NearbyQuery) {
    const cacheKey = nearby !== undefined
      ? `rider:available:${nearby.lat}:${nearby.lng}:${nearby.radius}`
      : 'rider:available:all';

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const riders = await this.riderRepo.findAvailable(nearby);
    await this.cache.set(cacheKey, riders, AVAILABLE_TTL);
    return riders;
  }

  // ── Assign / clear active order ───────────────────────────────────────────

  async assignOrder(riderId: string, orderId: string) {
    const rider = await this.riderRepo.findById(riderId);
    if (!rider) throw new NotFoundError('Rider');

    if (!rider.isApproved || !rider.isOnline) {
      throw new BadRequestError('Rider is not available for assignment');
    }

    if (rider.activeOrderId !== undefined) {
      throw new ConflictError('Rider already has an active order');
    }

    const updated = await this.riderRepo.assignOrder(riderId, orderId);
    if (!updated) throw new NotFoundError('Rider');

    log.info(`Order ${orderId} assigned to rider ${riderId}`);
    await Promise.all([
      this.cache.del(riderCacheKey(riderId)),
      this.cache.del(riderByUserCacheKey(rider.userId)),
      this.cache.invalidatePattern('rider:available*'),
    ]);

    return updated;
  }

  async clearActiveOrder(riderId: string) {
    const rider = await this.riderRepo.findById(riderId);
    if (!rider) throw new NotFoundError('Rider');

    const updated = await this.riderRepo.clearActiveOrder(riderId);
    if (!updated) throw new NotFoundError('Rider');

    log.info(`Active order cleared for rider ${riderId}`);
    await Promise.all([
      this.cache.del(riderCacheKey(riderId)),
      this.cache.del(riderByUserCacheKey(rider.userId)),
      this.cache.invalidatePattern('rider:available*'),
    ]);

    return updated;
  }

  // ── Admin patch ───────────────────────────────────────────────────────────

  async adminPatchRider(riderId: string, dto: AdminPatchRiderDto, actorId: string) {
    const rider = await this.riderRepo.findById(riderId);
    if (!rider) throw new NotFoundError('Rider');

    const updated = await this.riderRepo.update(riderId, dto);
    if (!updated) throw new NotFoundError('Rider');

    log.info(`Rider admin-patched: ${riderId} by admin ${actorId} — ${JSON.stringify(dto)}`);
    await Promise.all([
      this.cache.del(riderCacheKey(riderId)),
      this.cache.del(riderByUserCacheKey(rider.userId)),
      this.cache.invalidatePattern('rider:available*'),
    ]);

    return updated;
  }

  // ── Cross-module helper (used by OrderService for assign-rider) ───────────

  async assertRiderAvailable(riderId: string): Promise<void> {
    const rider = await this.riderRepo.findById(riderId);
    if (!rider) throw new NotFoundError('Rider');
    if (!rider.isApproved || !rider.isOnline) {
      throw new BadRequestError('Rider is not available');
    }
    if (rider.activeOrderId !== undefined) {
      throw new ConflictError('Rider already has an active order');
    }
  }
}
