import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bike } from "lucide-react";
import { APP } from "@/constants/app";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav({ to: "/login" }), 1600);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <div className="device-shell flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-brand to-[oklch(0.55_0.2_30)] text-brand-foreground">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="h-24 w-24 rounded-3xl bg-white/15 backdrop-blur grid place-items-center shadow-2xl"
      >
        <Bike className="h-12 w-12" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-6 text-2xl font-bold tracking-tight">{APP.name}</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.5 }}
        className="text-sm mt-1">{APP.tagline}</motion.p>
      <motion.div className="absolute bottom-10 text-xs text-white/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        Loading your shift…
      </motion.div>
      <Link to="/login" className="sr-only">Continue</Link>
    </div>
  );
}
