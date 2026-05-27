import type { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema } from '../dtos/create-order.dto';
import { ValidationError } from '@/core/errors/app-error';
import { OrderStatus } from '@restaurant/shared-types';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

const assignRiderSchema = z.object({
  riderId: z.string().min(1),
});

const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const order = await this.orderService.createOrder(req.user!.sub, parsed.data);
    res.status(201).json({ success: true, data: order, message: 'Order created successfully' });
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  }

  async getMyOrders(req: Request, res: Response): Promise<void> {
    const query = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };
    const result = await this.orderService.getCustomerOrders(req.user!.sub, query);
    res.json({ success: true, ...result });
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const updated = await this.orderService.updateOrderStatus(
      req.params.id,
      parsed.data.status,
      req.user!.sub,
    );
    res.json({ success: true, data: updated, message: 'Order status updated' });
  }

  async assignRider(req: Request, res: Response): Promise<void> {
    const parsed = assignRiderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const updated = await this.orderService.assignRider(
      req.params.id,
      parsed.data.riderId,
      req.user!.sub,
    );
    res.json({ success: true, data: updated, message: 'Rider assigned successfully' });
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    const parsed = cancelOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
          code: 'VALIDATION_ERROR',
        })),
      );
    }
    const updated = await this.orderService.cancelOrder(
      req.params.id,
      req.user!.sub,
      parsed.data.reason,
    );
    res.json({ success: true, data: updated, message: 'Order cancelled' });
  }
}