import { z } from 'zod';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ValidationError } from '@/core/errors/app-error';
import { ok, created, noContent, paginated, buildPaginationMeta } from '@/shared/http/response';
import type { RestaurantService } from '../services/restaurant.service';
import type { RestaurantListQuery } from '../repositories/restaurant.repository';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  adminPatchRestaurantSchema,
  restaurantParamsSchema,
  listRestaurantsQuerySchema,
} from '../validations/restaurant.validators';
import type { PaginationMeta } from '@/types';

function parseOrThrow<S extends z.ZodSchema>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        field:   issue.path.join('.') || 'root',
        message: issue.message,
        code:    'VALIDATION_ERROR',
      })),
    );
  }
  return result.data as z.output<S>;
}

export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // POST /restaurants
  async createRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto = parseOrThrow(createRestaurantSchema, req.body);
    const restaurant = await this.restaurantService.createRestaurant(dto, req.user.sub);
    created(res, restaurant);
  }

  // GET /restaurants
  async listRestaurants(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = parseOrThrow(listRestaurantsQuerySchema, req.query);

    // Build query without undefined values — exactOptionalPropertyTypes compliance
    const query: RestaurantListQuery = { page: parsed.page, limit: parsed.limit };
    if (parsed.sortBy      !== undefined) query.sortBy      = parsed.sortBy;
    if (parsed.sortOrder   !== undefined) query.sortOrder   = parsed.sortOrder;
    if (parsed.cuisineType !== undefined) query.cuisineType = parsed.cuisineType;
    if (parsed.isActive    !== undefined) query.isActive    = parsed.isActive;
    if (parsed.isVerified  !== undefined) query.isVerified  = parsed.isVerified;
    if (parsed.search      !== undefined) query.search      = parsed.search;
    if (parsed.openNow     !== undefined) query.openNow     = parsed.openNow;

    const result = await this.restaurantService.listRestaurants(query);
    const { data, meta } = result as { data: unknown[]; meta: PaginationMeta };
    paginated(res, data, buildPaginationMeta(meta.page, meta.limit, meta.total));
  }

  // GET /restaurants/my
  async listMyRestaurants(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = parseOrThrow(listRestaurantsQuerySchema, req.query);

    const query: RestaurantListQuery = { page: parsed.page, limit: parsed.limit };
    if (parsed.sortBy    !== undefined) query.sortBy    = parsed.sortBy;
    if (parsed.sortOrder !== undefined) query.sortOrder = parsed.sortOrder;

    const result = await this.restaurantService.listMyRestaurants(req.user.sub, query);
    const { data, meta } = result as { data: unknown[]; meta: PaginationMeta };
    paginated(res, data, buildPaginationMeta(meta.page, meta.limit, meta.total));
  }

  // GET /restaurants/:restaurantId
  async getRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId } = parseOrThrow(restaurantParamsSchema, req.params);
    const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
    ok(res, restaurant);
  }

  // PATCH /restaurants/:restaurantId
  async updateRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId } = parseOrThrow(restaurantParamsSchema, req.params);
    const dto              = parseOrThrow(updateRestaurantSchema, req.body);
    const updated = await this.restaurantService.updateRestaurant(
      restaurantId, dto, req.user.sub, req.user.role,
    );
    ok(res, updated);
  }

  // PATCH /restaurants/:restaurantId/admin
  async adminPatchRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId } = parseOrThrow(restaurantParamsSchema, req.params);
    const dto              = parseOrThrow(adminPatchRestaurantSchema, req.body);
    const updated = await this.restaurantService.adminPatchRestaurant(
      restaurantId, dto, req.user.sub,
    );
    ok(res, updated);
  }

  // DELETE /restaurants/:restaurantId
  async deleteRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId } = parseOrThrow(restaurantParamsSchema, req.params);
    await this.restaurantService.deleteRestaurant(restaurantId, req.user.sub);
    noContent(res);
  }
}
