import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { JwtService } from '../services/jwt.service';
import { HttpStatus } from '@/core/errors';
import type { LoginDto, RegisterDto, RefreshDto } from '../validations/auth.validators';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body as RegisterDto);
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
      const { user, tokens } = await authService.login(req.body as LoginDto);
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
      const tokens = await authService.refresh((req.body as RefreshDto).refreshToken);
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
      const token = JwtService.extractBearerToken(req.headers.authorization);
      if (token) await authService.logout(token);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      res.status(HttpStatus.OK).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
