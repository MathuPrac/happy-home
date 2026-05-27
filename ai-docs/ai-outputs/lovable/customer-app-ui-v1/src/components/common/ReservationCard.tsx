import { Calendar, Clock, Users } from "lucide-react";
import type { Reservation } from "@/types";

export function ReservationCard({ r }: { r: Reservation }) {
  const tone =
    r.status === "confirmed"
      ? "bg-success/15 text-success"
      : r.status === "pending"
      ? "bg-accent/15 text-accent"
      : "bg-muted text-muted-foreground";
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tone}`}>
          {r.status}
        </span>
        <span className="text-[10px] text-muted-foreground">#{r.id.toUpperCase()}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-accent" />{r.date}</div>
        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent" />{r.time}</div>
        <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-accent" />{r.guests}</div>
      </div>
    </div>
  );
}
