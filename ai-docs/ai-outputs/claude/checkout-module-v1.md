# Module 3: Checkout System — `checkout-module-v1`

## Purpose

Orchestrates the transition from a filled cart into a confirmed order. The Checkout module:
1. Reads the server-side cart from Redis
2. Validates items still exist and prices are accurate (price-lock)
3. Creates the Order via `OrderService`
4. Initiates a payment (mock Stripe intent by default, full Stripe flow optional)
5. Clears the cart on success
6. Emits real-time events via Socket.IO

This is a brand-new module. No skeleton exists in the backend.

---

## Architecture

```
apps/backend/src/modules/checkout/
├── controllers/
│   └── checkout.controller.ts
├── services/
│   ├── checkout.service.ts
│   └── price-lock.service.ts       ← validates current menu prices vs cart
├── dtos/
│   └── checkout.dto.ts
├── validations/
│   └── checkout.validators.ts
├── checkout.router.ts
└── index.ts
```

---

## Backend — New Files

### 1. `apps/backend/src/modules/checkout/dtos/checkout.dto.ts` — NEW

```typescript
import type { PaymentMethod } from '@restaurant/shared-types';

export interface CheckoutDto {
  paymentMethod: PaymentMethod;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  promoCode?: string;
}

export interface CheckoutResult {
  order: unknown;           // typed as IOrder at runtime
  paymentClientSecret?: string; // Stripe PaymentIntent client_secret (card payments)
  paymentStatus: string;
  message: string;
}
```

---

### 2. `apps/backend/src/modules/checkout/validations/checkout.validators.ts` — NEW

```typescript
import { z } from 'zod';
import { PaymentMethod } from '@restaurant/shared-types';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  coordinates: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
});

export const checkoutSchema = z.object({
  body: z.object({
    paymentMethod: z.nativeEnum(PaymentMethod),
    deliveryAddress: addressSchema,
    notes: z.string().max(500).optional(),
    promoCode: z.string().max(50).optional(),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>['body'];
```

---

### 3. `apps/backend/src/modules/checkout/services/price-lock.service.ts` — NEW

Validates cart item prices against current MongoDB menu prices. This prevents stale cart prices
from being charged if the restaurant updated prices while the customer had an open cart.

```typescript
import { createLogger } from '@/shared/utils/logger';
import { BadRequestError } from '@/core/errors';
import type { CartItem } from '@restaurant/shared-types';

// Import when menu module is implemented — placeholder interface for now
interface IMenuItemPrice {
  id: string;
  price: number;
  isAvailable: boolean;
}

type MenuPriceLookup = (menuItemIds: string[]) => Promise<IMenuItemPrice[]>;

const log = createLogger('PriceLockService');

export class PriceLockService {
  constructor(private readonly lookupPrices: MenuPriceLookup) {}

  async validateAndRecomputeCart(items: CartItem[]): Promise<{
    items: CartItem[];
    subtotal: number;
    warnings: string[];
  }> {
    const ids = [...new Set(items.map((i) => i.menuItemId))];
    const current = await this.lookupPrices(ids);

    const priceMap = new Map<string, IMenuItemPrice>(current.map((m) => [m.id, m]));
    const warnings: string[] = [];
    const recomputed: CartItem[] = [];

    for (const item of items) {
      const live = priceMap.get(item.menuItemId);

      if (!live) {
        log.warn('Menu item no longer exists', { menuItemId: item.menuItemId });
        warnings.push(`"${item.name}" is no longer available and was removed from your cart`);
        continue;
      }

      if (!live.isAvailable) {
        warnings.push(`"${item.name}" is currently unavailable and was removed`);
        continue;
      }

      if (live.price !== item.price) {
        log.info('Price changed during checkout', {
          menuItemId: item.menuItemId,
          oldPrice: item.price,
          newPrice: live.price,
        });
        warnings.push(
          `"${item.name}" price changed from $${item.price.toFixed(2)} to $${live.price.toFixed(2)}`,
        );
        recomputed.push({ ...item, price: live.price });
      } else {
        recomputed.push(item);
      }
    }

    if (recomputed.length === 0) {
      throw new BadRequestError('No valid items remain in cart after price validation');
    }

    const subtotal = parseFloat(
      recomputed
        .reduce((sum, item) => {
          const customTotal = item.customizations.reduce((c, x) => c + x.price, 0);
          return sum + (item.price + customTotal) * item.quantity;
        }, 0)
        .toFixed(2),
    );

    return { items: recomputed, subtotal, warnings };
  }
}
```

---

### 4. `apps/backend/src/modules/checkout/services/checkout.service.ts` — NEW

```typescript
import { createLogger } from '@/shared/utils/logger';
import { BadRequestError } from '@/core/errors';
import { CartService } from '@/modules/cart/services/cart.service';
import { OrderService } from '@/modules/orders/services/order.service';
import { config } from '@/config';
import type { CheckoutInput } from '../validations/checkout.validators';
import type { CheckoutResult } from '../dtos/checkout.dto';
import { PaymentMethod, PaymentStatus } from '@restaurant/shared-types';

const log = createLogger('CheckoutService');

// Stripe is optional — only initialise if key is present
let stripe: import('stripe').Stripe | null = null;
if (config.stripe.secretKey) {
  void import('stripe').then(({ default: Stripe }) => {
    stripe = new Stripe(config.stripe.secretKey!, { apiVersion: '2024-04-10' });
  });
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

    // --- Price Lock (optional — enable when menu module is live) ---
    // const priceLock = new PriceLockService(menuPriceLookup);
    // const { items, subtotal, warnings } = await priceLock.validateAndRecomputeCart(cart.items);
    // For now, trust cart prices:
    const items = cart.items;
    const warnings: string[] = [];

    // Hardcoded delivery fee; this will come from restaurant settings when that module is built
    const DELIVERY_FEE = 2.50;
    const subtotal = cart.subtotal;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + DELIVERY_FEE + tax).toFixed(2));

    let paymentClientSecret: string | undefined;
    let paymentStatus = PaymentStatus.PENDING;

    // Handle Stripe card payments
    if (input.paymentMethod === PaymentMethod.CARD && stripe) {
      try {
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // cents
          currency: 'usd',
          metadata: { customerId, restaurantId: cart.restaurantId },
          automatic_payment_methods: { enabled: true },
        });
        paymentClientSecret = intent.client_secret ?? undefined;
        paymentStatus = PaymentStatus.PROCESSING;
        log.info('Stripe PaymentIntent created', { intentId: intent.id, total });
      } catch (err) {
        log.error('Stripe error during checkout', { error: err });
        throw new BadRequestError('Payment initialisation failed. Please try again.');
      }
    }

    // Cash orders: immediately place the order
    if (input.paymentMethod === PaymentMethod.CASH) {
      paymentStatus = PaymentStatus.PENDING;
    }

    // Create the order
    const order = await this.orderService.createOrder(customerId, {
      restaurantId: cart.restaurantId,
      items: items.map((i) => ({
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

    // Clear cart after successful order creation
    await this.cartService.clearCartAfterOrder(customerId);
    log.info('Checkout complete', { customerId, orderId: order.id, total });

    const message =
      warnings.length > 0
        ? `Order placed. Note: ${warnings.join('; ')}`
        : 'Order placed successfully';

    return {
      order,
      paymentClientSecret,
      paymentStatus,
      message,
    };
  }
}
```

---

### 5. `apps/backend/src/modules/checkout/controllers/checkout.controller.ts` — NEW

```typescript
import type { Response } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { CartService } from '@/modules/cart/services/cart.service';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { created } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';
import type { OrderEventService } from '@/modules/orders/services/order-event.service';
import { OrderService } from '@/modules/orders/services/order.service';
import { OrderRepository } from '@/modules/orders/repositories/order.repository';

export class CheckoutController {
  private readonly service: CheckoutService;

  constructor(orderEventService: OrderEventService) {
    const cache = new CacheService();
    const cartService = new CartService(cache);
    const orderService = new OrderService(new OrderRepository(), cache, orderEventService);
    this.service = new CheckoutService(cartService, orderService);
  }

  checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.checkout(req.user.sub, req.body);
    created(res, result);
  };
}
```

---

### 6. `apps/backend/src/modules/checkout/checkout.router.ts` — NEW

```typescript
import { Router } from 'express';
import { CheckoutController } from './controllers/checkout.controller';
import { authenticate, requireCustomer } from '@/core/middleware/auth.middleware';
import { validate } from '@/core/middleware/validate.middleware';
import { checkoutSchema } from './validations/checkout.validators';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { OrderEventService } from '@/modules/orders/services/order-event.service';

export function createCheckoutRouter(gateway: SocketGateway): Router {
  const router = Router();
  const eventService = new OrderEventService(gateway);
  const controller = new CheckoutController(eventService);

  router.post('/', authenticate, requireCustomer, validate(checkoutSchema), controller.checkout);

  return router;
}
```

---

### 7. `apps/backend/src/modules/checkout/index.ts` — NEW

```typescript
export { createCheckoutRouter } from './checkout.router';
export { CheckoutService } from './services/checkout.service';
```

---

## Existing File Changes

### `apps/backend/src/app.ts` — ADD checkout route

```typescript
import { createCheckoutRouter } from '@/modules/checkout';
// Inside applyRoutes(app, gateway):
app.use(`${apiPrefix}/checkout`, createCheckoutRouter(gateway));
```

---

## API Routes

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/api/v1/checkout` | ✅ | CUSTOMER | Initiate checkout from cart |

**Request body:**
```json
{
  "paymentMethod": "card",
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Colombo",
    "state": "WP",
    "postalCode": "00300",
    "country": "LK"
  },
  "notes": "Extra napkins please"
}
```

**Response (card):**
```json
{
  "success": true,
  "data": {
    "order": { "id": "...", "status": "pending", "total": 16.54 },
    "paymentClientSecret": "pi_xxx_secret_xxx",
    "paymentStatus": "processing",
    "message": "Order placed successfully"
  }
}
```

**Response (cash):**
```json
{
  "success": true,
  "data": {
    "order": { "id": "...", "status": "pending", "total": 16.54 },
    "paymentStatus": "pending",
    "message": "Order placed successfully"
  }
}
```

---

## Frontend Integration

### Customer App — `apps/customer-app/app/checkout.tsx` — REPLACE existing stub

```tsx
import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@restaurant/api-client';
import { useCart } from '@/hooks/useCart';
import { Screen } from '@/components/layout/Screen';

type PaymentMethod = 'card' | 'cash';

export default function CheckoutScreen() {
  const { data: cart } = useCart();
  const qc = useQueryClient();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Colombo');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const checkout = useMutation({
    mutationFn: () =>
      apiClient
        .post('/checkout', {
          paymentMethod,
          deliveryAddress: {
            street,
            city,
            state: 'WP',
            postalCode: '00300',
            country: 'LK',
          },
          notes: notes || undefined,
        })
        .then((r) => r.data.data),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['cart'] });
      void qc.invalidateQueries({ queryKey: ['orders', 'my'] });
      // Navigate to order tracking
      router.replace(`/orders/${(result.order as { id: string }).id}`);
    },
    onError: (err: Error) => {
      Alert.alert('Checkout failed', err.message);
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <Screen>
        <Text style={styles.empty}>Your cart is empty</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street address"
        placeholderTextColor="#8a8078"
        value={street}
        onChangeText={setStreet}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        placeholderTextColor="#8a8078"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.payRow}>
        {(['cash', 'card'] as PaymentMethod[]).map((m) => (
          <Pressable
            key={m}
            style={[styles.payBtn, paymentMethod === m && styles.payBtnActive]}
            onPress={() => setPaymentMethod(m)}
          >
            <Text style={[styles.payText, paymentMethod === m && styles.payTextActive]}>
              {m === 'cash' ? '💵 Cash' : '💳 Card'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any special requests…"
        placeholderTextColor="#8a8078"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryRow}>Subtotal: ${cart.subtotal.toFixed(2)}</Text>
        <Text style={styles.summaryRow}>Delivery: $2.50</Text>
        <Text style={styles.summaryRow}>Tax (8%): ${(cart.subtotal * 0.08).toFixed(2)}</Text>
        <Text style={styles.total}>
          Total: ${(cart.subtotal + 2.5 + cart.subtotal * 0.08).toFixed(2)}
        </Text>
      </View>

      <Pressable
        style={[styles.btn, checkout.isPending && styles.btnDisabled]}
        onPress={() => checkout.mutate()}
        disabled={checkout.isPending || !street.trim()}
      >
        {checkout.isPending ? (
          <ActivityIndicator color="#1a1410" />
        ) : (
          <Text style={styles.btnText}>Place Order</Text>
        )}
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  empty: { color: '#8a8078', fontSize: 16, textAlign: 'center', marginTop: 40 },
  label: { color: '#8a8078', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#2a221c',
    borderRadius: 10,
    padding: 14,
    color: '#f5f0e8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  payRow: { flexDirection: 'row', gap: 12 },
  payBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2a221c',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  payBtnActive: { borderColor: '#d4a853', backgroundColor: 'rgba(212,168,83,0.1)' },
  payText: { color: '#8a8078', fontSize: 14 },
  payTextActive: { color: '#d4a853', fontWeight: '600' },
  summary: {
    marginTop: 24,
    backgroundColor: '#2a221c',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  summaryRow: { color: '#8a8078', fontSize: 14 },
  total: { color: '#f5f0e8', fontSize: 18, fontWeight: '700', marginTop: 8 },
  btn: {
    marginTop: 20,
    backgroundColor: '#d4a853',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#1a1410', fontSize: 16, fontWeight: '700' },
});
```

---

## Environment Variables

**Optional Stripe integration:**
```
STRIPE_SECRET_KEY=sk_test_...     # already in config/index.ts
STRIPE_WEBHOOK_SECRET=whsec_...   # for webhook verification (future)
```

When `STRIPE_SECRET_KEY` is absent, card payments will receive a `paymentClientSecret: undefined`
and the frontend should handle accordingly (disable card option or show message).

---

## Dependencies

**No new dependencies for cash flow.** For Stripe card flow:
- `stripe` is already in `apps/backend/package.json`

---

## Integration Steps

1. Create all checkout module files
2. Register `createCheckoutRouter(gateway)` in `app.ts`
3. Ensure cart module is already integrated (depends on `CartService`)
4. Ensure orders module is already integrated (depends on `OrderService`, `OrderEventService`)
5. Replace `checkout.tsx` in customer-app
6. Test full flow: add to cart → checkout → order created → cart cleared

---

## Testing Flow

```bash
# 1. Login as customer
POST /api/v1/auth/login → token

# 2. Add items to cart
POST /api/v1/cart/items  (2 items, same restaurant)

# 3. Checkout
POST /api/v1/checkout
Authorization: Bearer <token>
{
  "paymentMethod": "cash",
  "deliveryAddress": { "street": "55 Galle Road", "city": "Colombo", "state": "WP", "postalCode": "00300", "country": "LK" }
}

# Expected:
# → 201 with order object, cart cleared (GET /api/v1/cart shows empty)
# → WebSocket: restaurant room receives 'order:new' event
# → Customer can track via GET /api/v1/orders/:orderId

# 4. Test empty cart checkout
DELETE /api/v1/cart
POST /api/v1/checkout  (same body)
# → 400 "Your cart is empty"

# 5. Test Stripe (if key set)
POST /api/v1/checkout  { paymentMethod: "card", ... }
# → 201 with paymentClientSecret  (use Stripe.js to confirm on frontend)
```