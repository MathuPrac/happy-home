import { Router } from 'express';
import { RiderController } from './controllers/rider.controller';
import { RiderService } from './services/rider.service';
import { RiderRepository } from './repositories/rider.repository';
import { CacheService } from '@/infrastructure/cache/redis';
import { authenticate, authorize } from '@/core/middleware/auth.middleware';
import { UserRole } from '@restaurant/shared-types';
import type { AuthenticatedRequest } from '@/types';

export function createRidersRouter(): Router {
  const router = Router();

  // ── Dependency injection ──────────────────────────────────────────────────
  const riderRepo  = new RiderRepository();
  const cache      = new CacheService();
  const service    = new RiderService(riderRepo, cache);
  const controller = new RiderController(service);

  // ── Rider's own profile routes ────────────────────────────────────────────

  /**
   * POST /riders/profile
   * RIDER creates their own profile after registration.
   * One profile per user — ConflictError if already exists.
   */
  router.post(
    '/profile',
    authenticate,
    authorize(UserRole.RIDER),
    (req, res) => controller.createProfile(req as AuthenticatedRequest, res),
  );

  /**
   * GET /riders/profile
   * RIDER reads their own profile.
   */
  router.get(
    '/profile',
    authenticate,
    authorize(UserRole.RIDER),
    (req, res) => controller.getMyProfile(req as AuthenticatedRequest, res),
  );

  /**
   * PATCH /riders/profile
   * RIDER updates vehicle type or licence plate.
   */
  router.patch(
    '/profile',
    authenticate,
    authorize(UserRole.RIDER),
    (req, res) => controller.updateProfile(req as AuthenticatedRequest, res),
  );

  /**
   * PATCH /riders/status
   * RIDER toggles online / offline.
   * Cannot go online if not approved by admin.
   */
  router.patch(
    '/status',
    authenticate,
    authorize(UserRole.RIDER),
    (req, res) => controller.setOnlineStatus(req as AuthenticatedRequest, res),
  );

  /**
   * PATCH /riders/location
   * RIDER updates current GPS location.
   * Called periodically by the rider app (every 10-30 seconds while online).
   * Cannot update location while offline.
   */
  router.patch(
    '/location',
    authenticate,
    authorize(UserRole.RIDER),
    (req, res) => controller.updateLocation(req as AuthenticatedRequest, res),
  );

  // ── Dispatch routes — RESTAURANT_OWNER / ADMIN ────────────────────────────

  /**
   * GET /riders/available
   * Returns online + approved riders with no active order.
   * Optional geo filter: ?lat=6.9271&lng=79.8612&radius=5000
   * Used by restaurant owners / admins to assign riders to orders.
   * Must be registered BEFORE /:riderId to avoid 'available' being treated as an ID.
   */
  router.get(
    '/available',
    authenticate,
    authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
    (req, res) => controller.getAvailableRiders(req as AuthenticatedRequest, res),
  );

  // ── Single rider lookup ───────────────────────────────────────────────────

  /**
   * GET /riders/:riderId
   * RESTAURANT_OWNER / ADMIN — look up a rider by ID for dispatch.
   */
  router.get(
    '/:riderId',
    authenticate,
    authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN),
    (req, res) => controller.getRiderById(req as AuthenticatedRequest, res),
  );

  // ── Admin routes ──────────────────────────────────────────────────────────

  /**
   * PATCH /riders/:riderId/admin
   * ADMIN approves or suspends a rider (flips isApproved).
   */
  router.patch(
    '/:riderId/admin',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.adminPatchRider(req as AuthenticatedRequest, res),
  );

  return router;
}

// Keep the named export so app.ts doesn't need to change — just swap the value
export const ridersRouter = createRidersRouter();
