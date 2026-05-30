import { Schema, model, type Document } from 'mongoose';

export enum VehicleType {
  BICYCLE    = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  CAR        = 'car',
  VAN        = 'van',
}

export interface ILocation {
  type:        'Point';
  coordinates: [number, number]; // [lng, lat] — GeoJSON order
}

export interface IRider extends Document {
  userId:          string;   // ref → User._id
  vehicleType:     VehicleType;
  licencePlate:    string;
  isOnline:        boolean;
  isApproved:      boolean;  // admin must approve before rider can go online
  currentLocation?: ILocation;
  rating:          number;
  totalDeliveries: number;
  activeOrderId?:  string;   // currently assigned order, if any
}

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const locationSchema = new Schema<ILocation>(
  {
    type:        { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false },
);

// ── Main schema ───────────────────────────────────────────────────────────────

const riderSchema = new Schema<IRider>(
  {
    userId:       { type: String, required: true, unique: true, index: true },
    vehicleType:  { type: String, enum: Object.values(VehicleType), required: true },
    licencePlate: { type: String, required: true, trim: true },
    isOnline:     { type: Boolean, required: true, default: false, index: true },
    isApproved:   { type: Boolean, required: true, default: false, index: true },
    currentLocation: { type: locationSchema },
    rating:          { type: Number, required: true, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, required: true, default: 0, min: 0 },
    activeOrderId:   { type: String },
  },
  { timestamps: true },
);

// 2dsphere index for geo queries — find nearby available riders
riderSchema.index({ currentLocation: '2dsphere' });
// Compound — dispatch query: online + approved + no active order
riderSchema.index({ isOnline: 1, isApproved: 1, activeOrderId: 1 });

export const RiderModel = model<IRider>('Rider', riderSchema);
