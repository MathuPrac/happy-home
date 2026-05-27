import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/rider/AppHeader";
import { OrderCard } from "@/components/rider/OrderCard";
import { mockHistory } from "@/lib/mock-data";
import { formatCurrency } from "@/constants/app";

export const Route = createFileRoute("/app/history")({ component: History });

function History() {
  const total = mockHistory.reduce((a, b) => a + b.riderEarning, 0);
  return (
    <>
      <AppHeader title="Delivery History" subtitle={`${mockHistory.length} completed`} />
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div className="rounded-2xl bg-brand text-brand-foreground p-4">
          <p className="text-xs opacity-80">Total earned (history)</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
          <p className="text-xs opacity-80 mt-1">{mockHistory.length} successful deliveries</p>
        </div>
        <div className="space-y-3">
          {mockHistory.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      </div>
    </>
  );
}
