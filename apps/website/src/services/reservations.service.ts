import type { ApiResponse } from '@restaurant/shared-types';
import { apiClient } from './api/client';

export interface ReservationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  date: string;
  guests: number;
  time: string;
  notes?: string;
}

/** Placeholder until backend reservations module is live. */
export const reservationsService = {
  async submitRequest(payload: ReservationRequest): Promise<ApiResponse<{ id: string }>> {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'Reservation request received',
        data: { id: 'demo-request' },
      };
    }

    const { data } = await apiClient.post<ApiResponse<{ id: string }>>(
      '/reservations',
      payload,
    );
    return data;
  },
};
