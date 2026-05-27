import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pill } from "@/components/dashboard/status-badge";
import { foodItems } from "@/lib/mock-data";
import { Plus, Flame } from "lucide-react";

export const Route = createFileRoute("/_dashboard/menu")({
  head: () => ({ meta: [{ title: "Menu — Happy Home Admin" }] }),
  component: MenuPage,
});

function MenuPage() {
  return (
    <>
      <DashboardHeader title="Menu" subtitle={`${foodItems.length} items`} />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Menu Items" subtitle="Manage food, pricing, and availability across categories.">
          <Button asChild variant="outline" size="sm"><Link to="/menu/categories">Categories</Link></Button>
          <Button asChild size="sm"><Link to="/menu/new"><Plus className="h-3.5 w-3.5" /> Add item</Link></Button>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foodItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/20 via-chart-4/15 to-chart-5/20 relative">
                {item.popular && (
                  <Pill tone="warning" className="absolute right-2 top-2"><Flame className="h-3 w-3" /> Popular</Pill>
                )}
                <div className="absolute bottom-2 left-2"><Pill tone="muted">{item.category}</Pill></div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold leading-tight">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.prepTime} min prep · Stock: {item.stock}</p>
                  </div>
                  <Switch defaultChecked={item.available} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-semibold tabular-nums">Rs {item.price.toLocaleString()}</div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
