import { ConflictError, NotFoundError, ForbiddenError } from '@/core/errors';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { createLogger } from '@/shared/utils/logger';
import { UserRole } from '@restaurant/shared-types';
import type { CreateMenuItemDto, UpdateMenuItemDto } from '../dtos/menu-item.dto';
import type { MenuItemRepository, MenuItemListQuery } from '../repositories/menu-item.repository';

const ITEM_TTL_SECONDS = 300; // 5 min
const LIST_TTL_SECONDS = 120; // 2 min

function itemCacheKey(itemId: string): string {
  return `menu:item:${itemId}`;
}

function listCacheKey(restaurantId: string, query: MenuItemListQuery): string {
  const { page = 1, limit = 20, category, isAvailable, search, sortBy, sortOrder } = query;
  const parts = [
    `menu:list:${restaurantId}`,
    `p${page}`,
    `l${limit}`,
    category !== undefined     ? `cat:${category}`              : '',
    isAvailable !== undefined  ? `avail:${String(isAvailable)}` : '',
    search !== undefined       ? `q:${search}`                  : '',
    sortBy !== undefined       ? `sb:${sortBy}`                 : '',
    sortOrder !== undefined    ? `so:${sortOrder}`              : '',
  ].filter(Boolean);
  return parts.join(':');
}

export class MenuItemService {
  private readonly logger = createLogger('MenuItemService');

  constructor(
    private readonly menuItemRepo: MenuItemRepository,
    private readonly cache: CacheService,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────────────
  async createMenuItem(
    restaurantId: string,
    dto: CreateMenuItemDto,
    actorId: string,
  ) {
    const duplicate = await this.menuItemRepo.existsByNameAndRestaurant(
      dto.name,
      restaurantId,
    );
    if (duplicate) {
      throw new ConflictError(
        `A menu item named "${dto.name}" already exists for this restaurant`,
      );
    }

    // Spread optional fields individually to satisfy exactOptionalPropertyTypes
    const { imageUrl, preparationTimeMinutes, ...required } = dto;
    const item = await this.menuItemRepo.create({
      ...required,
      restaurantId,
      ...(imageUrl !== undefined              ? { imageUrl }              : {}),
      ...(preparationTimeMinutes !== undefined ? { preparationTimeMinutes } : {}),
    });

    this.logger.info(`Menu item created: ${String(item._id)} by ${actorId}`);
    await this.cache.invalidatePattern(`menu:list:${restaurantId}*`);

    return item;
  }

  // ── Read — single ───────────────────────────────────────────────────────────
  async getMenuItemById(restaurantId: string, itemId: string) {
    const cacheKey = itemCacheKey(itemId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const item = await this.menuItemRepo.findByRestaurantAndId(restaurantId, itemId);
    if (!item) throw new NotFoundError('MenuItem');

    await this.cache.set(cacheKey, item, ITEM_TTL_SECONDS);
    return item;
  }

  // ── Read — list ─────────────────────────────────────────────────────────────
  async listMenuItems(restaurantId: string, query: MenuItemListQuery) {
    const cacheKey = listCacheKey(restaurantId, query);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.menuItemRepo.findByRestaurant(restaurantId, query);
    await this.cache.set(cacheKey, result, LIST_TTL_SECONDS);
    return result;
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  async updateMenuItem(
    restaurantId: string,
    itemId: string,
    dto: UpdateMenuItemDto,
    actorId: string,
    actorRole: UserRole,
  ) {
    const item = await this.menuItemRepo.findByRestaurantAndId(restaurantId, itemId);
    if (!item) throw new NotFoundError('MenuItem');

    if (actorRole === UserRole.RESTAURANT_OWNER && item.restaurantId !== restaurantId) {
      throw new ForbiddenError('You do not own this restaurant');
    }

    if (dto.name !== undefined && dto.name !== item.name) {
      const duplicate = await this.menuItemRepo.existsByNameAndRestaurant(
        dto.name,
        restaurantId,
        itemId,
      );
      if (duplicate) {
        throw new ConflictError(
          `A menu item named "${dto.name}" already exists for this restaurant`,
        );
      }
    }

    const updated = await this.menuItemRepo.update(itemId, dto);
    if (!updated) throw new NotFoundError('MenuItem');

    this.logger.info(`Menu item updated: ${itemId} by ${actorId}`);
    await Promise.all([
      this.cache.del(itemCacheKey(itemId)),
      this.cache.invalidatePattern(`menu:list:${restaurantId}*`),
    ]);

    return updated;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async deleteMenuItem(restaurantId: string, itemId: string, actorId: string) {
    const item = await this.menuItemRepo.findByRestaurantAndId(restaurantId, itemId);
    if (!item) throw new NotFoundError('MenuItem');

    await this.menuItemRepo.delete(itemId);

    this.logger.info(`Menu item deleted: ${itemId} by ${actorId}`);
    await Promise.all([
      this.cache.del(itemCacheKey(itemId)),
      this.cache.invalidatePattern(`menu:list:${restaurantId}*`),
    ]);
  }

  // ── Toggle availability ─────────────────────────────────────────────────────
  async toggleAvailability(
    restaurantId: string,
    itemId: string,
    isAvailable: boolean,
    actorId: string,
  ) {
    const item = await this.menuItemRepo.findByRestaurantAndId(restaurantId, itemId);
    if (!item) throw new NotFoundError('MenuItem');

    const updated = await this.menuItemRepo.update(itemId, { isAvailable });
    if (!updated) throw new NotFoundError('MenuItem');

    this.logger.info(
      `Menu item ${itemId} availability set to ${String(isAvailable)} by ${actorId}`,
    );
    await Promise.all([
      this.cache.del(itemCacheKey(itemId)),
      this.cache.invalidatePattern(`menu:list:${restaurantId}*`),
    ]);

    return updated;
  }
}