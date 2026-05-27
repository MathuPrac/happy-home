import type { Promotion } from "@/types";
import { Sparkles } from "lucide-react";

const accents = {
  amber: "from-accent to-gold text-accent-foreground",
  spice: "from-spice to-accent text-spice-foreground",
  gold: "from-gold to-accent text-accent-foreground",
} as const;

export function OfferBanner({ promo }: { promo: Promotion }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br ${accents[promo.accent]} min-w-[280px]`}
    >
      <Sparkles className="absolute -top-2 -right-2 h-24 w-24 opacity-15" />
      <div className="text-[10px] font-bold tracking-widest uppercase opacity-80">{promo.discountLabel}</div>
      <h3 className="font-display text-xl font-bold leading-tight mt-1">{promo.title}</h3>
      <p className="text-xs mt-1 opacity-90 max-w-[80%]">{promo.subtitle}</p>
      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/15 backdrop-blur-sm">
        <span className="text-[10px] uppercase opacity-80">Code</span>
        <span className="text-xs font-bold tracking-wider">{promo.code}</span>
      </div>
    </div>
  );
}
