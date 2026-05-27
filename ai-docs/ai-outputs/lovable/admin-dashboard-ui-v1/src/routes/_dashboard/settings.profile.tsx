import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_dashboard/settings/profile")({
  head: () => ({ meta: [{ title: "Profile — Happy Home Admin" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <>
      <DashboardHeader title="Profile" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Profile Settings" subtitle="Your personal account and preferences." />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24"><AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-2xl text-primary-foreground">SW</AvatarFallback></Avatar>
              <Button variant="outline" size="sm">Change photo</Button>
              <p className="text-center text-xs text-muted-foreground">PNG or JPG · up to 2MB</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue="Saman Wijesekara" /></div>
              <div className="space-y-1.5"><Label>Role</Label><Input defaultValue="Admin" disabled /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="saman@happyhome.lk" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+94 77 123 4567" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>New password</Label><Input type="password" placeholder="Leave blank to keep current" /></div>
              <div className="sm:col-span-2 flex justify-end gap-2"><Button variant="outline">Cancel</Button><Button>Save profile</Button></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { l: "Desktop notifications", d: true },
              { l: "Email order summaries", d: true },
              { l: "SMS alerts for critical events", d: false },
              { l: "Two-factor authentication", d: true },
            ].map((s) => (
              <div key={s.l} className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">{s.l}</span><Switch defaultChecked={s.d} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
