import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";
import { FOODS } from "@/constants/mock-data";

interface CartState {
  lines: CartLine[];
  add: (foodId: string, qty?: number) => void;
  remove: (foodId: string) => void;
  setQty: (foodId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (foodId, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.foodId === foodId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.foodId === foodId ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return { lines: [...s.lines, { foodId, qty }] };
        }),
      remove: (foodId) => set((s) => ({ lines: s.lines.filter((l) => l.foodId !== foodId) })),
      setQty: (foodId, qty) =>
        set((s) => ({
          lines: qty <= 0
            ? s.lines.filter((l) => l.foodId !== foodId)
            : s.lines.map((l) => (l.foodId === foodId ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "hh-cart" },
  ),
);

export const cartSelectors = {
  itemCount: (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0),
  subtotal: (lines: CartLine[]) =>
    lines.reduce((sum, l) => {
      const f = FOODS.find((x) => x.id === l.foodId);
      return sum + (f ? f.price * l.qty : 0);
    }, 0),
};
