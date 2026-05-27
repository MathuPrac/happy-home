import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";

export const Route = createFileRoute("/checkout/success")({
  component: Success,
});

function Success() {
  return (
    <MobileShell>
      <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-success/30 blur-2xl animate-pulse" />
          <div className="relative grid place-items-center h-24 w-24 rounded-full bg-success text-success-foreground">
            <Check className="h-12 w-12" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display text-3xl font-bold mt-8"
        >
          Order confirmed!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground mt-2 max-w-[280px]"
        >
          Our kitchen has started preparing your meal. We'll keep you posted every step of the way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8 w-full max-w-sm rounded-2xl bg-card border border-border p-5"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Order code</p>
          <p className="font-display text-2xl font-bold mt-1">HH-2841</p>
          <p className="text-xs text-muted-foreground mt-2">Estimated arrival · <span className="text-accent font-semibold">25–35 min</span></p>
        </motion.div>

        <div className="flex flex-col gap-3 w-full max-w-sm mt-8">
          <Link
            to="/orders/$id"
            params={{ id: "o1" }}
            className="h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-sm text-center"
          >
            Track your order
          </Link>
          <Link to="/home" className="py-3 text-sm text-muted-foreground font-medium text-center">
            Back to home
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}
