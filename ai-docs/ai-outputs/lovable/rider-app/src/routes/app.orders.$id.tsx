import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Check, X, Store, PackageCheck, MapPinned, LifeBuoy, Banknote, CreditCard, Wallet } from "lucide-react";
import { AppHeader } from "@/components/rider/AppHeader";
import { DeliveryMapCard } from "@/components/rider/DeliveryMapCard";
import { CustomerInfoCard } from "@/components/rider/CustomerInfoCard";
import { DeliveryTimeline } from "@/components/rider/DeliveryTimeline";
import { DeliveryStatusBadge } from "@/components/rider/DeliveryStatusBadge";
import { Button } from "@/components/ui/button";
import { useRiderState, riderStore } from "@/stores/rider-store";
import { formatCurrency, APP } from "@/constants/app";
import type { DeliveryStatus } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/app/orders/$id")({ component: OrderDetails });

const PAY_ICON = { cash: Banknote, card: CreditCard, online: Wallet };

function OrderDetails() {
  const { id } = useParams({ from: "/app/orders/$id" });
  const nav = useNavigate();
  const order = useRiderState((s) => s.orders.find((o) => o.id === id));
  const [confirming, setConfirming] = useState<null | "pickup" | "deliver">(null);

  if (!order) {
    return (
      <>
        <AppHeader title="Order" back />
        <div className="flex-1 grid place-items-center text-sm text-muted-foreground p-8 text-center">
          Order not found. It may have been completed or reassigned.
        </div>
      </>
    );
  }

  const Pay = PAY_ICON[order.paymentMethod];

  const accept = () => { riderStore.acceptOrder(order.id); toast.success(`Order #${order.code} accepted`); };
  const reject = () => { riderStore.rejectOrder(order.id); toast(`Order #${order.code} rejected`); nav({ to: "/app/orders" }); };
  const advance = (to: DeliveryStatus, msg: string) => { riderStore.updateStatus(order.id, to); toast.success(msg); };
  const complete = () => { riderStore.updateStatus(order.id, "delivered"); nav({ to: "/app/orders/$id/success", params: { id: order.id } }); };

  return (
    <>
      <AppHeader title={`Order #${order.code}`} subtitle={`${order.distanceKm} km · ETA ${order.etaMinutes} min`} back />
      <div className="flex-1 px-4 py-4 space-y-4 pb-32">
        <DeliveryMapCard height={200} />

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <DeliveryStatusBadge status={order.status} />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Your earning</p>
              <p className="text-lg font-bold text-brand">{formatCurrency(order.riderEarning)}</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Customer</h2>
          <CustomerInfoCard customer={order.customer} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Pickup</h2>
          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/15 text-brand grid place-items-center"><Store className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{APP.restaurant}</p>
              <p className="text-xs text-muted-foreground">{APP.pickupAddress}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Items · {order.items.reduce((a,b)=>a+b.quantity,0)}</h2>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-7 w-7 rounded-md bg-brand/15 text-brand text-xs font-semibold grid place-items-center">{it.quantity}×</span>
                  <span className="text-sm font-medium text-foreground truncate">{it.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatCurrency(it.price * it.quantity)}</span>
              </div>
            ))}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Order total</span>
              <span className="text-sm font-bold">{formatCurrency(order.subtotal + order.deliveryFee)}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Pay className="h-3.5 w-3.5" /> {order.paymentMethod.toUpperCase()}</span>
              <span>Delivery fee {formatCurrency(order.deliveryFee)}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Progress</h2>
          <div className="rounded-2xl border border-border bg-card p-4">
            <DeliveryTimeline status={order.status} />
          </div>
        </section>

        <button className="w-full text-xs text-destructive inline-flex items-center justify-center gap-1.5 py-2">
          <LifeBuoy className="h-4 w-4" /> Need help? Contact support
        </button>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-md px-4 py-3">
        {order.status === "pending" && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12 rounded-xl" onClick={reject}><X className="h-4 w-4 mr-1" /> Reject</Button>
            <Button className="h-12 rounded-xl bg-brand hover:bg-brand/90 text-brand-foreground" onClick={accept}><Check className="h-4 w-4 mr-1" /> Accept</Button>
          </div>
        )}
        {order.status === "accepted" && (
          <Button className="w-full h-12 rounded-xl bg-foreground text-background" onClick={() => advance("ready_for_pickup", "Heading to restaurant")}>
            <Store className="h-4 w-4 mr-2" /> I'm heading to pickup
          </Button>
        )}
        {order.status === "ready_for_pickup" && (
          <Button className="w-full h-12 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setConfirming("pickup")}>
            <PackageCheck className="h-4 w-4 mr-2" /> Confirm pickup
          </Button>
        )}
        {order.status === "picked_up" && (
          <Button className="w-full h-12 rounded-xl bg-info text-info-foreground" onClick={() => advance("on_the_way", "Navigating to customer")}>
            <Navigation className="h-4 w-4 mr-2" /> Start navigation
          </Button>
        )}
        {order.status === "on_the_way" && (
          <Button className="w-full h-12 rounded-xl bg-success text-success-foreground" onClick={() => setConfirming("deliver")}>
            <MapPinned className="h-4 w-4 mr-2" /> Mark as delivered
          </Button>
        )}
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/50 grid place-items-end sm:place-items-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirming(null)}
          >
            <motion.div
              className="w-full max-w-[440px] bg-card rounded-2xl p-5"
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold">
                {confirming === "pickup" ? "Confirm pickup" : "Confirm delivery"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {confirming === "pickup"
                  ? "Have you collected all items from the kitchen?"
                  : "Has the customer received the order?"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11" onClick={() => setConfirming(null)}>Cancel</Button>
                <Button className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={() => {
                    if (confirming === "pickup") { advance("picked_up", "Pickup confirmed"); }
                    else { complete(); }
                    setConfirming(null);
                  }}>
                  Yes, confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
