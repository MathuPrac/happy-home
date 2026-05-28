import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { CheckoutService } from '../services/checkout.service';
import { CartService } from '@/modules/cart/services/cart.service';
import { OrderService } from '@/modules/orders/services/order.service';
import { OrderRepository } from '@/modules/orders/repositories/order.repository';
import { OrderEventService } from '@/modules/orders/events/order-event.service';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { created } from '@/shared/http/response';
import { checkoutSchema } from '../validations/checkout.validators';
import { ValidationError } from '@/core/errors/app-error';

export class CheckoutController {
  private readonly service: CheckoutService;

  constructor(eventService: OrderEventService) {
    const cache = new CacheService();
    const cartService = new CartService(cache);
    const orderService = new OrderService(
      new OrderRepository(),
      cache,
      eventService,
    );
    this.service = new CheckoutService(cartService, orderService);
  }

  checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const result = await this.service.checkout(req.user.sub, parsed.data);
    created(res, result);
  };
}
