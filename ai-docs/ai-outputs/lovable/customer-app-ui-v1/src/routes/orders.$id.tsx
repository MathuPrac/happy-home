import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Star } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { OrderTimeline } from "@/components/common/OrderTimeline";
import { ORDERS } from "@/constants/mock-data";
import { formatLKR } from "@/utils/format";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const order = ORDERS.find((o) => o.id === id) ?? ORDERS[0];

  return (
    <MobileShell>
      <ScreenHeader title={`Order ${order.code}`} subtitle={order.placedAt} />

      <div className="px-5 py-4 space-y-5 pb-10">
        {order.status !== "delivered" && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.22_0.03_30)] dark:from-card dark:to-[oklch(0.28_0.04_60)] p-5 text-primary-foreground">
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-widest opacity-70">Arriving in</p>
              <p className="font-display text-5xl font-bold mt-1">{order.etaMinutes} min</p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5" />
                <span className="opacity-80 truncate">{order.address}</span>
              </div>
            </div>
          </div>
        )}

        {/* Map placeholder */}
        <div className="relative h-44 rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-muted">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 16px, color-mix(in oklab, var(--color-muted-foreground) 22%, transparent) 16px, color-mix(in oklab, var(--color-muted-foreground) 22%, transparent) 17px)`,
          }} />
          <div className="absolute top-1/3 left-1/4 grid place-items-center h-9 w-9 rounded-full bg-spice text-white text-xs font-bold">🍽️</div>
          <div className="absolute top-1/2 left-1/2 grid place-items-center h-9 w-9 rounded-full bg-accent text-accent-foreground">🛵</div>
          <div className="absolute bottom-1/4 right-1/4 grid place-items-center h-9 w-9 rounded-full bg-success text-success-foreground">📍</div>
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 400 176" preserveAspectRatio="none">
            <path d="M 100 60 Q 200 30, 200 90 T 300 130" fill="none" stroke="oklch(0.72 0.16 55)" strokeWidth="2.5" strokeDasharray="5 5" />
          </svg>
        </div>

        {order.rider && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Your rider</p>
            <div className="flex items-center gap-3">
              <img src={order.rider.avatar} alt="" className="h-12 w-12 rounded-full bg-secondary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{order.rider.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />{order.rider.rating} · {order.rider.vehicle} · {order.rider.plate}
                </p>
              </div>
              <button className="grid place-items-center h-10 w-10 rounded-full bg-secondary"><MessageCircle className="h-4 w-4" /></button>
              <button className="grid place-items-center h-10 w-10 rounded-full bg-accent text-accent-foreground"><Phone className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-card border border-border p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Status</p>
          <OrderTimeline status={order.status} />
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Items</p>
          <div className="space-y-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
                </div>
                <span className="text-sm font-semibold">{formatLKR(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-3 space-y-2 text-sm">
            <Row label="Subtotal" value={formatLKR(order.subtotal)} />
            <Row label="Delivery" value={formatLKR(order.delivery)} />
            <Row label="Total" value={formatLKR(order.total)} bold />
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
