import { z } from 'zod';
import { VehicleType } from '../entities/rider.entity';

// ── Create profile (called by RIDER after registration) ───────────────────────

export const createRiderProfileSchema = z.object({
  vehicleType:  z.nativeEnum(VehicleType),
  licencePlate: z.string().min(1, 'Licence plate is required').max(20).trim(),
});

// ── Update profile ────────────────────────────────────────────────────────────

export const updateRiderProfileSchema = createRiderProfileSchema.partial();

// ── Toggle online status ──────────────────────────────────────────────────────

export const toggleOnlineSchema = z.object({
  isOnline: z.boolean(),
});

// ── Update location (called periodically by rider app) ────────────────────────

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ── Admin approve / suspend ───────────────────────────────────────────────────

export const adminPatchRiderSchema = z.object({
  isApproved: z.boolean().optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CreateRiderProfileDto = z.infer<typeof createRiderProfileSchema>;
export type UpdateRiderProfileDto = z.infer<typeof updateRiderProfileSchema>;
export type ToggleOnlineDto       = z.infer<typeof toggleOnlineSchema>;
export type UpdateLocationDto     = z.infer<typeof updateLocationSchema>;
export type AdminPatchRiderDto    = z.infer<typeof adminPatchRiderSchema>;
