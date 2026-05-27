export interface CartItemCustomization {
  customizationId: string;
  optionId: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: CartItemCustomization[];
  imageUrl?: string;
}

export interface Cart {
  customerId: string;
  restaurantId: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}