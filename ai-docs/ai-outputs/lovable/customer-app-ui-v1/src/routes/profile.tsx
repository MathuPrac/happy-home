import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight, CreditCard, MapPin, Bell, Tag, Calendar,
  Settings, LogOut, Crown, Sun, Moon, HelpCircle
} from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { TabBar } from "@/components/layout/TabBar";
import { LoyaltyCard } from "@/components/common/LoyaltyCard";
import { USER } from "@/constants/mock-data";
import { useTheme } from "@/store/theme";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const mode = useTheme((s) => s.mode);
  const toggle = useTheme((s) => s.toggle);

  return (
    <MobileShell withTabBar>
      <header className="px-5 pt-3 pb-2 flex items-center justify-between" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <button onClick={toggle} className="grid place-items-center h-10 w-10 rounded-full bg-card border border-border">
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <div className="px-5 pt-3 pb-6 space-y-4">
        <div className="flex items-center gap-3">
          <img src={USER.avatar} alt="" className="h-16 w-16 rounded-2xl ring-2 ring-accent/40 bg-secondary" />
          <div className="flex-1">
            <p className="font-display text-lg font-bold">{USER.name}</p>
            <p className="text-xs text-muted-foreground">{USER.email}</p>
            <p className="text-xs text-muted-foreground">{USER.phone}</p>
          </div>
          <button className="text-xs font-semibold text-accent">Edit</button>
        </div>

        <Link to="/loyalty"><LoyaltyCard user={USER} /></Link>

        <Section title="Account">
          <Row icon={<CreditCard className="h-4 w-4" />} label="Saved cards" to="/cards" />
          <Row icon={<MapPin className="h-4 w-4" />} label="Delivery addresses" to="/checkout/address" />
          <Row icon={<Bell className="h-4 w-4" />} label="Notifications" to="/notifications" />
        </Section>

        <Section title="Discover">
          <Row icon={<Tag className="h-4 w-4" />} label="Offers & promotions" to="/offers" />
          <Row icon={<Calendar className="h-4 w-4" />} label="Table reservations" to="/reservation" />
          <Row icon={<Crown className="h-4 w-4" />} label="Loyalty rewards" to="/loyalty" />
        </Section>

        <Section title="More">
          <Row icon={<Settings className="h-4 w-4" />} label="Settings" to="/settings" />
          <Row icon={<HelpCircle className="h-4 w-4" />} label="Help & support" to="/settings" />
        </Section>

        <button
          onClick={() => nav({ to: "/auth/login" })}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-card border border-border text-spice font-semibold text-sm active:scale-[0.99] transition"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>

        <p className="text-center text-[11px] text-muted-foreground">Happy Home v1.0.0</p>
      </div>
      <TabBar />
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">{title}</p>
      <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

type RowTo = "/cards" | "/checkout/address" | "/notifications" | "/offers" | "/reservation" | "/loyalty" | "/settings";

function Row({ icon, label, to }: { icon: React.ReactNode; label: string; to: RowTo }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary transition">
      <span className="grid place-items-center h-9 w-9 rounded-xl bg-secondary text-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
