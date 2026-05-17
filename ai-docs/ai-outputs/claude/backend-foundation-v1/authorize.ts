import { Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';
import { AuthenticatedRequest, UserRole, ROLE_HIERARCHY } from '../types';

// ── Role Guard Factory ────────────────────────────────────────────────────────

/**
 * Authorize middleware: ensures the authenticated user has one of the
 * required roles. Must be used AFTER authenticate middleware.
 *
 * @example
 *   router.get('/admin', authenticate, authorize(UserRole.ADMIN), handler)
 *   router.delete('/users/:id', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), handler)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required roles: [${allowedRoles.join(', ')}]. Your role: ${userRole}`,
        ),
      );
    }

    next();
  };
}

// ── Minimum Role Guard ────────────────────────────────────────────────────────

/**
 * Authorize by minimum hierarchy level.
 * E.g., authorizeMinRole(UserRole.ADMIN) allows ADMIN and SUPER_ADMIN.
 */
export function authorizeMinRole(minimumRole: UserRole) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      return next(
        new ForbiddenError(`Insufficient permissions. Minimum role required: ${minimumRole}`),
      );
    }

    next();
  };
}

// ── Self or Admin Guard ───────────────────────────────────────────────────────

/**
 * Allows access if the user is accessing their own resource OR is an admin.
 * Assumes the resource owner ID is in req.params.userId.
 */
export function authorizeSelfOrAdmin(paramName = 'userId') {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    const targetId = req.params[paramName];
    const isSelf = req.user.sub === targetId;
    const isAdmin = ROLE_HIERARCHY[req.user.role] >= ROLE_HIERARCHY[UserRole.ADMIN];

    if (!isSelf && !isAdmin) {
      return next(new ForbiddenError('You can only access your own resources'));
    }

    next();
  };
}

// ── Convenience Role Guards ───────────────────────────────────────────────────

export const requireAdmin = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);
export const requireSuperAdmin = authorize(UserRole.SUPER_ADMIN);
export const requireRestaurantOwner = authorize(
  UserRole.RESTAURANT_OWNER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
);
export const requireDriver = authorize(
  UserRole.DELIVERY_DRIVER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
);
export const requireCustomer = authorize(
  UserRole.CUSTOMER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
);
