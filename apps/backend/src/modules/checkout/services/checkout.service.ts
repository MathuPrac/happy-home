import { createLogger } from '@/shared/utils/logger';
import { BadRequestError } from '@/core/errors';
import { CartService } from '@/modules/cart/services/cart.service';
import { OrderService } from '@/modules/orders/services/order.service';
import { config } from '@/config';
import type { CheckoutInput } from '../validations/checkout.validators';
import type { CheckoutResult } from '../dtos/checkout.dto';
import { PaymentMethod, PaymentStatus } from '@restaurant/shared-types';

const log = createLogger('CheckoutService');

const DELIVERY_FEE = 2.50;

// Stripe is initialised once at module load — synchronously via require
// so it is always ready before the first request arrives.
let stripe: import('stripe').Stripe | null = null;
try {
  if (config.stripe.secretKey) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe') as typeof import('stripe').default;
    stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-04-10' as const });
  }
} catch (err) {
  log.error('Failed to initialise Stripe', { error: err });
}

export class CheckoutService {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  async checkout(customerId: string, input: CheckoutInput): Promise<CheckoutResult> {
    const cart = await this.cartService.getCart(customerId);

    if (!cart.items.length) {
      throw new BadRequestError('Your cart is empty');
    }

    if (!cart.restaurantId) {
      throw new BadRequestError('Cart has no restaurant set');
    }

    // P1: Fail fast for CARD payments if Stripe is unavailable
    if (input.paymentMethod === PaymentMethod.CARD && !stripe) {
      throw new BadRequestError('Card payments are currently unavailable. Please use cash.');
    }

    // P6: Create the order first — order.total is the single source of truth
    const order = await this.orderService.createOrder(customerId, {
      restaurantId: cart.restaurantId,
      items: cart.items.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        customizations: i.customizations,
        subtotal: parseFloat(
          (
            (i.price + i.customizations.reduce((c, x) => c + x.price, 0)) *
            i.quantity
          ).toFixed(2),
        ),
      })),
      deliveryFee: DELIVERY_FEE,
      discount: 0,
      paymentMethod: input.paymentMethod,
      deliveryAddress: input.deliveryAddress,
      ...(input.notes ? { notes: input.notes } : {}),
    });

    let paymentClientSecret: string | undefined;
    let paymentStatus: string = PaymentStatus.PENDING;

    // P6: Use order.total for Stripe amount — no separate tax computation
    if (input.paymentMethod === PaymentMethod.CARD && stripe) {
      try {
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(order.total * 100),
          currency: 'usd',
          metadata: {
            customerId,
            restaurantId: cart.restaurantId,
            orderId: String(order._id),
          },
          automatic_payment_methods: { enabled: true },
        });
        paymentClientSecret = intent.client_secret ?? undefined;
        paymentStatus = PaymentStatus.PROCESSING;
        log.info('Stripe PaymentIntent created', { intentId: intent.id, total: order.total });
      } catch (err) {
        log.error('Stripe error during checkout', { error: err });
        throw new BadRequestError('Payment initialisation failed. Please try again.');
      }
    }

    await this.cartService.clearCartAfterOrder(customerId);
    log.info('Checkout complete', { customerId, orderId: String(order._id), total: order.total });

    return {
      order,
      ...(paymentClientSecret !== undefined ? { paymentClientSecret } : {}),
      paymentStatus,
      message: 'Order placed successfully',
    };
  }
}