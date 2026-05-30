import type { PaginationQuery } from '@restaurant/shared-types';
import { BaseRepository } from '../../../infrastructure/database/mongodb/base.repository';
import { RestaurantModel, type IRestaurant, CuisineType } from '../entities/restaurant.entity';

export interface RestaurantFilters {
  cuisineType?: CuisineType | undefined;
  isActive?:    boolean | undefined;
  isVerified?:  boolean | undefined;
  search?:      string | undefined;
  openNow?:     boolean | undefined;
}

export type RestaurantListQuery = PaginationQuery & RestaurantFilters;

/** Day-of-week names keyed by JS getDay() index (0 = Sunday). */
const DAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
] as const;

type DayName = (typeof DAYS)[number];

/**
 * Returns a MongoDB filter that keeps only restaurants whose opening hours for
 * the current day/time include the given HH:MM string.
 *
 * We can only do a simple "is not marked closed and open <= now <= close" check
 * in the DB layer; timezone logic lives in the service.
 */
function buildOpenNowFilter(day: DayName, timeStr: string): Record<string, unknown> {
  return {
    [`openingHours.${day}.closed`]: false,
    [`openingHours.${day}.open`]:   { $lte: timeStr },
    [`openingHours.${day}.close`]:  { $gt:  timeStr },
  };
}

export class RestaurantRepository extends BaseRepository<IRestaurant> {
  constructor() {
    super(RestaurantModel);
  }

  // ── List with filters ─────────────────────────────────────────────────────

  async findAll(query: RestaurantListQuery) {
    const { cuisineType, isActive, isVerified, search, openNow, ...paginationQuery } = query;

    const filter: Record<string, unknown> = {};

    if (cuisineType !== undefined) filter['cuisineType'] = cuisineType;
    if (isActive    !== undefined) filter['isActive']    = isActive;
    if (isVerified  !== undefined) filter['isVerified']  = isVerified;

    if (search !== undefined && search.length > 0) {
      filter['$or'] = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    if (openNow === true) {
      // UTC time — the client can convert; Sri Lanka = UTC+5:30
      const now    = new Date();
      const day    = DAYS[now.getDay()] as DayName;
      const hh     = String(now.getUTCHours()).padStart(2, '0');
      const mm     = String(now.getUTCMinutes()).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;
      Object.assign(filter, buildOpenNowFilter(day, timeStr));
    }

    return this.findMany(filter, paginationQuery);
  }

  // ── By owner ──────────────────────────────────────────────────────────────

  async findByOwner(ownerId: string, query: PaginationQuery) {
    return this.findMany({ ownerId }, query);
  }

  // ── Existence helpers ─────────────────────────────────────────────────────

  async existsByNameAndOwner(
    name:      string,
    ownerId:   string,
    excludeId?: string | undefined,
  ) {
    const filter: Record<string, unknown> = {
      name:    { $regex: `^${name}$`, $options: 'i' },
      ownerId,
    };
    if (excludeId !== undefined) filter['_id'] = { $ne: excludeId };
    return this.exists(filter);
  }

  async existsById(id: string): Promise<boolean> {
    return this.exists({ _id: id });
  }
}
