import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, Plus, Check } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { PaymentCard } from "@/components/common/PaymentCard";
import { SAVED_CARDS } from "@/constants/mock-data";

export const Route = createFileRoute("/checkout/payment")({
  component: PaymentScreen,
});

function PaymentScreen() {
  const router = useRouter();
  const [sel, setSel] = useState<string>(SAVED_CARDS[0].id);

  return (
    <MobileShell>
      <ScreenHeader title="Payment method" />
      <div className="px-5 py-4 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quick</p>
          <button
            onClick={() => setSel("cod")}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${
              sel === "cod" ? "border-accent bg-accent/5" : "border-border bg-card"
            }`}
          >
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-success/15 text-success">
              <Banknote className="h-5 w-5" />
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Pay the rider in cash on arrival</p>
            </div>
            {sel === "cod" && <Check className="h-5 w-5 text-accent" />}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Saved cards</p>
            <Link to="/cards" className="text-xs font-semibold text-accent">Manage</Link>
          </div>
          <div className="space-y-3">
            {SAVED_CARDS.map((c) => (
              <button key={c.id} onClick={() => setSel(c.id)} className="w-full text-left relative">
                <PaymentCard card={c} compact />
                {sel === c.id && (
                  <span className="absolute top-3 right-3 grid place-items-center h-6 w-6 rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            ))}
            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-accent">
              <Plus className="h-4 w-4" /> Add new card
            </button>
          </div>
        </div>

        <button
          onClick={() => router.history.back()}
          className="w-full mt-2 h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition"
        >
          Confirm payment method
        </button>
      </div>
    </MobileShell>
  );
}
