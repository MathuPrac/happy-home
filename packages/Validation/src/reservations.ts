import { z } from 'zod';

export const reservationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  guests: z.number().int().min(1).max(12),
  notes: z.string().max(500).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
