import { Schema, model, type Document } from 'mongoose';

export enum MenuCategory {
  STARTERS = 'starters',
  MAINS = 'mains',
  DESSERTS = 'desserts',
  DRINKS = 'drinks',
  SIDES = 'sides',
  SPECIALS = 'specials',
}

export interface ICustomizationOption {
  optionId: string;
  name: string;
  priceModifier: number; // positive = surcharge, negative = discount, 0 = no change
}

export interface ICustomization {
  customizationId: string;
  name: string;         // e.g. "Size", "Toppings"
  required: boolean;
  multiSelect: boolean; // false = radio, true = checkbox
  options: ICustomizationOption[];
}

export interface IMenuItem extends Document {
  restaurantId: string;
  name: string;
  description: string;
  category: MenuCategory;
  basePrice: number;
  imageUrl?: string;
  customizations: ICustomization[];
  isAvailable: boolean;
  preparationTimeMinutes?: number;
  allergens?: string[];
  tags?: string[];
}

const customizationOptionSchema = new Schema<ICustomizationOption>(
  {
    optionId:      { type: String, required: true },
    name:          { type: String, required: true },
    priceModifier: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const customizationSchema = new Schema<ICustomization>(
  {
    customizationId: { type: String, required: true },
    name:            { type: String, required: true },
    required:        { type: Boolean, required: true, default: false },
    multiSelect:     { type: Boolean, required: true, default: false },
    options:         { type: [customizationOptionSchema], required: true, default: [] },
  },
  { _id: false },
);

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId:            { type: String, required: true, index: true },
    name:                    { type: String, required: true, trim: true },
    description:             { type: String, required: true, trim: true },
    category:                { type: String, enum: Object.values(MenuCategory), required: true, index: true },
    basePrice:               { type: Number, required: true, min: 0 },
    imageUrl:                { type: String },
    customizations:          { type: [customizationSchema], default: [] },
    isAvailable:             { type: Boolean, required: true, default: true, index: true },
    preparationTimeMinutes:  { type: Number, min: 0 },
    allergens:               { type: [String], default: [] },
    tags:                    { type: [String], default: [] },
  },
  { timestamps: true },
);

// Compound index: most common query — items for a restaurant by category
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });

export const MenuItemModel = model<IMenuItem>('MenuItem', menuItemSchema);
