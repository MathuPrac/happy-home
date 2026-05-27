import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Package, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { formatCurrency } from "@/constants/app";
import type { Order } from "@/types";

export function OrderCard({ order, compact }: { order: Order; compact?: boolean }) {
  const itemCount = order.items.reduce((a, b) => a + b.quantity, 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link
        to="/app/orders/$id"
        params={{ id: order.id }}
        className="block rounded-2xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">#{order.code}</span>
              <DeliveryStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-base font-semibold text-foreground truncate">
              {order.customer.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {order.customer.address}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-brand">{formatCurrency(order.riderEarning)}</p>
            <p className="text-[11px] text-muted-foreground">earnings</p>
          </div>
        </div>
        {!compact && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {itemCount} items</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {order.distanceKm} km</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {order.etaMinutes} min</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </Link>
    </motion.div>
  );
}
