import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, MessageSquare, Check } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ReservationCard } from "@/components/common/ReservationCard";
import { RESERVATIONS, RESTAURANT } from "@/constants/mock-data";

export const Route = createFileRoute("/reservation")({
  component: Reservation,
});

const TIMES = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"];
const DAYS = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.getDate(),
    iso: d.toISOString(),
  };
});

function Reservation() {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("8:00 PM");
  const [guests, setGuests] = useState(2);
  const [done, setDone] = useState(false);

  return (
    <MobileShell>
      <ScreenHeader title="Reserve a table" subtitle={RESTAURANT.name + " · " + RESTAURANT.address} />
      <div className="px-5 py-4 space-y-5 pb-10">
        {done ? (
          <div className="rounded-3xl bg-success/10 border border-success/30 p-6 text-center">
            <div className="grid place-items-center mx-auto h-14 w-14 rounded-full bg-success text-success-foreground mb-3">
              <Check className="h-7 w-7" />
            </div>
            <p className="font-display text-xl font-bold">Table booked!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {DAYS[day].label}, {DAYS[day].date} · {time} · {guests} guests
            </p>
            <p className="text-xs text-muted-foreground mt-3">A confirmation has been sent to your phone.</p>
          </div>
        ) : (
          <>
            <section>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Select date</p>
              <div className="flex overflow-x-auto no-scrollbar gap-2 -mx-5 px-5 pb-1">
                {DAYS.map((d, i) => {
                  const active = day === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setDay(i)}
                      className={`flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition ${
                        active ? "bg-accent text-accent-foreground" : "bg-card border border-border"
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-80">{d.label}</span>
                      <span className="font-display text-2xl font-bold">{d.date}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Time</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                      time === t ? "bg-accent text-accent-foreground" : "bg-card border border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Guests</p>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="font-semibold">{guests} guest{guests !== 1 && "s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="grid place-items-center h-9 w-9 rounded-full bg-secondary">−</button>
                  <button onClick={() => setGuests(Math.min(12, guests + 1))} className="grid place-items-center h-9 w-9 rounded-full bg-accent text-accent-foreground">+</button>
                </div>
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Special request</p>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1.5" />
                <input placeholder="Anniversary, window seat, etc." className="flex-1 bg-transparent outline-none text-sm py-1.5 placeholder:text-muted-foreground" />
              </div>
            </section>

            <button
              onClick={() => setDone(true)}
              className="w-full h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition"
            >
              Confirm reservation
            </button>
          </>
        )}

        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 mt-2">Your bookings</p>
          <div className="space-y-2">
            {RESERVATIONS.map((r) => <ReservationCard key={r.id} r={r} />)}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
