import { Router } from 'express';
import { CartController } from './controllers/cart.controller';
import { authenticate, requireCustomer } from '@/core/middleware/auth.middleware';

const router = Router();
const controller = new CartController();

router.use(authenticate, requireCustomer);

router.get('/', (req, res) => controller.getCart(req as any, res));
router.post('/items', (req, res) => controller.addItem(req as any, res));
router.patch('/items/:menuItemId', (req, res) => controller.updateItem(req as any, res));
router.delete('/items/:menuItemId', (req, res) => controller.removeItem(req as any, res));
router.delete('/', (req, res) => controller.clearCart(req as any, res));

export { router as cartRouter };