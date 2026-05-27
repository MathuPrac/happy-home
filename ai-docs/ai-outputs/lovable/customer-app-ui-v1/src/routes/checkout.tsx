import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, CreditCard, Clock, ChevronRight, MessageSquare } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CheckoutCard } from "@/components/common/CheckoutCard";
import { useCart, cartSelectors } from "@/store/cart";
import { SAVED_CARDS } from "@/constants/mock-data";
import { formatLKR } from "@/utils/format";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const nav = useNavigate();
  const { lines, clear } = useCart();
  const subtotal = cartSelectors.subtotal(lines);
  const delivery = 250;
  const total = subtotal + delivery;
  const defaultCard = SAVED_CARDS.find((c) => c.isDefault);

  return (
    <MobileShell>
      <ScreenHeader title="Checkout" />
      <div className="px-5 py-4 space-y-5 pb-40">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Delivery</p>
          <div className="space-y-2">
            <CheckoutCard
              icon={<MapPin className="h-4 w-4 text-accent" />}
              title="Home"
              subtitle="Apt 14B, Cinnamon Gardens, Colombo 07"
              right={<button onClick={() => nav({ to: "/checkout/address" })} className="text-xs text-accent font-semibold">Change</button>}
            />
            <CheckoutCard
              icon={<Clock className="h-4 w-4 text-accent" />}
              title="Deliver now"
              subtitle="Estimated arrival 25–35 min"
              right={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Payment</p>
          <CheckoutCard
            onClick={() => nav({ to: "/checkout/payment" })}
            icon={<CreditCard className="h-4 w-4 text-accent" />}
            title={defaultCard ? `${defaultCard.brand.toUpperCase()} •••• ${defaultCard.last4}` : "Select payment"}
            subtitle={defaultCard ? `Expires ${defaultCard.expiry}` : "Cash, card or saved methods"}
            right={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Order note</p>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1.5" />
            <input
              placeholder="Add a note for the kitchen…"
              className="flex-1 bg-transparent outline-none text-sm py-1.5 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Summary</p>
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5">
            <Row label={`Items (${lines.length})`} value={formatLKR(subtotal)} />
            <Row label="Delivery" value={formatLKR(delivery)} />
            <div className="border-t border-border my-1" />
            <Row label="Total" value={formatLKR(total)} bold />
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-background/95 backdrop-blur-xl border-t border-border px-5 py-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <button
          onClick={() => { clear(); nav({ to: "/checkout/success" }); }}
          className="w-full h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition flex items-center justify-between px-5"
        >
          <span>Place order</span>
          <span>{formatLKR(total)}</span>
        </button>
      </div>
    </MobileShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-display text-lg font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
