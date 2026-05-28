import { Router } from 'express';
import { CheckoutController } from './controllers/checkout.controller';
import { authenticate, requireCustomer } from '@/core/middleware/auth.middleware';
import { OrderEventService } from '@/modules/orders/events/order-event.service';
import type { AuthenticatedRequest } from '@/types';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export function createCheckoutRouter(gateway?: SocketGateway, sharedEventService?: OrderEventService): Router {
  const router = Router();

  const eventService = sharedEventService ?? new OrderEventService();

  if (!sharedEventService && gateway) {
    eventService.registerPublisher(gateway.orderEventPublisher);
  }

  const controller = new CheckoutController(eventService);

  router.post(
    '/',
    authenticate,
    requireCustomer,
    (req, res) => controller.checkout(req as AuthenticatedRequest, res),
  );

  return router;
}