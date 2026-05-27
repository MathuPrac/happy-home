import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_dashboard/settings/system")({
  head: () => ({ meta: [{ title: "System — Happy Home Admin" }] }),
  component: SystemPage,
});

function SystemPage() {
  return (
    <>
      <DashboardHeader title="System" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="System Settings" subtitle="Platform behavior, integrations, and data." />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Localization</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Language</Label>
                <Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Date format</Label>
                <Select defaultValue="dmy"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dmy">DD/MM/YYYY</SelectItem><SelectItem value="mdy">MM/DD/YYYY</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Currency display</Label>
                <Select defaultValue="symbol"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="symbol">Symbol (Rs)</SelectItem><SelectItem value="code">Code (LKR)</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Receipt prefix</Label><Input defaultValue="HH" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["POS Sync","Accounting (QuickBooks)","SMS Gateway","WhatsApp Business","Google Analytics"].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{i}</span>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { l: "Require 2FA for all admins", d: true },
                { l: "Auto-logout after 30m idle", d: true },
                { l: "IP allowlist for admin", d: false },
              ].map((s) => (
                <div key={s.l} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{s.l}</span><Switch defaultChecked={s.d} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Data</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">Export all data (CSV)</Button>
              <Button variant="outline" className="w-full">Download audit log</Button>
              <Button variant="destructive" className="w-full">Wipe demo data</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
