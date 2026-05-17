import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { jwtService } from './jwt.service';
import { HttpStatus } from '../../shared/errors';
import { AuthenticatedRequest } from '../../types';

// ── Auth Controller ───────────────────────────────────────────────────────────

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: { user, tokens },
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        data: { user, tokens },
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.refresh(req.body.refreshToken as string);
      res.status(HttpStatus.OK).json({
        success: true,
        data: { tokens },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtService.extractBearerToken(authHeader);
      if (token) await authService.logout(token);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      res.status(HttpStatus.OK).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}

// Needed for static method access in controller
import { JwtService } from './jwt.service';

export const authController = new AuthController();
