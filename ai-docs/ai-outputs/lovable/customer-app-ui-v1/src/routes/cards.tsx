import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { PaymentCard } from "@/components/common/PaymentCard";
import { SAVED_CARDS } from "@/constants/mock-data";

export const Route = createFileRoute("/cards")({
  component: Cards,
});

function Cards() {
  return (
    <MobileShell>
      <ScreenHeader title="Saved cards" subtitle={`${SAVED_CARDS.length} cards stored securely`} />
      <div className="px-5 py-4 space-y-4 pb-10">
        {SAVED_CARDS.map((c) => (
          <div key={c.id} className="space-y-2">
            <PaymentCard card={c} />
            <div className="flex items-center justify-between px-1">
              {c.isDefault ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Default</span>
              ) : (
                <button className="text-[11px] font-semibold text-muted-foreground">Set as default</button>
              )}
              <button className="text-[11px] font-semibold text-spice flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        ))}

        <button className="w-full flex items-center justify-center gap-2 p-5 rounded-3xl border-2 border-dashed border-border text-sm font-semibold text-accent">
          <Plus className="h-4 w-4" /> Add new card
        </button>

        <div className="rounded-2xl bg-secondary p-4 text-xs text-muted-foreground">
          🔒 Your card details are tokenized and never stored on our servers. All payments are processed through a PCI-DSS compliant gateway.
        </div>
      </div>
    </MobileShell>
  );
}
