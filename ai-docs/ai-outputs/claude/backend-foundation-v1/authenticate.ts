import { Response, NextFunction } from 'express';
import { jwtService, JwtService } from '../modules/auth/jwt.service';
import { UnauthorizedError } from '../shared/errors';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware: Verifies JWT access token and attaches payload to req.user.
 * Throws UnauthorizedError for missing, invalid, expired, or revoked tokens.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = JwtService.extractBearerToken(req.headers.authorization);
    if (!token) throw new UnauthorizedError('Authentication token is required');

    const payload = await jwtService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
