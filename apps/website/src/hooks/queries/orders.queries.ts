import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginationQuery } from '@restaurant/shared-types';
import { ordersApi } from '@/services/api/orders.api';

export const orderKeys = {
  all: ['orders'] as const,
  mine: (query: PaginationQuery) => [...orderKeys.all, 'mine', query] as const,
  detail: (id: string) => [...orderKeys.all, id] as const,
};

export function useMyOrders(query: PaginationQuery) {
  return useQuery({
    queryKey: orderKeys.mine(query),
    queryFn: () => ordersApi.getMyOrders(query),
    enabled: Boolean(process.env.NEXT_PUBLIC_API_URL),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: Boolean(id && process.env.NEXT_PUBLIC_API_URL),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => ordersApi.createOrder(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
