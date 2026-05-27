import { useSyncExternalStore } from "react";
import { mockOrders, mockRider } from "@/lib/mock-data";
import type { DeliveryStatus, Order, Rider } from "@/types";

type State = {
  rider: Rider;
  orders: Order[];
  activeOrderId: string | null;
};

const listeners = new Set<() => void>();
let state: State = {
  rider: { ...mockRider },
  orders: mockOrders.map((o) => ({ ...o })),
  activeOrderId: mockOrders.find((o) => o.status === "ready_for_pickup")?.id ?? null,
};

const emit = () => listeners.forEach((l) => l());
const setState = (updater: (s: State) => State) => {
  state = updater(state);
  emit();
};

export const riderStore = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get() { return state; },
  toggleOnline() { setState((s) => ({ ...s, rider: { ...s.rider, online: !s.rider.online } })); },
  acceptOrder(id: string) {
    setState((s) => ({
      ...s,
      activeOrderId: id,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status: "accepted" } : o)),
    }));
  },
  rejectOrder(id: string) {
    setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) }));
  },
  updateStatus(id: string, status: DeliveryStatus) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      activeOrderId: status === "delivered" ? null : s.activeOrderId,
    }));
  },
};

export function useRiderState<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    riderStore.subscribe,
    () => selector(riderStore.get()),
    () => selector(riderStore.get())
  );
}
