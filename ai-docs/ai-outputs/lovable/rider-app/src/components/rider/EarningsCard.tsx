import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/constants/app";

export function EarningsCard({ label, amount, sub, accent }: { label: string; amount: number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "bg-brand text-brand-foreground border-brand" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${accent ? "text-brand-foreground/80" : "text-muted-foreground"}`}>{label}</p>
        <TrendingUp className={`h-4 w-4 ${accent ? "text-brand-foreground/80" : "text-success"}`} />
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(amount)}</p>
      {sub && <p className={`mt-1 text-[11px] ${accent ? "text-brand-foreground/80" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}
