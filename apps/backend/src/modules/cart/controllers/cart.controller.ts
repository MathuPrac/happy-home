import type { Response } from 'express';
import { CartService } from '../services/cart.service';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { ok, noContent } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';
import { addToCartSchema, updateCartItemSchema } from '../validations/cart.validators';
import { ValidationError } from '@/core/errors/app-error';

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
    const parsed = addToCartSchema.safeParse({ body: req.body });
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const cart = await this.service.addItem(req.user.sub, parsed.data.body);
    ok(res, cart);
  };

  updateItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const parsed = updateCartItemSchema.safeParse({ params: req.params, body: req.body });
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const cart = await this.service.updateItemQuantity(
      req.user.sub,
      req.params.menuItemId,
      parsed.data.body.quantity,
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
