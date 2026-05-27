import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import hero from "@/assets/hero/restaurant.jpg";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav({ to: "/onboarding" }), 1800);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="min-h-dvh w-full flex justify-center bg-background">
      <div className="relative w-full max-w-[440px] min-h-dvh overflow-hidden bg-[oklch(0.16_0.018_40)] text-white">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />
        <div className="relative flex flex-col items-center justify-center min-h-dvh px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid place-items-center h-24 w-24 rounded-[28px] bg-accent text-accent-foreground shadow-[var(--shadow-luxe)] mb-6"
          >
            <span className="font-display text-5xl font-bold leading-none">H</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="font-display text-4xl font-bold tracking-tight"
          >
            Happy Home
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-2 text-sm tracking-[0.3em] uppercase text-accent"
          >
            Sri Lankan · Indian
          </motion.p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="h-1 w-32 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="h-full bg-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
