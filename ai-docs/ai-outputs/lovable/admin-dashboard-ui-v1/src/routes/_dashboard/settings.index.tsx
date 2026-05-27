import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_dashboard/settings/")({
  head: () => ({ meta: [{ title: "Restaurant Settings — Happy Home Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Restaurant Settings" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Restaurant Settings" subtitle="Brand, hours, contact, and operational defaults." />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Brand & Contact</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label>Restaurant name</Label><Input defaultValue="Happy Home Restaurant" /></div>
              <div className="space-y-1.5"><Label>Cuisine</Label><Input defaultValue="Sri Lankan + Indian" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+94 11 234 5678" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Textarea rows={2} defaultValue="42 Galle Road, Colombo 03, Sri Lanka" /></div>
              <div className="space-y-1.5"><Label>Currency</Label>
                <Select defaultValue="lkr"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="lkr">LKR — Rs</SelectItem><SelectItem value="usd">USD — $</SelectItem><SelectItem value="inr">INR — ₹</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Timezone</Label>
                <Select defaultValue="colombo"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="colombo">Asia/Colombo</SelectItem><SelectItem value="kolkata">Asia/Kolkata</SelectItem>
                </SelectContent></Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Operational</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { l: "Accept online orders", d: true },
                { l: "Accept dine-in reservations", d: true },
                { l: "Accept delivery orders", d: true },
                { l: "Pause kitchen (closed)", d: false },
              ].map((s) => (
                <div key={s.l} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{s.l}</span><Switch defaultChecked={s.d} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Operating hours</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-7">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
              <div key={d} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{d}</span><Switch defaultChecked /></div>
                <div className="flex gap-2 text-xs"><Input defaultValue="10:00" className="h-8" /><Input defaultValue="23:30" className="h-8" /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </div>
    </>
  );
}
