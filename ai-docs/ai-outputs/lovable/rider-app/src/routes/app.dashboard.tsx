import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Sun, Moon, TrendingUp, Package, Star } from "lucide-react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/rider/AppHeader";
import { RiderStatusCard } from "@/components/rider/RiderStatusCard";
import { AvailabilityToggle } from "@/components/rider/AvailabilityToggle";
import { EarningsCard } from "@/components/rider/EarningsCard";
import { OrderCard } from "@/components/rider/OrderCard";
import { ActiveDeliveryPanel } from "@/components/rider/ActiveDeliveryPanel";
import { useRiderState, riderStore } from "@/stores/rider-store";
import { earningsSummary } from "@/lib/mock-data";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { theme, toggle } = useTheme();
  const rider = useRiderState((s) => s.rider);
  const orders = useRiderState((s) => s.orders);
  const activeOrder = useRiderState((s) => s.orders.find((o) => o.id === s.activeOrderId)) ?? null;
  const pending = orders.filter((o) => o.status === "pending").slice(0, 2);

  return (
    <>
      <AppHeader
        title="Dashboard"
        subtitle="Happy Home Restaurant"
        right={
          <div className="flex items-center gap-1">
            <button onClick={toggle} className="h-9 w-9 rounded-full grid place-items-center hover:bg-muted">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/app/notifications" className="relative h-9 w-9 rounded-full grid place-items-center hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand rounded-full" />
            </Link>
          </div>
        }
      />
      <div className="flex-1 px-4 pt-3 pb-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <RiderStatusCard rider={rider} />
        </motion.div>
        <AvailabilityToggle online={rider.online} onChange={() => riderStore.toggleOnline()} />

        <ActiveDeliveryPanel order={activeOrder} />

        <div className="grid grid-cols-2 gap-3">
          <EarningsCard label="Today" amount={earningsSummary.today} sub={`${earningsSummary.trips.today} trips`} accent />
          <EarningsCard label="This week" amount={earningsSummary.week} sub={`${earningsSummary.trips.week} trips`} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Package} label="Total trips" value={rider.totalDeliveries.toLocaleString()} />
          <Stat icon={Star} label="Rating" value={rider.rating.toFixed(1)} />
          <Stat icon={TrendingUp} label="Tips" value="LKR 1.2k" />
        </div>

        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">New orders</h2>
            <Link to="/app/orders" className="text-xs text-brand font-medium">View all</Link>
          </div>
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No new orders right now. We'll notify you.
            </div>
          ) : pending.map((o) => <OrderCard key={o.id} order={o} />)}
        </section>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
