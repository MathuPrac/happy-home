import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function AvailabilityToggle({ online, onChange }: { online: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl px-4 py-3 border transition-colors",
      online ? "bg-success/10 border-success/30" : "bg-muted border-border"
    )}>
      <span className={cn("relative flex h-2.5 w-2.5", online ? "" : "opacity-40")}>
        {online && <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />}
        <span className={cn("relative h-2.5 w-2.5 rounded-full", online ? "bg-success" : "bg-muted-foreground")} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{online ? "You're online" : "You're offline"}</p>
        <p className="text-xs text-muted-foreground truncate">
          {online ? "Receiving delivery orders" : "Toggle on to start receiving"}
        </p>
      </div>
      <Switch checked={online} onCheckedChange={onChange} />
    </div>
  );
}
