import { z } from 'zod';
import { CuisineType } from '../entities/restaurant.entity';

// ── Reusable sub-schemas ──────────────────────────────────────────────────────

/** HH:MM 24-hour string, e.g. '08:00' */
const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:MM 24-hour format (e.g. 08:00)');

export const openingHourSlotSchema = z.object({
  open:   timeStringSchema,
  close:  timeStringSchema,
  closed: z.boolean().default(false),
});

export const openingHoursSchema = z.object({
  monday:    openingHourSlotSchema,
  tuesday:   openingHourSlotSchema,
  wednesday: openingHourSlotSchema,
  thursday:  openingHourSlotSchema,
  friday:    openingHourSlotSchema,
  saturday:  openingHourSlotSchema,
  sunday:    openingHourSlotSchema,
});

export const addressSchema = z.object({
  street:     z.string().min(1, 'Street is required').max(200),
  city:       z.string().min(1, 'City is required').max(100),
  state:      z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country:    z.string().min(1).max(100).default('Sri Lanka'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

// ── Create ────────────────────────────────────────────────────────────────────

export const createRestaurantSchema = z.object({
  name:          z.string().min(1, 'Name is required').max(200),
  description:   z.string().min(1, 'Description is required').max(2000),
  cuisineType:   z.nativeEnum(CuisineType),
  address:       addressSchema,
  openingHours:  openingHoursSchema,
  coverImageUrl: z.string().url('Must be a valid URL').optional(),
  logoUrl:       z.string().url('Must be a valid URL').optional(),
  phone:         z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number')
    .optional(),
  minimumOrder:  z.number().min(0).default(0),
  deliveryFee:   z.number().min(0).default(0),
  estimatedDeliveryMinutes: z.number().int().min(1).default(30),
});

// ── Update — all fields optional ─────────────────────────────────────────────

export const updateRestaurantSchema = createRestaurantSchema.partial();

// ── Admin-only patch (verification / activation) ──────────────────────────────

export const adminPatchRestaurantSchema = z.object({
  isVerified: z.boolean().optional(),
  isActive:   z.boolean().optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CreateRestaurantDto   = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantDto   = z.infer<typeof updateRestaurantSchema>;
export type AdminPatchRestaurantDto = z.infer<typeof adminPatchRestaurantSchema>;
