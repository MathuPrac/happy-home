import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill } from "@/components/dashboard/status-badge";
import { customers } from "@/lib/mock-data";
import { Gift, Crown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_dashboard/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty — Happy Home Admin" }] }),
  component: LoyaltyPage,
});

const tiers = [
  { name: "Bronze", points: "0 – 999", perks: "5% off first order", count: 1240 },
  { name: "Silver", points: "1,000 – 2,499", perks: "10% off · priority support", count: 612 },
  { name: "Gold", points: "2,500 – 4,999", perks: "15% off · free delivery", count: 248 },
  { name: "Platinum", points: "5,000+", perks: "20% off · VIP table · gifts", count: 84 },
];

function LoyaltyPage() {
  return (
    <>
      <DashboardHeader title="Loyalty" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Loyalty Points" subtitle="Tiers, points balances, and lifetime rewards.">
          <Button size="sm">+ Adjust points</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <AnalyticsCard label="Points issued" value="184,200" delta={7.4} icon={<Gift className="h-4 w-4" />} />
          <AnalyticsCard label="Points redeemed" value="62,800" delta={12.1} icon={<TrendingUp className="h-4 w-4" />} />
          <AnalyticsCard label="VIPs (Gold+)" value="332" delta={3.2} icon={<Crown className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.name}</span>
                  <Pill tone={t.name === "Platinum" ? "primary" : t.name === "Gold" ? "warning" : t.name === "Silver" ? "info" : "muted"}>{t.count}</Pill>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{t.points} pts</div>
                <div className="mt-3 text-sm">{t.perks}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Top loyalty customers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {customers.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Pill tone={c.tier === "Platinum" ? "primary" : c.tier === "Gold" ? "warning" : c.tier === "Silver" ? "info" : "muted"}>{c.tier}</Pill>
                  <span className="font-semibold tabular-nums">{c.loyaltyPoints.toLocaleString()} pts</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
