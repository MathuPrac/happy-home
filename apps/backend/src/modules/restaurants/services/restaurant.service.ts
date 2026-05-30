import { ConflictError, ForbiddenError, NotFoundError } from '@/core/errors';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { createLogger } from '@/shared/utils/logger';
import { UserRole } from '@restaurant/shared-types';
import type { CreateRestaurantDto, UpdateRestaurantDto, AdminPatchRestaurantDto } from '../dtos/restaurant.dto';
import type { RestaurantRepository, RestaurantListQuery } from '../repositories/restaurant.repository';

const RESTAURANT_TTL = 300; // 5 min
const LIST_TTL = 120; // 2 min

function restaurantCacheKey(id: string): string {
  return `restaurant:${id}`;
}

function listCacheKey(query: RestaurantListQuery): string {
  const {
    page = 1, limit = 20, sortBy, sortOrder,
    cuisineType, isActive, isVerified, search, openNow,
  } = query;
  const parts = [
    `restaurant:list`,
    `p${page}`, `l${limit}`,
    cuisineType !== undefined ? `ct:${cuisineType}` : '',
    isActive !== undefined ? `act:${String(isActive)}` : '',
    isVerified !== undefined ? `ver:${String(isVerified)}` : '',
    search !== undefined ? `q:${search}` : '',
    openNow !== undefined ? `on:${String(openNow)}` : '',
    sortBy !== undefined ? `sb:${sortBy}` : '',
    sortOrder !== undefined ? `so:${sortOrder}` : '',
  ].filter(Boolean);
  return parts.join(':');
}

function ownerListCacheKey(ownerId: string): string {
  return `restaurant:owner:${ownerId}`;
}

export class RestaurantService {
  private readonly logger = createLogger('RestaurantService');

  constructor(
    private readonly restaurantRepo: RestaurantRepository,
    private readonly cache: CacheService,
  ) { }

  // ── Create ─────────────────────────────────────────────────────────────────

  async createRestaurant(
    dto: CreateRestaurantDto,
    ownerId: string,
  ) {
    const duplicate = await this.restaurantRepo.existsByNameAndOwner(dto.name, ownerId);
    if (duplicate) {
      throw new ConflictError(
        `You already have a restaurant named "${dto.name}"`,
      );
    }

    // Spread optional fields individually — exactOptionalPropertyTypes compliance
    // ADD:
    const { coverImageUrl, logoUrl, phone, address, ...required } = dto;

    // Strip coordinates if undefined — exactOptionalPropertyTypes compliance
    const { coordinates, ...addressBase } = address;
    const safeAddress = {
      ...addressBase,
      ...(coordinates !== undefined ? { coordinates } : {}),
    };

    const restaurant = await this.restaurantRepo.create({
      ...required,
      address: safeAddress,
      ownerId,
      isActive: true,
      isVerified: false,
      rating: 0,
      totalOrders: 0,
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(phone !== undefined ? { phone } : {}),
    });

    this.logger.info(`Restaurant created: ${String(restaurant._id)} by owner ${ownerId}`);

    // Bust owner list cache
    await this.cache.del(ownerListCacheKey(ownerId));

    return restaurant;
  }

  // ── Read — public list ─────────────────────────────────────────────────────

  async listRestaurants(query: RestaurantListQuery) {
    // Public list always shows only active + verified restaurants by default.
    // Admin routes can pass explicit overrides.
    const cacheKey = listCacheKey(query);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.restaurantRepo.findAll(query);
    await this.cache.set(cacheKey, result, LIST_TTL);
    return result;
  }

  // ── Read — owner's own restaurants ────────────────────────────────────────

  async listMyRestaurants(ownerId: string, query: RestaurantListQuery) {
    const cacheKey = ownerListCacheKey(ownerId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.restaurantRepo.findByOwner(ownerId, query);
    await this.cache.set(cacheKey, result, LIST_TTL);
    return result;
  }

  // ── Read — single ──────────────────────────────────────────────────────────

  async getRestaurantById(restaurantId: string) {
    const cacheKey = restaurantCacheKey(restaurantId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');

    await this.cache.set(cacheKey, restaurant, RESTAURANT_TTL);
    return restaurant;
  }

  // ── Update — owner/admin ───────────────────────────────────────────────────

  async updateRestaurant(
    restaurantId: string,
    dto: UpdateRestaurantDto,
    actorId: string,
    actorRole: UserRole,
  ) {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');

    // RESTAURANT_OWNER can only edit their own
    if (actorRole === UserRole.RESTAURANT_OWNER && restaurant.ownerId !== actorId) {
      throw new ForbiddenError('You do not own this restaurant');
    }

    // Duplicate name check (scoped to owner)
    if (dto.name !== undefined && dto.name !== restaurant.name) {
      const duplicate = await this.restaurantRepo.existsByNameAndOwner(
        dto.name,
        restaurant.ownerId,
        restaurantId,
      );
      if (duplicate) {
        throw new ConflictError(`You already have a restaurant named "${dto.name}"`);
      }
    }

    const updated = await this.restaurantRepo.update(restaurantId, dto);
    if (!updated) throw new NotFoundError('Restaurant');

    this.logger.info(`Restaurant updated: ${restaurantId} by ${actorId}`);
    await Promise.all([
      this.cache.del(restaurantCacheKey(restaurantId)),
      this.cache.del(ownerListCacheKey(restaurant.ownerId)),
      this.cache.invalidatePattern('restaurant:list*'),
    ]);

    return updated;
  }

  // ── Admin patch — isVerified / isActive ───────────────────────────────────

  async adminPatchRestaurant(
    restaurantId: string,
    dto: AdminPatchRestaurantDto,
    actorId: string,
  ) {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');

    const updated = await this.restaurantRepo.update(restaurantId, dto);
    if (!updated) throw new NotFoundError('Restaurant');

    this.logger.info(
      `Restaurant admin-patched: ${restaurantId} by admin ${actorId} — ${JSON.stringify(dto)}`,
    );
    await Promise.all([
      this.cache.del(restaurantCacheKey(restaurantId)),
      this.cache.del(ownerListCacheKey(restaurant.ownerId)),
      this.cache.invalidatePattern('restaurant:list*'),
    ]);

    return updated;
  }

  // ── Delete — admin only ────────────────────────────────────────────────────

  async deleteRestaurant(restaurantId: string, actorId: string) {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');

    await this.restaurantRepo.delete(restaurantId);

    this.logger.info(`Restaurant deleted: ${restaurantId} by admin ${actorId}`);
    await Promise.all([
      this.cache.del(restaurantCacheKey(restaurantId)),
      this.cache.del(ownerListCacheKey(restaurant.ownerId)),
      this.cache.invalidatePattern('restaurant:list*'),
    ]);
  }

  // ── Cross-module helper (used by MenuItemService) ─────────────────────────

  async assertRestaurantExists(restaurantId: string): Promise<void> {
    const exists = await this.restaurantRepo.existsById(restaurantId);
    if (!exists) throw new NotFoundError('Restaurant');
  }

  async assertOwnsRestaurant(restaurantId: string, ownerId: string): Promise<void> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('You do not own this restaurant');
    }
  }
}
