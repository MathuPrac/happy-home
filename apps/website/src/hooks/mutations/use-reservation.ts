'use client';

import { useMutation } from '@tanstack/react-query';
import {
  reservationsService,
  type ReservationRequest,
} from '@/services/reservations.service';

export function useReservationRequest() {
  return useMutation({
    mutationFn: (payload: ReservationRequest) => reservationsService.submitRequest(payload),
  });
}
