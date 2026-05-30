import { BaseRepository } from '../../../infrastructure/database/mongodb/base.repository';
import { RiderModel, type IRider } from '../entities/rider.entity';

export interface NearbyQuery {
  lat:    number;
  lng:    number;
  radius: number; // metres
}

export class RiderRepository extends BaseRepository<IRider> {
  constructor() {
    super(RiderModel);
  }

  // ── By userId ─────────────────────────────────────────────────────────────

  async findByUserId(userId: string): Promise<IRider | null> {
    return this.findOne({ userId });
  }

  async existsByUserId(userId: string): Promise<boolean> {
    return this.exists({ userId });
  }

  // ── Available riders (online + approved + no active order) ────────────────

  async findAvailable(nearby?: NearbyQuery): Promise<IRider[]> {
    const filter: Record<string, unknown> = {
      isOnline:      true,
      isApproved:    true,
      activeOrderId: { $exists: false },
    };

    if (nearby !== undefined) {
      // $nearSphere requires the 2dsphere index on currentLocation
      filter['currentLocation'] = {
        $nearSphere: {
          $geometry: {
            type:        'Point',
            coordinates: [nearby.lng, nearby.lat],
          },
          $maxDistance: nearby.radius,
        },
      };
    }

    return RiderModel.find(filter).lean() as unknown as Promise<IRider[]>;
  }

  // ── Assign / unassign active order ────────────────────────────────────────

  async assignOrder(riderId: string, orderId: string): Promise<IRider | null> {
    return RiderModel.findByIdAndUpdate(
      riderId,
      { activeOrderId: orderId },
      { new: true },
    ).lean() as unknown as Promise<IRider | null>;
  }

  async clearActiveOrder(riderId: string): Promise<IRider | null> {
    return RiderModel.findByIdAndUpdate(
      riderId,
      { $unset: { activeOrderId: '' } },
      { new: true },
    ).lean() as unknown as Promise<IRider | null>;
  }

  // ── Location update ───────────────────────────────────────────────────────

  async updateLocation(
    riderId: string,
    lat:     number,
    lng:     number,
  ): Promise<IRider | null> {
    return RiderModel.findByIdAndUpdate(
      riderId,
      {
        currentLocation: {
          type:        'Point',
          coordinates: [lng, lat],
        },
      },
      { new: true },
    ).lean() as unknown as Promise<IRider | null>;
  }
}
