import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '@/core/middleware/auth.middleware';
import { validate } from '@/core/middleware/validate.middleware';
import { authRateLimiter } from '@/core/middleware/rate-limiter.middleware';
import { loginSchema, refreshSchema, registerSchema } from '../validations/auth.validators';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), (req, res, next) =>
  void authController.register(req, res, next),
);

router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) =>
  void authController.login(req, res, next),
);

router.post('/refresh', authRateLimiter, validate(refreshSchema), (req, res, next) =>
  void authController.refresh(req, res, next),
);

router.post('/logout', authenticate, (req, res, next) => void authController.logout(req, res, next));

router.get('/me', authenticate, (req, res, next) => void authController.me(req, res, next));

export default router;
