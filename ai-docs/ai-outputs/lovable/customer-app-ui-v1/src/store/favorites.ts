import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FAVORITE_IDS } from "@/constants/mock-data";

interface FavState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: FAVORITE_IDS,
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "hh-favorites" },
  ),
);
