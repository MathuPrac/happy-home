import { Router, Request, Response, NextFunction } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshSchema } from './auth.validators';

const router = Router();

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next));
router.post('/login',    authRateLimiter, validate(loginSchema),    (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next));
router.post('/refresh',  authRateLimiter, validate(refreshSchema),  (req: Request, res: Response, next: NextFunction) => authController.refresh(req, res, next));

// Protected routes
router.post('/logout', authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void, (req: Request, res: Response, next: NextFunction) => authController.logout(req, res, next));
router.get('/me',      authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void, (req: Request, res: Response, next: NextFunction) => authController.me(req, res, next));

export default router;
