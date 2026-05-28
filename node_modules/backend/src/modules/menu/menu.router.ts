  import { Router } from 'express';
  import { MenuItemController } from './controllers/menu-item.controller';
  import { MenuItemService } from './services/menu-item.service';
  import { MenuItemRepository } from './repositories/menu-item.repository';
  import { CacheService } from '@/infrastructure/cache/redis';
  import {
    authenticate,
    authorize,
    requireRestaurantOwner,
  } from '@/core/middleware/auth.middleware';
  import { UserRole } from '@restaurant/shared-types';
  import type { AuthenticatedRequest } from '@/types';

  export function createMenuRouter(): Router {
    const router = Router();

    const menuItemRepo = new MenuItemRepository();
    const cache        = new CacheService();
    const service      = new MenuItemService(menuItemRepo, cache);
    const controller   = new MenuItemController(service);

    // ── Write routes — RESTAURANT_OWNER or ADMIN only ─────────────────────────
    router.post(
      '/:restaurantId/items',
      authenticate,
      authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
      (req, res) => controller.createMenuItem(req as AuthenticatedRequest, res),
    );

    router.patch(
      '/:restaurantId/items/:itemId',
      authenticate,
      authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
      (req, res) => controller.updateMenuItem(req as AuthenticatedRequest, res),
    );

    router.delete(
      '/:restaurantId/items/:itemId',
      authenticate,
      authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
      (req, res) => controller.deleteMenuItem(req as AuthenticatedRequest, res),
    );

    router.patch(
      '/:restaurantId/items/:itemId/availability',
      authenticate,
      requireRestaurantOwner,        // RESTAURANT_OWNER | ADMIN
      (req, res) => controller.toggleAvailability(req as AuthenticatedRequest, res),
    );

    // ── Read routes — any authenticated user ──────────────────────────────────
    router.get(
      '/:restaurantId/items',
      authenticate,
      (req, res) => controller.listMenuItems(req as AuthenticatedRequest, res),
    );

    router.get(
      '/:restaurantId/items/:itemId',
      authenticate,
      (req, res) => controller.getMenuItem(req as AuthenticatedRequest, res),
    );

    return router;
  }

