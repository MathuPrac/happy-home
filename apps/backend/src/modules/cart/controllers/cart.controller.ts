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