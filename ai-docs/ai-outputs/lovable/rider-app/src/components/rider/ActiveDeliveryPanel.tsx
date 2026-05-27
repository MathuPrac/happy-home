import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, ArrowRight } from "lucide-react";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import type { Order } from "@/types";

export function ActiveDeliveryPanel({ order }: { order: Order | null }) {
  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active delivery</p>
              <p className="font-semibold text-foreground">#{order.code} · {order.customer.name}</p>
            </div>
            <DeliveryStatusBadge status={order.status} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-10 rounded-xl bg-muted grid place-items-center text-xs text-muted-foreground">
              ETA {order.etaMinutes} min · {order.distanceKm} km
            </div>
            <Link to="/app/orders/$id" params={{ id: order.id }}>
              <button className="h-10 px-4 rounded-xl bg-brand text-brand-foreground font-medium text-sm inline-flex items-center gap-1.5">
                <Navigation className="h-4 w-4" /> Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
