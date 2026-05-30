import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { CacheService } from '@/infrastructure/cache/redis';
import { authenticate, authorize } from '@/core/middleware/auth.middleware';
import { UserRole } from '@restaurant/shared-types';
import type { AuthenticatedRequest } from '@/types';

function createUsersRouter(): Router {
  const router = Router();

  // ── Dependency injection ──────────────────────────────────────────────────
  const userRepo   = new UserRepository();
  const cache      = new CacheService();
  const service    = new UserService(userRepo, cache);
  const controller = new UserController(service);

  // ── Own profile routes (any authenticated user) ───────────────────────────

  // GET /users/me
  router.get(
    '/me',
    authenticate,
    (req, res) => controller.getMe(req as AuthenticatedRequest, res),
  );

  // PATCH /users/me
  router.patch(
    '/me',
    authenticate,
    (req, res) => controller.updateMe(req as AuthenticatedRequest, res),
  );

  // PATCH /users/me/password
  router.patch(
    '/me/password',
    authenticate,
    (req, res) => controller.changePassword(req as AuthenticatedRequest, res),
  );

  // ── Admin routes ──────────────────────────────────────────────────────────

  // GET /users/stats — must be before /:userId
  router.get(
    '/stats',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.getUserStats(req as AuthenticatedRequest, res),
  );

  // GET /users
  router.get(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.listUsers(req as AuthenticatedRequest, res),
  );

  // GET /users/:userId
  router.get(
    '/:userId',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.getUserById(req as AuthenticatedRequest, res),
  );

  // PATCH /users/:userId
  router.patch(
    '/:userId',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.adminUpdateUser(req as AuthenticatedRequest, res),
  );

  // DELETE /users/:userId
  router.delete(
    '/:userId',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.deleteUser(req as AuthenticatedRequest, res),
  );

  return router;
}

// Named export preserves app.ts compatibility — no changes needed there
export const usersRouter = createUsersRouter();
