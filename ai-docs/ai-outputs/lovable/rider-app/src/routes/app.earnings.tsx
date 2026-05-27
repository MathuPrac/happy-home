import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/rider/AppHeader";
import { EarningsCard } from "@/components/rider/EarningsCard";
import { earningsSummary } from "@/lib/mock-data";
import { formatCurrency } from "@/constants/app";

export const Route = createFileRoute("/app/earnings")({ component: Earnings });

function Earnings() {
  const max = Math.max(...earningsSummary.weekly);
  const days = ["M","T","W","T","F","S","S"];
  return (
    <>
      <AppHeader title="Earnings" back />
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <EarningsCard label="Today" amount={earningsSummary.today} sub={`${earningsSummary.trips.today} trips · ${earningsSummary.hours}h`} accent />
          <EarningsCard label="This week" amount={earningsSummary.week} sub={`${earningsSummary.trips.week} trips`} />
          <EarningsCard label="This month" amount={earningsSummary.month} sub={`${earningsSummary.trips.month} trips`} />
          <EarningsCard label="Tips" amount={earningsSummary.tips} sub="this week" />
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-sm font-semibold">Weekly breakdown</p>
          <div className="mt-4 flex items-end justify-between gap-2 h-32">
            {earningsSummary.weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md bg-brand" style={{ height: `${(v / max) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
            <span>Avg/day</span>
            <span className="font-semibold text-foreground">{formatCurrency(Math.round(earningsSummary.week/7))}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-sm font-semibold mb-2">Next payout</p>
          <p className="text-xs text-muted-foreground">Friday, 23 May · directly to your bank account</p>
          <button className="mt-3 w-full h-11 rounded-xl bg-foreground text-background text-sm font-medium">
            View payout history
          </button>
        </div>
      </div>
    </>
  );
}
