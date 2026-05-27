import { Star, Bike } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Rider } from "@/types";

export function RiderStatusCard({ rider }: { rider: Rider }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-brand text-brand-foreground font-semibold">
          {rider.name.split(" ").map((s) => s[0]).slice(0,2).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="font-semibold text-foreground truncate">{rider.name}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          <Star className="h-4 w-4 fill-warning text-warning" /> {rider.rating}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Bike className="h-3 w-3" /> {rider.vehicle.plate}
        </span>
      </div>
    </div>
  );
}
