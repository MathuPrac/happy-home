import { OrderStatus } from '@restaurant/shared-types';

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  cancelReason?: string;
  riderId?: string;
}
