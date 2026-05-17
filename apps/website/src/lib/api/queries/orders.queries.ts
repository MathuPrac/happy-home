import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../orders.api';
import type { PaginationQuery } from '@restaurant/shared-types';

export const orderKeys = {
  all: ['orders'] as const,
  mine: (query: PaginationQuery) => [...orderKeys.all, 'mine', query] as const,
  detail: (id: string) => [...orderKeys.all, id] as const,
};

export function useMyOrders(query: PaginationQuery) {
  return useQuery({
    queryKey: orderKeys.mine(query),
    queryFn: () => ordersApi.getMyOrders(query),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
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
