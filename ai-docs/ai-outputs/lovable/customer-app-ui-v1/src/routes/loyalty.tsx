import { createFileRoute } from "@tanstack/react-router";
import { Gift, Coffee, Utensils, Crown } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { LoyaltyCard } from "@/components/common/LoyaltyCard";
import { USER } from "@/constants/mock-data";

export const Route = createFileRoute("/loyalty")({
  component: Loyalty,
});

const REWARDS = [
  { points: 500, title: "Garlic Naan", icon: Utensils, unlocked: true },
  { points: 1000, title: "Mojito or Lassi", icon: Coffee, unlocked: true },
  { points: 1500, title: "Free dessert", icon: Gift, unlocked: true },
  { points: 2500, title: "Free Biriyani", icon: Utensils, unlocked: false },
  { points: 4000, title: "Royal Grill Platter", icon: Crown, unlocked: false },
];

const HISTORY = [
  { date: "Today", desc: "Order HH-2841 · +145 pts", points: 145 },
  { date: "Yesterday", desc: "Order HH-2710 · +245 pts", points: 245 },
  { date: "May 12", desc: "Order HH-2655 · +242 pts", points: 242 },
  { date: "May 8", desc: "Reward redeemed · Free Naan", points: -500 },
];

function Loyalty() {
  return (
    <MobileShell>
      <ScreenHeader title="Loyalty rewards" subtitle={`${USER.tier} member`} />
      <div className="px-5 py-4 space-y-5 pb-10">
        <LoyaltyCard user={USER} />

        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Rewards you can unlock</p>
          <div className="grid grid-cols-2 gap-3">
            {REWARDS.map((r) => {
              const Icon = r.icon;
              const reached = USER.loyaltyPoints >= r.points;
              return (
                <div
                  key={r.points}
                  className={`rounded-2xl p-4 border ${reached ? "border-accent bg-accent/5" : "border-border bg-card opacity-60"}`}
                >
                  <div className={`grid place-items-center h-10 w-10 rounded-xl ${reached ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold mt-3">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.points.toLocaleString()} pts</p>
                  {reached && <button className="mt-2 text-xs font-bold text-accent">Redeem →</button>}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Recent activity</p>
          <div className="rounded-2xl bg-card border border-border divide-y divide-border">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{h.desc}</p>
                  <p className="text-[11px] text-muted-foreground">{h.date}</p>
                </div>
                <span className={`text-sm font-bold ${h.points > 0 ? "text-success" : "text-spice"}`}>
                  {h.points > 0 ? `+${h.points}` : h.points}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
