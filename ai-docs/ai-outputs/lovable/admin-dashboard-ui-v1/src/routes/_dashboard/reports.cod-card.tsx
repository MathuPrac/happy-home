import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_dashboard/reports/cod-card")({
  head: () => ({ meta: [{ title: "COD vs Card — Happy Home Admin" }] }),
  component: CodCardPage,
});

const rows = [
  { day: "Mon", cod: 38, card: 48, wallet: 14 },
  { day: "Tue", cod: 32, card: 56, wallet: 12 },
  { day: "Wed", cod: 34, card: 54, wallet: 12 },
  { day: "Thu", cod: 29, card: 61, wallet: 10 },
  { day: "Fri", cod: 26, card: 66, wallet: 8 },
  { day: "Sat", cod: 24, card: 68, wallet: 8 },
  { day: "Sun", cod: 28, card: 65, wallet: 7 },
];

function CodCardPage() {
  return (
    <>
      <DashboardHeader title="COD vs Card" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="COD vs Card Report" subtitle="Daily payment method split across last 7 days." />

        <Card>
          <CardHeader>
            <CardTitle>Method share by day</CardTitle>
            <CardDescription>% of orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((r) => (
              <div key={r.day}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">{r.day}</span>
                  <span className="text-muted-foreground">{r.card}% card · {r.cod}% COD · {r.wallet}% wallet</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full">
                  <div className="bg-info" style={{ width: `${r.card}%` }} />
                  <div className="bg-primary" style={{ width: `${r.cod}%` }} />
                  <div className="bg-success" style={{ width: `${r.wallet}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Card share", value: 64, tone: "bg-info" },
            { label: "COD share", value: 28, tone: "bg-primary" },
            { label: "Wallet share", value: 8, tone: "bg-success" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-2 text-3xl font-semibold tabular-nums">{s.value}%</div>
                <Progress value={s.value} className="mt-3 h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
