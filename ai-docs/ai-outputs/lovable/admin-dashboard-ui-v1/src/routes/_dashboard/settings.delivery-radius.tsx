import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";

export const Route = createFileRoute("/_dashboard/settings/delivery-radius")({
  head: () => ({ meta: [{ title: "Delivery Radius — Happy Home Admin" }] }),
  component: RadiusPage,
});

function RadiusPage() {
  const [radius, setRadius] = React.useState([8]);
  return (
    <>
      <DashboardHeader title="Delivery Radius" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Delivery Radius Settings" subtitle="Where your riders can deliver from this branch." />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Coverage area</CardTitle><CardDescription>Visualization of your service radius</CardDescription></CardHeader>
            <CardContent>
              <div className="relative h-80 overflow-hidden rounded-xl bg-gradient-to-br from-info/10 via-muted to-primary/10 ring-1 ring-inset ring-border [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:24px_24px]">
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 ring-2 ring-primary/40 transition-all"
                  style={{ width: `${radius[0] * 18}px`, height: `${radius[0] * 18}px` }}
                />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/30" />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Maximum delivery distance</span>
                  <span className="font-semibold tabular-nums">{radius[0]} km</span>
                </div>
                <Slider value={radius} onValueChange={setRadius} min={1} max={20} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Delivery rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label>Minimum order (Rs)</Label><Input defaultValue="800" /></div>
              <div className="space-y-1.5"><Label>Base delivery fee (Rs)</Label><Input defaultValue="250" /></div>
              <div className="space-y-1.5"><Label>Per-km surcharge (Rs)</Label><Input defaultValue="40" /></div>
              {[
                { l: "Free delivery above Rs 5,000", d: true },
                { l: "Surge pricing on rain", d: false },
                { l: "Allow late-night delivery", d: true },
              ].map((s) => (
                <div key={s.l} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{s.l}</span><Switch defaultChecked={s.d} />
                </div>
              ))}
              <Button className="w-full">Save delivery rules</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
