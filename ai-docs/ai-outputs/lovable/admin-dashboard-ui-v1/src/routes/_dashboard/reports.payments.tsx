import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DonutChart } from "@/components/dashboard/charts";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { paymentMix } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, Banknote } from "lucide-react";

export const Route = createFileRoute("/_dashboard/reports/payments")({
  head: () => ({ meta: [{ title: "Payment Overview — Happy Home Admin" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <>
      <DashboardHeader title="Payment Overview" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Payments" subtitle="How customers are paying across channels." />

        <div className="grid gap-4 md:grid-cols-3">
          <AnalyticsCard label="Card volume" value="Rs 954,000" delta={11.2} icon={<CreditCard className="h-4 w-4" />} />
          <AnalyticsCard label="COD volume" value="Rs 417,000" delta={2.3} icon={<Banknote className="h-4 w-4" />} />
          <AnalyticsCard label="Wallet volume" value="Rs 120,000" delta={18.7} icon={<Wallet className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <DonutChart data={paymentMix} title="Payment mix" description="Share of orders" />
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Settlement status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Settled to bank", val: "Rs 1,289,400", tone: "text-success" },
                { label: "Pending settlement", val: "Rs 142,000", tone: "text-warning" },
                { label: "Failed / disputed", val: "Rs 23,400", tone: "text-destructive" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-lg border p-3">
                  <span>{r.label}</span>
                  <span className={`font-medium tabular-nums ${r.tone}`}>{r.val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
