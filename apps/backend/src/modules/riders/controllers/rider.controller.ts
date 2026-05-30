import { z } from 'zod';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ValidationError } from '@/core/errors/app-error';
import { ok, created } from '@/shared/http/response';
import type { RiderService } from '../services/rider.service';
import type { NearbyQuery } from '../repositories/rider.repository';
import {
  createRiderProfileSchema,
  updateRiderProfileSchema,
  toggleOnlineSchema,
  updateLocationSchema,
  adminPatchRiderSchema,
  riderParamsSchema,
  availableRidersQuerySchema,
} from '../validations/rider.validators';

function parseOrThrow<S extends z.ZodSchema>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        field:   issue.path.join('.') || 'root',
        message: issue.message,
        code:    'VALIDATION_ERROR',
      })),
    );
  }
  return result.data as z.output<S>;
}

export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  // POST /riders/profile
  async createProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto = parseOrThrow(createRiderProfileSchema, req.body);
    const rider = await this.riderService.createProfile(dto, req.user.sub);
    created(res, rider);
  }

  // GET /riders/profile
  async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const rider = await this.riderService.getMyProfile(req.user.sub);
    ok(res, rider);
  }

  // PATCH /riders/profile
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto = parseOrThrow(updateRiderProfileSchema, req.body);
    const rider = await this.riderService.updateProfile(dto, req.user.sub);
    ok(res, rider);
  }

  // PATCH /riders/status
  async setOnlineStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { isOnline } = parseOrThrow(toggleOnlineSchema, req.body);
    const rider = await this.riderService.setOnlineStatus(isOnline, req.user.sub);
    ok(res, rider);
  }

  // PATCH /riders/location
  async updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { lat, lng } = parseOrThrow(updateLocationSchema, req.body);
    const rider = await this.riderService.updateLocation(lat, lng, req.user.sub);
    ok(res, rider);
  }

  // GET /riders/available
  async getAvailableRiders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = parseOrThrow(availableRidersQuerySchema, req.query);

    const nearby: NearbyQuery | undefined =
      parsed.lat !== undefined && parsed.lng !== undefined
        ? { lat: parsed.lat, lng: parsed.lng, radius: parsed.radius }
        : undefined;

    const riders = await this.riderService.getAvailableRiders(nearby);
    ok(res, riders);
  }

  // GET /riders/:riderId
  async getRiderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { riderId } = parseOrThrow(riderParamsSchema, req.params);
    const rider = await this.riderService.getRiderById(riderId);
    ok(res, rider);
  }

  // PATCH /riders/:riderId/admin
  async adminPatchRider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { riderId } = parseOrThrow(riderParamsSchema, req.params);
    const dto         = parseOrThrow(adminPatchRiderSchema, req.body);
    const rider = await this.riderService.adminPatchRider(riderId, dto, req.user.sub);
    ok(res, rider);
  }
}
