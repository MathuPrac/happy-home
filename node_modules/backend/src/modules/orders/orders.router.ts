import { Router } from 'express';
import { OrdersController } from './controllers/orders.controller';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderEventService } from './events/order-event.service';
import { CacheService } from '@/infrastructure/cache/redis';
import { authenticate, authorize, requireCustomer } from '@/core/middleware/auth.middleware';
import { UserRole } from '@restaurant/shared-types';
import type { AuthenticatedRequest } from '@/types';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export function createOrdersRouter(gateway?: SocketGateway, sharedEventService?: OrderEventService): Router {
  const router = Router();

  const orderRepo = new OrderRepository();
  const cache = new CacheService();

  const eventService = sharedEventService ?? new OrderEventService();

  if (!sharedEventService && gateway) {
    eventService.registerPublisher(gateway.orderEventPublisher);
  }

  const orderService = new OrderService(orderRepo, cache, eventService);
  const controller = new OrdersController(orderService);

  router.post(
    '/',
    authenticate,
    authorize(UserRole.CUSTOMER, UserRole.ADMIN),
    (req, res) => controller.createOrder(req as AuthenticatedRequest, res),
  );
  router.get(
    '/my',
    authenticate,
    requireCustomer,
    (req, res) => controller.getMyOrders(req as AuthenticatedRequest, res),
  );
  router.get(
    '/:id',
    authenticate,
    (req, res) => controller.getOrder(req as AuthenticatedRequest, res),
  );
  router.patch(
    '/:id/status',
    authenticate,
    (req, res) => controller.updateStatus(req as AuthenticatedRequest, res),
  );
  router.patch(
    '/:id/assign-rider',
    authenticate,
    authorize(UserRole.ADMIN, UserRole.RESTAURANT_OWNER),
    (req, res) => controller.assignRider(req as AuthenticatedRequest, res),
  );
  router.post(
    '/:id/cancel',
    authenticate,
    (req, res) => controller.cancelOrder(req as AuthenticatedRequest, res),
  );

  return router;
}