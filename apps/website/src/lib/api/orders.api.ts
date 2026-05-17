import type { Order, ApiResponse, PaginationQuery } from '@restaurant/shared-types';
import { apiClient } from './client';

export const ordersApi = {
  getMyOrders: async (query: PaginationQuery) => {
    const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders/my', { params: query });
    return data;
  },

  getOrder: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  createOrder: async (payload: unknown) => {
    const { data } = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return data.data;
  },
};
