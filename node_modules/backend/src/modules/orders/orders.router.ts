import { Router } from 'express';
import { OrdersController } from './controllers/orders.controller';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { CacheService } from '@/infrastructure/cache/redis';
import { authenticate, authorize } from '@/core/middleware';
import { UserRole } from '@restaurant/shared-types';

const router = Router();

// Dependency injection composition root
const orderRepo = new OrderRepository();
const cache = new CacheService();
const orderService = new OrderService(orderRepo, cache);
const controller = new OrdersController(orderService);

router.post('/', authenticate, authorize(UserRole.CUSTOMER), (req, res) => controller.createOrder(req, res));
router.get('/my', authenticate, (req, res) => controller.getMyOrders(req, res));
router.get('/:id', authenticate, (req, res) => controller.getOrder(req, res));

export const ordersRouter = router;
