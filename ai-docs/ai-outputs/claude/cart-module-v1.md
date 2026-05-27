# Module 2: Cart System — `cart-module-v1`

## Purpose

A Redis-backed, server-side cart that persists across sessions and devices. The cart lives in
Redis (not MongoDB) because it is ephemeral, write-heavy, and needs sub-millisecond reads.
It is completely new — no skeleton exists. The customer-app already has a local Redux cart slice
(`cart.slice.ts` referenced in ai-docs); this module replaces that with a server-authoritative
cart and a matching TanStack Query hook layer.

---

## Architecture

```
apps/backend/src/modules/cart/
├── controllers/
│   └── cart.controller.ts
├── services/
│   └── cart.service.ts
├── validations/
│   └── cart.validators.ts
├── cart.router.ts
└── index.ts

packages/types/src/cart.ts         ← NEW shared type
```

---

## Backend — New Files

### 1. `packages/types/src/cart.ts` — NEW

Add to the shared types package so frontend and backend share the same shape.

```typescript
export interface CartItemCustomization {
  customizationId: string;
  optionId: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: CartItemCustomization[];
  imageUrl?: string;
}

export interface Cart {
  customerId: string;
  restaurantId: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: string; // ISO
}
```

Also export from `packages/types/src/index.ts`:
```typescript
// Add to existing exports
export * from './cart';
```

---

### 2. `apps/backend/src/modules/cart/validations/cart.validators.ts` — NEW

```typescript
import { z } from 'zod';

const cartCustomizationSchema = z.object({
  customizationId: z.string().min(1),
  optionId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
});

export const addToCartSchema = z.object({
  body: z.object({
    menuItemId: z.string().min(1),
    restaurantId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive().max(20),
    customizations: z.array(cartCustomizationSchema).default([]),
    imageUrl: z.string().url().optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({ menuItemId: z.string().min(1) }),
  body: z.object({
    quantity: z.number().int().min(0).max(20), // 0 = remove
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
```

---

### 3. `apps/backend/src/modules/cart/services/cart.service.ts` — NEW

```typescript
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { BadRequestError } from '@/core/errors';
import { createLogger } from '@/shared/utils/logger';
import type { Cart, CartItem } from '@restaurant/shared-types';
import type { AddToCartInput } from '../validations/cart.validators';

const log = createLogger('CartService');

const CART_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function cartKey(customerId: string): string {
  return `cart:${customerId}`;
}

function computeSubtotal(items: CartItem[]): number {
  return parseFloat(
    items
      .reduce((sum, item) => {
        const customizationTotal = item.customizations.reduce((c, x) => c + x.price, 0);
        return sum + (item.price + customizationTotal) * item.quantity;
      }, 0)
      .toFixed(2),
  );
}

export class CartService {
  constructor(private readonly cache: CacheService) {}

  async getCart(customerId: string): Promise<Cart> {
    const raw = await this.cache.get<Cart>(cartKey(customerId));
    if (raw) return raw;

    return {
      customerId,
      restaurantId: null,
      items: [],
      subtotal: 0,
      itemCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  async addItem(customerId: string, input: AddToCartInput): Promise<Cart> {
    const cart = await this.getCart(customerId);

    // Enforce single-restaurant cart
    if (cart.restaurantId && cart.restaurantId !== input.restaurantId && cart.items.length > 0) {
      throw new BadRequestError(
        'Your cart already has items from a different restaurant. Please clear your cart first.',
      );
    }

    const existingIndex = cart.items.findIndex(
      (i) =>
        i.menuItemId === input.menuItemId &&
        JSON.stringify(i.customizations) === JSON.stringify(input.customizations),
    );

    if (existingIndex >= 0) {
      const existing = cart.items[existingIndex]!;
      const newQty = existing.quantity + input.quantity;
      if (newQty > 20) throw new BadRequestError('Maximum 20 of the same item per cart');
      cart.items[existingIndex] = { ...existing, quantity: newQty };
    } else {
      cart.items.push({
        menuItemId: input.menuItemId,
        restaurantId: input.restaurantId,
        name: input.name,
        price: input.price,
        quantity: input.quantity,
        customizations: input.customizations,
        ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      });
    }

    cart.restaurantId = input.restaurantId;
    cart.subtotal = computeSubtotal(cart.items);
    cart.itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
    cart.updatedAt = new Date().toISOString();

    await this.cache.set(cartKey(customerId), cart, CART_TTL_SECONDS);
    log.info('Item added to cart', { customerId, menuItemId: input.menuItemId });

    return cart;
  }

  async updateItemQuantity(
    customerId: string,
    menuItemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getCart(customerId);

    const idx = cart.items.findIndex((i) => i.menuItemId === menuItemId);
    if (idx < 0) throw new BadRequestError('Item not found in cart');

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx]!.quantity = quantity;
    }

    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    cart.subtotal = computeSubtotal(cart.items);
    cart.itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
    cart.updatedAt = new Date().toISOString();

    await this.cache.set(cartKey(customerId), cart, CART_TTL_SECONDS);
    return cart;
  }

  async removeItem(customerId: string, menuItemId: string): Promise<Cart> {
    return this.updateItemQuantity(customerId, menuItemId, 0);
  }

  async clearCart(customerId: string): Promise<void> {
    await this.cache.del(cartKey(customerId));
    log.info('Cart cleared', { customerId });
  }

  /** Called by CheckoutService after a successful order is placed */
  async clearCartAfterOrder(customerId: string): Promise<void> {
    await this.clearCart(customerId);
  }
}
```

---

### 4. `apps/backend/src/modules/cart/controllers/cart.controller.ts` — NEW

```typescript
import type { Response } from 'express';
import { CartService } from '../services/cart.service';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { ok, noContent } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';

export class CartController {
  private readonly service: CartService;

  constructor() {
    this.service = new CartService(new CacheService());
  }

  getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const cart = await this.service.getCart(req.user.sub);
    ok(res, cart);
  };

  addItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const cart = await this.service.addItem(req.user.sub, req.body);
    ok(res, cart);
  };

  updateItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const cart = await this.service.updateItemQuantity(
      req.user.sub,
      req.params.menuItemId,
      req.body.quantity as number,
    );
    ok(res, cart);
  };

  removeItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const cart = await this.service.removeItem(req.user.sub, req.params.menuItemId);
    ok(res, cart);
  };

  clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.service.clearCart(req.user.sub);
    noContent(res);
  };
}
```

---

### 5. `apps/backend/src/modules/cart/cart.router.ts` — NEW

```typescript
import { Router } from 'express';
import { CartController } from './controllers/cart.controller';
import { authenticate, requireCustomer } from '@/core/middleware/auth.middleware';
import { validate } from '@/core/middleware/validate.middleware';
import { addToCartSchema, updateCartItemSchema } from './validations/cart.validators';

const router = Router();
const controller = new CartController();

// All cart routes require customer auth
router.use(authenticate, requireCustomer);

router.get('/', controller.getCart);
router.post('/items', validate(addToCartSchema), controller.addItem);
router.patch('/items/:menuItemId', validate(updateCartItemSchema), controller.updateItem);
router.delete('/items/:menuItemId', controller.removeItem);
router.delete('/', controller.clearCart);

export { router as cartRouter };
```

---

### 6. `apps/backend/src/modules/cart/index.ts` — NEW

```typescript
export { cartRouter } from './cart.router';
export { CartService } from './services/cart.service';
```

---

## Existing File Changes

### `apps/backend/src/app.ts` — ADD cart route

```typescript
import { cartRouter } from '@/modules/cart';
// ...
app.use(`${apiPrefix}/cart`, cartRouter);
```

---

## API Routes

| Method | Path | Auth | Role |
|--------|------|------|------|
| `GET` | `/api/v1/cart` | ✅ | CUSTOMER |
| `POST` | `/api/v1/cart/items` | ✅ | CUSTOMER |
| `PATCH` | `/api/v1/cart/items/:menuItemId` | ✅ | CUSTOMER |
| `DELETE` | `/api/v1/cart/items/:menuItemId` | ✅ | CUSTOMER |
| `DELETE` | `/api/v1/cart` | ✅ | CUSTOMER |

---

## Frontend Integration

### Customer App — `apps/customer-app/hooks/useCart.ts` — NEW

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@restaurant/api-client';
import type { Cart, CartItem } from '@restaurant/shared-types';

const CART_KEY = ['cart'];

export function useCart() {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => apiClient.get<Cart>('/cart').then((r) => r.data.data!),
    staleTime: 30_000,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<CartItem, 'subtotal'>) =>
      apiClient.post<Cart>('/cart/items', item).then((r) => r.data.data!),
    onSuccess: (newCart) => {
      qc.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, quantity }: { menuItemId: string; quantity: number }) =>
      apiClient.patch<Cart>(`/cart/items/${menuItemId}`, { quantity }).then((r) => r.data.data!),
    onSuccess: (newCart) => {
      qc.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (menuItemId: string) =>
      apiClient.delete(`/cart/items/${menuItemId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete('/cart'),
    onSuccess: () => {
      qc.setQueryData(CART_KEY, {
        items: [],
        subtotal: 0,
        itemCount: 0,
        restaurantId: null,
      });
    },
  });
}
```

### Customer App — `apps/customer-app/app/cart.tsx` — REPLACE existing stub

```tsx
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '@/hooks/useCart';
import { Screen } from '@/components/layout/Screen';

export default function CartScreen() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  if (isLoading) return <Screen><Text style={styles.info}>Loading…</Text></Screen>;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <Screen>
      <Text style={styles.title}>Your Cart</Text>
      {isEmpty ? (
        <Text style={styles.info}>Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(i) => i.menuItemId}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() =>
                      item.quantity === 1
                        ? removeItem.mutate(item.menuItemId)
                        : updateItem.mutate({ menuItemId: item.menuItemId, quantity: item.quantity - 1 })
                    }
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() =>
                      updateItem.mutate({ menuItemId: item.menuItemId, quantity: item.quantity + 1 })
                    }
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
          <View style={styles.footer}>
            <Text style={styles.subtotal}>Subtotal: ${cart.subtotal.toFixed(2)}</Text>
            <Pressable
              style={styles.checkoutBtn}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  info: { color: '#8a8078', fontSize: 16, textAlign: 'center', marginTop: 40 },
  item: {
    backgroundColor: '#2a221c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  itemName: { color: '#f5f0e8', fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#d4a853', fontSize: 14, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3a2e26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#f5f0e8', fontSize: 18 },
  qty: { color: '#f5f0e8', fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  footer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  subtotal: { color: '#f5f0e8', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  checkoutBtn: {
    backgroundColor: '#d4a853',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  checkoutText: { color: '#1a1410', fontSize: 16, fontWeight: '700' },
});
```

---

## Shared Package Changes

`packages/types/src/cart.ts` — NEW (as above)
`packages/types/src/index.ts` — ADD `export * from './cart';`

---

## Environment Variables

No new vars. Cart TTL is hardcoded at 7 days; move to env if customisation needed:
```
CART_TTL_SECONDS=604800   # optional, default 7 days
```

---

## Dependencies

No new npm dependencies.

---

## Integration Steps

1. Create `packages/types/src/cart.ts` and update its `index.ts`
2. Create all backend cart module files
3. Register `cartRouter` in `app.ts`
4. Create `useCart.ts` hook in `customer-app`
5. Update `cart.tsx` screen
6. Rebuild `packages/types` (`npm run build` in that package) so dist is updated

---

## Testing Flow

```bash
# Authenticate as customer, get token

# Get empty cart
GET /api/v1/cart
# → { customerId, restaurantId: null, items: [], subtotal: 0, itemCount: 0 }

# Add item
POST /api/v1/cart/items
{ "menuItemId": "abc", "restaurantId": "r1", "name": "Burger", "price": 12.99, "quantity": 1, "customizations": [] }
# → cart with 1 item

# Add same item again
POST /api/v1/cart/items  (same body)
# → quantity becomes 2

# Try to add item from different restaurant
POST /api/v1/cart/items  { restaurantId: "r2", ... }
# → 400 "Your cart already has items from a different restaurant"

# Update quantity to 3
PATCH /api/v1/cart/items/abc   { quantity: 3 }

# Remove item (set quantity to 0)
PATCH /api/v1/cart/items/abc   { quantity: 0 }
# → cart empty, restaurantId null

# Clear cart
DELETE /api/v1/cart
# → 204
```