export type DeliveryStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  lat: number;
  lng: number;
  avatarUrl?: string;
}

export interface Order {
  id: string;
  code: string;
  status: DeliveryStatus;
  items: OrderItem[];
  customer: Customer;
  subtotal: number;
  deliveryFee: number;
  riderEarning: number;
  distanceKm: number;
  etaMinutes: number;
  createdAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  paymentMethod: "cash" | "card" | "online";
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: { type: "bike" | "scooter" | "car"; plate: string };
  rating: number;
  totalDeliveries: number;
  avatarUrl?: string;
  online: boolean;
}

export interface NotificationItemData {
  id: string;
  type: "order" | "earning" | "system" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}
