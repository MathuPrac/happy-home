import { Router } from 'express';
import { CartController } from './controllers/cart.controller';
import { authenticate, requireCustomer } from '@/core/middleware/auth.middleware';
import type { AuthenticatedRequest } from '@/types';

const router = Router();
const controller = new CartController();

router.use(authenticate, requireCustomer);

router.get('/', (req, res) => controller.getCart(req as AuthenticatedRequest, res));
router.post('/items', (req, res) => controller.addItem(req as AuthenticatedRequest, res));
router.patch('/items/:menuItemId', (req, res) => controller.updateItem(req as AuthenticatedRequest, res));
router.delete('/items/:menuItemId', (req, res) => controller.removeItem(req as AuthenticatedRequest, res));
router.delete('/', (req, res) => controller.clearCart(req as AuthenticatedRequest, res));

export { router as cartRouter };
