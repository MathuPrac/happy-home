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

  async clearCartAfterOrder(customerId: string): Promise<void> {
    await this.clearCart(customerId);
  }
}