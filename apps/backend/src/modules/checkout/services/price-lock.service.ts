import { createLogger } from '@/shared/utils/logger';
import { BadRequestError } from '@/core/errors';
import type { CartItem } from '@restaurant/shared-types';

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
        warnings.push(`"${item.name}" is no longer available and was removed`);
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