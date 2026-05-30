import { Router } from 'express';
import { RestaurantController } from './controllers/restaurant.controller';
import { RestaurantService } from './services/restaurant.service';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { CacheService } from '@/infrastructure/cache/redis';
import { authenticate, authorize } from '@/core/middleware/auth.middleware';
import { UserRole } from '@restaurant/shared-types';
import type { AuthenticatedRequest } from '@/types';

export function createRestaurantsRouter(): Router {
  const router = Router();

  // ── Dependency injection ──────────────────────────────────────────────────
  const restaurantRepo = new RestaurantRepository();
  const cache          = new CacheService();
  const service        = new RestaurantService(restaurantRepo, cache);
  const controller     = new RestaurantController(service);

  // ── Public-ish read routes (any authenticated user) ───────────────────────

  /**
   * GET /restaurants
   * Query: page, limit, sortBy, sortOrder, cuisineType, isActive,
   *        isVerified, search, openNow
   *
   * Public consumers (customer-app) will typically pass isActive=true&isVerified=true.
   * Admin can omit those filters to see everything.
   */
  router.get(
    '/',
    authenticate,
    (req, res) => controller.listRestaurants(req as AuthenticatedRequest, res),
  );

  /**
   * GET /restaurants/my
   * RESTAURANT_OWNER sees their own restaurants (incl. unverified / inactive).
   * Must be registered BEFORE /:restaurantId to avoid 'my' being treated as an ID.
   */
  router.get(
    '/my',
    authenticate,
    authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
    (req, res) => controller.listMyRestaurants(req as AuthenticatedRequest, res),
  );

  /**
   * GET /restaurants/:restaurantId
   */
  router.get(
    '/:restaurantId',
    authenticate,
    (req, res) => controller.getRestaurant(req as AuthenticatedRequest, res),
  );

  // ── Write routes — RESTAURANT_OWNER ──────────────────────────────────────

  /**
   * POST /restaurants
   * Creates a restaurant owned by the authenticated user.
   * New restaurants are inactive + unverified until an admin approves.
   */
  router.post(
    '/',
    authenticate,
    authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
    (req, res) => controller.createRestaurant(req as AuthenticatedRequest, res),
  );

  /**
   * PATCH /restaurants/:restaurantId
   * RESTAURANT_OWNER edits their own; ADMIN can edit any.
   */
  router.patch(
    '/:restaurantId',
    authenticate,
    authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
    (req, res) => controller.updateRestaurant(req as AuthenticatedRequest, res),
  );

  // ── Admin-only routes ─────────────────────────────────────────────────────

  /**
   * PATCH /restaurants/:restaurantId/admin
   * Flip isVerified / isActive flags. ADMIN only.
   */
  router.patch(
    '/:restaurantId/admin',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.adminPatchRestaurant(req as AuthenticatedRequest, res),
  );

  /**
   * DELETE /restaurants/:restaurantId
   * Hard delete. ADMIN only.
   */
  router.delete(
    '/:restaurantId',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.deleteRestaurant(req as AuthenticatedRequest, res),
  );

  return router;
}
