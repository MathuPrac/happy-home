import type { Request, Response } from 'express';
import type { ApiResponse } from '@restaurant/shared-types';
import { OrderService } from '../services/order.service';
import { createOrderSchema } from '../dtos/create-order.dto';
import { ValidationError } from '../../../core/errors/app-error';

export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);

    const order = await this.orderService.createOrder(req.user!.userId, parsed.data);
    const response: ApiResponse = { success: true, data: order, message: 'Order created successfully' };
    res.status(201).json(response);
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  }

  async getMyOrders(req: Request, res: Response): Promise<void> {
    const query = { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 };
    const result = await this.orderService.getCustomerOrders(req.user!.userId, query);
    res.json({ success: true, ...result });
  }
}
