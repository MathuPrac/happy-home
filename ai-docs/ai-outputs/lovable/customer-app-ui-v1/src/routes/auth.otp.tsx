import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

export const Route = createFileRoute("/auth/otp")({
  component: Otp,
});

function Otp() {
  const nav = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 3) refs.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === 4) {
      setTimeout(() => nav({ to: "/home" }), 350);
    }
  };

  return (
    <MobileShell>
      <ScreenHeader transparent />
      <div className="px-6 pt-2">
        <h1 className="font-display text-3xl font-bold">Verify it's you</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We sent a 4-digit code to <span className="text-foreground font-medium">+94 77 234 ••21</span>
        </p>

        <div className="flex justify-between gap-3 mt-10 max-w-[320px]">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
              inputMode="numeric"
              maxLength={1}
              className="h-16 w-16 text-center text-2xl font-display font-bold rounded-2xl bg-card border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition"
            />
          ))}
        </div>

        <button
          onClick={() => nav({ to: "/home" })}
          className="w-full mt-10 h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition"
        >
          Verify
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Didn't get a code? <button className="text-accent font-semibold">Resend in 0:32</button>
        </p>
      </div>
    </MobileShell>
  );
}
