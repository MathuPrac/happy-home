import { Schema, model, type Document } from 'mongoose';

export enum CuisineType {
  CHINESE    = 'chinese',
  INDIAN     = 'indian',
  ITALIAN    = 'italian',
  JAPANESE   = 'japanese',
  KOREAN     = 'korean',
  MEXICAN    = 'mexican',
  MIDDLE_EASTERN = 'middle_eastern',
  SEAFOOD    = 'seafood',
  SRI_LANKAN = 'sri_lankan',
  THAI       = 'thai',
  WESTERN    = 'western',
  OTHER      = 'other',
}

export interface IOpeningHourSlot {
  open:   string; // 'HH:MM' 24-hour, e.g. '08:00'
  close:  string; // 'HH:MM' 24-hour, e.g. '22:00'
  closed: boolean;
}

export interface IOpeningHours {
  monday:    IOpeningHourSlot;
  tuesday:   IOpeningHourSlot;
  wednesday: IOpeningHourSlot;
  thursday:  IOpeningHourSlot;
  friday:    IOpeningHourSlot;
  saturday:  IOpeningHourSlot;
  sunday:    IOpeningHourSlot;
}

export interface IAddress {
  street:      string;
  city:        string;
  state:       string;
  postalCode:  string;
  country:     string;
  coordinates?: { lat: number; lng: number };
}

export interface IRestaurant extends Document {
  name:           string;
  description:    string;
  cuisineType:    CuisineType;
  address:        IAddress;
  openingHours:   IOpeningHours;
  ownerId:        string;   // ref → User._id (string, not ObjectId ref, consistent with other modules)
  isActive:       boolean;
  isVerified:     boolean;
  coverImageUrl?: string;
  logoUrl?:       string;
  phone?:         string;
  rating:         number;
  totalOrders:    number;
  minimumOrder:   number;
  deliveryFee:    number;
  estimatedDeliveryMinutes: number;
}

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const openingHourSlotSchema = new Schema<IOpeningHourSlot>(
  {
    open:   { type: String, required: true, default: '08:00' },
    close:  { type: String, required: true, default: '22:00' },
    closed: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const DEFAULT_SLOT = { open: '08:00', close: '22:00', closed: false } as const;

const openingHoursSchema = new Schema<IOpeningHours>(
  {
    monday:    { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
    tuesday:   { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
    wednesday: { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
    thursday:  { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
    friday:    { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
    saturday:  { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
    sunday:    { type: openingHourSlotSchema, required: true, default: () => ({ ...DEFAULT_SLOT }) },
  },
  { _id: false },
);

// ADD:
const coordinatesSchema = new Schema<{ lat: number; lng: number }>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const addressSchema = new Schema<IAddress>(
  {
    street:      { type: String, required: true, trim: true },
    city:        { type: String, required: true, trim: true },
    state:       { type: String, required: true, trim: true },
    postalCode:  { type: String, required: true, trim: true },
    country:     { type: String, required: true, trim: true, default: 'Sri Lanka' },
    coordinates: { type: coordinatesSchema },   // optional — omitted means undefined
  },
  { _id: false },
);

// ── Main schema ───────────────────────────────────────────────────────────────

const restaurantSchema = new Schema<IRestaurant>(
  {
    name:          { type: String, required: true, trim: true, index: true },
    description:   { type: String, required: true, trim: true },
    cuisineType:   { type: String, enum: Object.values(CuisineType), required: true, index: true },
    address:       { type: addressSchema, required: true },
    openingHours:  { type: openingHoursSchema, required: true },
    ownerId:       { type: String, required: true, index: true },
    isActive:      { type: Boolean, required: true, default: true, index: true },
    isVerified:    { type: Boolean, required: true, default: false, index: true },
    coverImageUrl: { type: String },
    logoUrl:       { type: String },
    phone:         { type: String },
    rating:        { type: Number, required: true, default: 0, min: 0, max: 5 },
    totalOrders:   { type: Number, required: true, default: 0, min: 0 },
    minimumOrder:  { type: Number, required: true, default: 0, min: 0 },
    deliveryFee:   { type: Number, required: true, default: 0, min: 0 },
    estimatedDeliveryMinutes: { type: Number, required: true, default: 30, min: 1 },
  },
  { timestamps: true },
);

// Compound indexes — most common queries
restaurantSchema.index({ cuisineType: 1, isActive: 1 });
restaurantSchema.index({ isActive: 1, isVerified: 1 });
restaurantSchema.index({ ownerId: 1, isActive: 1 });

export const RestaurantModel = model<IRestaurant>('Restaurant', restaurantSchema);
