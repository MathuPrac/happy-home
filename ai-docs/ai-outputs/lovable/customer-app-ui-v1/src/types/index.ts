// Domain types — kept platform-agnostic so they can be reused in a future
// React Native (Expo) port. No DOM-only or web-only types in this file.

export type FoodCategory =
  | "biriyani"
  | "kottu"
  | "indian"
  | "grill"
  | "seafood"
  | "shortEats"
  | "drinks"
  | "desserts";

export interface Category {
  id: FoodCategory;
  name: string;
  emoji: string;
  count: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;            // LKR
  image: string;            // URL or imported asset
  category: FoodCategory;
  rating: number;
  reviews: number;
  prepMinutes: number;
  spicyLevel: 0 | 1 | 2 | 3;
  isVeg: boolean;
  tags?: string[];
  calories?: number;
  popular?: boolean;
}

export interface CartLine {
  foodId: string;
  qty: number;
  note?: string;
}

export type OrderStatus =
  | "placed"
  | "preparing"
  | "rider_assigned"
  | "out_for_delivery"
  | "delivered";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  vehicle: string;
  plate: string;
}

export interface Order {
  id: string;
  code: string;
  items: { name: string; qty: number; price: number; image: string }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  etaMinutes: number;
  address: string;
  rider?: Rider;
}

export interface SavedCard {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  holder: string;
  expiry: string;
  isDefault: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountLabel: string;
  accent: "amber" | "spice" | "gold";
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "order" | "promo" | "loyalty" | "system";
  unread: boolean;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: "confirmed" | "pending" | "past";
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  loyaltyPoints: number;
  tier: "Silver" | "Gold" | "Platinum";
}
