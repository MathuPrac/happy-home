import { z } from 'zod';
export {
  createRiderProfileSchema,
  updateRiderProfileSchema,
  toggleOnlineSchema,
  updateLocationSchema,
  adminPatchRiderSchema,
} from '../dtos/rider.dto';

export const riderParamsSchema = z.object({
  riderId: z.string().min(1, 'riderId is required'),
});

export const availableRidersQuerySchema = z.object({
  lat:    z.coerce.number().min(-90).max(90).optional(),
  lng:    z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().int().positive().max(50000).default(5000), // metres
});

export type RiderParams           = z.infer<typeof riderParamsSchema>;
export type AvailableRidersQuery  = z.infer<typeof availableRidersQuerySchema>;
