import type { Request, Response, NextFunction } from 'express';
import { UserRole, ROLE_HIERARCHY, type JwtAccessPayload } from '@/types';
import { jwtService, JwtService } from '@/modules/auth/services/jwt.service';
import { ForbiddenError, UnauthorizedError } from '@/core/errors';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = JwtService.extractBearerToken(req.headers.authorization);
    if (!token) throw new UnauthorizedError('Authentication token is required');

    const payload = await jwtService.verifyAccessToken(token);
    (req as Request & { user: JwtAccessPayload }).user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      next(new UnauthorizedError('User is not authenticated'));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(
        new ForbiddenError(
          `Access denied. Required roles: [${allowedRoles.join(', ')}]. Your role: ${user.role}`,
        ),
      );
      return;
    }

    next();
  };
}

export function authorizeMinRole(minimumRole: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('User is not authenticated'));
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      next(new ForbiddenError(`Insufficient permissions. Minimum role required: ${minimumRole}`));
      return;
    }

    next();
  };
}

export function authorizeSelfOrAdmin(paramName = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('User is not authenticated'));
      return;
    }

    const targetId = req.params[paramName];
    const isSelf = req.user.sub === targetId;
    const isAdmin = ROLE_HIERARCHY[req.user.role] >= ROLE_HIERARCHY[UserRole.ADMIN];

    if (!isSelf && !isAdmin) {
      next(new ForbiddenError('You can only access your own resources'));
      return;
    }

    next();
  };
}

export const requireAdmin = authorize(UserRole.ADMIN);
export const requireRestaurantOwner = authorize(UserRole.RESTAURANT_OWNER, UserRole.ADMIN);
export const requireRider = authorize(UserRole.RIDER, UserRole.ADMIN);
export const requireCustomer = authorize(UserRole.CUSTOMER, UserRole.ADMIN);
