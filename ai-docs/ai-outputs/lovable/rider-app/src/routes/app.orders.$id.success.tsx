import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Star } from "lucide-react";
import { useRiderState } from "@/stores/rider-store";
import { formatCurrency } from "@/constants/app";
import { mockHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/app/orders/$id/success")({ component: Success });

function Success() {
  const { id } = useParams({ from: "/app/orders/$id/success" });
  const order = useRiderState((s) => s.orders.find((o) => o.id === id)) ?? mockHistory[0];
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 14 }}
        className="h-24 w-24 rounded-full bg-success/15 grid place-items-center">
        <CheckCircle2 className="h-14 w-14 text-success" />
      </motion.div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">Delivery complete!</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        Order #{order.code} delivered to {order.customer.name}. Great work.
      </p>
      <div className="mt-6 w-full max-w-sm rounded-2xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">You earned</p>
        <p className="text-3xl font-bold text-brand mt-1">{formatCurrency(order.riderEarning)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Distance" value={`${order.distanceKm} km`} />
          <Stat label="Time" value={`${order.etaMinutes} min`} />
          <Stat label="Rating" value={<span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />5.0</span>} />
        </div>
      </div>
      <Link to="/app/dashboard" className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand text-brand-foreground font-semibold">
        <Home className="h-4 w-4" /> Back to dashboard
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
