import { Crown } from "lucide-react";
import type { UserProfile } from "@/types";

export function LoyaltyCard({ user }: { user: UserProfile }) {
  const next = user.tier === "Platinum" ? 5000 : user.tier === "Gold" ? 3000 : 1500;
  const pct = Math.min(100, Math.round((user.loyaltyPoints / next) * 100));
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.22_0.03_30)] dark:from-card dark:to-[oklch(0.28_0.04_60)] p-5 text-primary-foreground">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest opacity-70">Loyalty</p>
          <h2 className="font-display text-3xl font-bold mt-1">{user.loyaltyPoints.toLocaleString()}<span className="text-sm font-normal opacity-70 ml-1">pts</span></h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
          <Crown className="h-3 w-3" />
          {user.tier}
        </div>
      </div>
      <div className="relative mt-5">
        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] opacity-80 mt-2">{next - user.loyaltyPoints} pts to next reward</p>
      </div>
    </div>
  );
}
