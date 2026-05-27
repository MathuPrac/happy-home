import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeliveryMapCard({ className, height = 220, showRoute = true }: { className?: string; height?: number; showRoute?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border map-canvas", className)} style={{ height }}>
      {showRoute && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
          <path d="M40,180 C 120,150 160,80 220,80 S 340,40 380,40"
                stroke="oklch(0.68 0.2 38)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="0" />
          <path d="M40,180 C 120,150 160,80 220,80 S 340,40 380,40"
                stroke="oklch(0.68 0.2 38 / 0.3)" strokeWidth="10" fill="none" strokeLinecap="round" />
        </svg>
      )}
      {/* Pickup pin */}
      <div className="absolute left-[10%] top-[78%] -translate-y-1/2">
        <div className="h-3 w-3 rounded-full bg-foreground ring-4 ring-background" />
        <span className="absolute left-5 top-0 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground text-background text-[10px] font-medium px-2 py-0.5">Pickup</span>
      </div>
      {/* Drop pin */}
      <div className="absolute left-[92%] top-[18%]">
        <div className="h-4 w-4 rounded-full bg-brand ring-4 ring-background shadow-lg" />
      </div>
      {/* Rider marker */}
      <div className="absolute left-[44%] top-[42%]">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-info/40 animate-ping" />
          <div className="relative h-6 w-6 rounded-full bg-info grid place-items-center ring-4 ring-background shadow-md">
            <Navigation className="h-3 w-3 text-info-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
