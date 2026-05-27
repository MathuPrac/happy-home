import type { SavedCard } from "@/types";

const brandStyle: Record<SavedCard["brand"], string> = {
  visa: "from-[#1a1f71] to-[#0f1448]",
  mastercard: "from-[#eb001b] via-[#ff5f00] to-[#f79e1b]",
  amex: "from-[#2e77bb] to-[#1c4f8a]",
};

const brandLabel: Record<SavedCard["brand"], string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "AMEX",
};

export function PaymentCard({ card, compact }: { card: SavedCard; compact?: boolean }) {
  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-br ${brandStyle[card.brand]} text-white overflow-hidden shadow-[var(--shadow-card)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
        backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 50%)"
      }} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="h-7 w-9 rounded bg-gold/90" />
          <span className="font-display text-sm font-bold italic">{brandLabel[card.brand]}</span>
        </div>
        <p className={`font-mono mt-${compact ? "3" : "6"} tracking-[0.25em] ${compact ? "text-sm" : "text-base"}`}>
          •••• •••• •••• {card.last4}
        </p>
        <div className={`flex items-end justify-between ${compact ? "mt-2" : "mt-4"}`}>
          <div>
            <p className="text-[9px] uppercase opacity-70">Holder</p>
            <p className="text-xs font-semibold">{card.holder}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase opacity-70">Expires</p>
            <p className="text-xs font-semibold">{card.expiry}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
