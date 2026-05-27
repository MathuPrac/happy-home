import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Wallet, Settings, LifeBuoy, LogOut, Bike, Star, Shield } from "lucide-react";
import { AppHeader } from "@/components/rider/AppHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRiderState } from "@/stores/rider-store";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const nav = useNavigate();
  const rider = useRiderState((s) => s.rider);
  return (
    <>
      <AppHeader title="Profile" />
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-brand text-brand-foreground text-lg font-bold">
              {rider.name.split(" ").map(s => s[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-lg truncate">{rider.name}</p>
            <p className="text-xs text-muted-foreground">{rider.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{rider.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Tile icon={Star} label="Rating" value={rider.rating.toFixed(1)} />
          <Tile icon={Bike} label="Trips" value={rider.totalDeliveries.toLocaleString()} />
          <Tile icon={Shield} label="Tier" value="Gold" />
        </div>

        <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
          <Row to="/app/earnings" icon={Wallet} label="Earnings & payouts" />
          <Row to="/app/settings" icon={Settings} label="App settings" />
          <Row to="/app/support" icon={LifeBuoy} label="Emergency support" tone="destructive" />
          <button onClick={() => nav({ to: "/login" })} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-destructive hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground pt-2">Happy Home Rider · v1.0.0</p>
      </div>
    </>
  );
}

function Tile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3 text-center">
      <Icon className="h-4 w-4 text-muted-foreground mx-auto" />
      <p className="mt-1 text-base font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ to, icon: Icon, label, tone }: { to: string; icon: React.ElementType; label: string; tone?: "destructive" }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted">
      <Icon className={`h-4 w-4 ${tone === "destructive" ? "text-destructive" : "text-muted-foreground"}`} />
      <span className={`flex-1 text-sm ${tone === "destructive" ? "text-destructive" : "text-foreground"} font-medium`}>{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
