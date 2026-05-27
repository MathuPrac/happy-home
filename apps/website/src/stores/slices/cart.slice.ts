import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '@restaurant/shared-types';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: Array<{ customizationId: string; optionId: string; name: string; price: number }>;
  subtotal: number;
}

export interface CartState {
  restaurantId: string | null;
  items: CartItem[];
  total: number;
}

const initialState: CartState = { restaurantId: null, items: [], total: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.menuItem.id === action.payload.menuItem.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
        existing.subtotal = existing.quantity * existing.menuItem.price;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.reduce((sum, i) => sum + i.subtotal, 0);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.menuItem.id !== action.payload);
      state.total = state.items.reduce((sum, i) => sum + i.subtotal, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.restaurantId = null;
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

