import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ValidationError } from '@/core/errors/app-error';
import { ok, created, noContent, paginated, buildPaginationMeta } from '@/shared/http/response';
import type { MenuItemService } from '../services/menu-item.service';
import type { MenuItemListQuery } from '../repositories/menu-item.repository';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  listMenuItemsQuerySchema,
  menuItemParamsSchema,
  restaurantParamsSchema,
} from '../validations/menu-item.validators';
import { z } from 'zod';

const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

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

export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  // POST /menu/:restaurantId/items
  async createMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId } = parseOrThrow(restaurantParamsSchema, req.params);
    const dto              = parseOrThrow(createMenuItemSchema, req.body);

    const item = await this.menuItemService.createMenuItem(restaurantId, dto, req.user.sub);
    created(res, item);
  }

  // GET /menu/:restaurantId/items
  async listMenuItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId } = parseOrThrow(restaurantParamsSchema, req.params);
    const parsed           = parseOrThrow(listMenuItemsQuerySchema, req.query);

    // Build query without undefined values to satisfy exactOptionalPropertyTypes
    // on PaginationQuery fields (sortBy, sortOrder, etc.)
    const query: MenuItemListQuery = { page: parsed.page, limit: parsed.limit };
    if (parsed.sortBy !== undefined)      query.sortBy      = parsed.sortBy;
    if (parsed.sortOrder !== undefined)   query.sortOrder   = parsed.sortOrder;
    if (parsed.category !== undefined)    query.category    = parsed.category;
    if (parsed.isAvailable !== undefined) query.isAvailable = parsed.isAvailable;
    if (parsed.search !== undefined)      query.search      = parsed.search;

    const result = await this.menuItemService.listMenuItems(restaurantId, query);
    const { data, meta } = result as {
      data: unknown[];
      meta: import('@/types').PaginationMeta;
    };
    paginated(res, data, buildPaginationMeta(meta.page, meta.limit, meta.total));
  }

  // GET /menu/:restaurantId/items/:itemId
  async getMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId, itemId } = parseOrThrow(menuItemParamsSchema, req.params);

    const item = await this.menuItemService.getMenuItemById(restaurantId, itemId);
    ok(res, item);
  }

  // PATCH /menu/:restaurantId/items/:itemId
  async updateMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId, itemId } = parseOrThrow(menuItemParamsSchema, req.params);
    const dto                      = parseOrThrow(updateMenuItemSchema, req.body);

    const updated = await this.menuItemService.updateMenuItem(
      restaurantId, itemId, dto, req.user.sub, req.user.role,
    );
    ok(res, updated);
  }

  // DELETE /menu/:restaurantId/items/:itemId
  async deleteMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId, itemId } = parseOrThrow(menuItemParamsSchema, req.params);

    await this.menuItemService.deleteMenuItem(restaurantId, itemId, req.user.sub);
    noContent(res);
  }

  // PATCH /menu/:restaurantId/items/:itemId/availability
  async toggleAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { restaurantId, itemId } = parseOrThrow(menuItemParamsSchema, req.params);
    const { isAvailable }          = parseOrThrow(toggleAvailabilitySchema, req.body);

    const updated = await this.menuItemService.toggleAvailability(
      restaurantId, itemId, isAvailable, req.user.sub,
    );
    ok(res, updated);
  }
}