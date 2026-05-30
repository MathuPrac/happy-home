# Payments Module — Integration Patches
# Four files need editing after dropping the module in.

## ─────────────────────────────────────────────────────────────────────────────
## PATCH 1 — apps/backend/src/modules/orders/services/order.service.ts
## Add updatePaymentStatus() so the webhook handler can update paymentStatus
## without a full status-transition check.
## Add after the cancelOrder() method, before the private isValidTransition():
## ─────────────────────────────────────────────────────────────────────────────

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      this.logger.warn(`updatePaymentStatus: order not found: ${orderId}`);
      return;
    }

    await this.orderRepo.update(orderId, { paymentStatus });

    this.logger.info(
      `Order ${orderId} paymentStatus updated to ${paymentStatus}`,
    );

    // Bust customer order cache
    await this.cache.del(`orders:customer:${order.customerId}`);

    // Auto-confirm PENDING orders on successful payment
    if (
      paymentStatus === PaymentStatus.PAID &&
      order.status === OrderStatus.PENDING &&
      this.isValidTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)
    ) {
      await this.updateOrderStatus(orderId, OrderStatus.CONFIRMED, 'system:payment');
    }
  }

# Make sure PaymentStatus and OrderStatus are imported at the top of order.service.ts.
# They already come from @restaurant/shared-types — just add PaymentStatus to the import:
#
#   import { UserRole, OrderStatus, PaymentStatus } from '@restaurant/shared-types';


## ─────────────────────────────────────────────────────────────────────────────
## PATCH 2 — apps/backend/src/modules/checkout/services/checkout.service.ts
## After creating the order, create a Payment record.
## ─────────────────────────────────────────────────────────────────────────────

# Add import at the top:
  import { PaymentService } from '@/modules/payments/services/payment.service';
  import { PaymentRepository } from '@/modules/payments/repositories/payment.repository';

# Add paymentService as a constructor dependency:
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly priceLockService: PriceLockService,
+   private readonly paymentService: PaymentService,
  ) {}

# In the checkout() method, AFTER `await this.cartService.clearCartAfterOrder(customerId);`
# and BEFORE the return statement, add:

    // Create Payment record
    if (input.paymentMethod === PaymentMethod.CASH) {
      await this.paymentService.createCashPayment({
        orderId:   String(order._id),
        customerId,
        amount:    order.total,
      });
    } else if (
      input.paymentMethod === PaymentMethod.CARD &&
      paymentClientSecret !== undefined &&
      stripeIntentId !== undefined
    ) {
      await this.paymentService.createStripePayment({
        orderId:               String(order._id),
        customerId,
        amount:                order.total,
        stripePaymentIntentId: stripeIntentId,
        stripeClientSecret:    paymentClientSecret,
      });
    }

# Also capture intent.id when creating the PaymentIntent so you can pass it above.
# In the Stripe block, add:
    let stripeIntentId: string | undefined;
    // ... inside the try block after `const intent = await stripe.paymentIntents.create(...)`:
    stripeIntentId      = intent.id;
    paymentClientSecret = intent.client_secret ?? undefined;


## ─────────────────────────────────────────────────────────────────────────────
## PATCH 3 — apps/backend/src/modules/checkout/checkout.router.ts
## Pass a PaymentService instance into CheckoutService.
## ─────────────────────────────────────────────────────────────────────────────

# Add imports:
  import { PaymentService }    from '@/modules/payments/services/payment.service';
  import { PaymentRepository } from '@/modules/payments/repositories/payment.repository';

# In createCheckoutRouter(), before constructing CheckoutService:
  const paymentRepo    = new PaymentRepository();
  const paymentService = new PaymentService(paymentRepo);

# Update CheckoutService construction:
- const checkoutService = new CheckoutService(cartService, orderService, priceLockService);
+ const checkoutService = new CheckoutService(cartService, orderService, priceLockService, paymentService);


## ─────────────────────────────────────────────────────────────────────────────
## PATCH 4 — apps/backend/src/app.ts
## Wire the payments router with the shared orderService instance.
## ─────────────────────────────────────────────────────────────────────────────

# Replace:
  import { paymentsRouter } from '@/modules/payments/payments.router';

# With:
  import { createPaymentsRouter } from '@/modules/payments/payments.router';

# The eventService and gateway are already created before the route mounts.
# You need to expose the orderService instance. Currently it is created inside
# createOrdersRouter() — extract it to app.ts scope:
#
#   Option A (simplest): create OrderService once in app.ts and pass it in:
#
#   import { OrderRepository } from '@/modules/orders/repositories/order.repository';
#   import { OrderService }    from '@/modules/orders/services/order.service';
#   import { CacheService }    from '@/infrastructure/cache/redis';
#
#   const orderRepo    = new OrderRepository();
#   const cache        = new CacheService();
#   const orderService = new OrderService(orderRepo, cache, eventService);
#
#   app.use(`${apiPrefix}/orders`,   createOrdersRouter(gateway, eventService, orderService));
#   app.use(`${apiPrefix}/checkout`, createCheckoutRouter(gateway, eventService, orderService));
#   app.use(`${apiPrefix}/payments`, createPaymentsRouter(orderService));
#
# This requires updating createOrdersRouter and createCheckoutRouter to accept
# an optional pre-built orderService — or just construct it inside and accept
# the slight duplication for now, and pass a second instance to createPaymentsRouter.
#
#   Option B (zero-change to orders/checkout routers — quickest):
#
#   Inside app.ts, construct a standalone OrderService just for payments:
#
#   import { OrderRepository } from '@/modules/orders/repositories/order.repository';
#   import { OrderService }    from '@/modules/orders/services/order.service';
#   import { CacheService }    from '@/infrastructure/cache/redis';
#
#   const sharedOrderRepo    = new OrderRepository();
#   const sharedCache        = new CacheService();
#   const sharedOrderService = new OrderService(sharedOrderRepo, sharedCache, eventService);
#
#   app.use(`${apiPrefix}/payments`, createPaymentsRouter(sharedOrderService));
#
# Both options are correct. Option B requires the fewest changes to existing files.


## ─────────────────────────────────────────────────────────────────────────────
## PATCH 5 — apps/backend/src/modules/index.ts
## Add the payments export:
## ─────────────────────────────────────────────────────────────────────────────

  export { createPaymentsRouter } from './payments';


## ─────────────────────────────────────────────────────────────────────────────
## ENV — apps/backend/.env  (add if not already present)
## ─────────────────────────────────────────────────────────────────────────────

  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...

# To get your webhook secret for local dev:
#   stripe listen --forward-to localhost:4000/api/v1/payments/webhook/stripe
# The CLI will print the whsec_ secret — paste it into .env.
