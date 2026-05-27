import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { OfferBanner } from "@/components/common/OfferBanner";
import { PROMOTIONS } from "@/constants/mock-data";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/offers")({
  component: Offers,
});

function Offers() {
  return (
    <MobileShell>
      <ScreenHeader title="Offers & promotions" subtitle={`${PROMOTIONS.length} active deals`} />
      <div className="px-5 py-4 space-y-4 pb-10">
        {PROMOTIONS.map((p) => (
          <div key={p.id}>
            <OfferBanner promo={p} />
            <button className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-card border border-border text-xs font-semibold">
              <Copy className="h-3.5 w-3.5" /> Copy {p.code}
            </button>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-border p-5 text-center">
          <p className="font-display text-base font-bold">More deals coming soon</p>
          <p className="text-xs text-muted-foreground mt-1">Turn on notifications to never miss one.</p>
        </div>
      </div>
    </MobileShell>
  );
}
