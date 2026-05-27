import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import biriyani from "@/assets/food/biriyani.jpg";
import grill from "@/assets/food/grill-platter.jpg";
import butterChicken from "@/assets/food/butter-chicken.jpg";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const slides = [
  { image: biriyani, eyebrow: "Welcome", title: "Authentic flavors,\nplated like art.", body: "Savor signature Sri Lankan kottu and slow-cooked Indian classics from our chefs." },
  { image: grill, eyebrow: "Effortless ordering", title: "Your table.\nDelivered.", body: "Track your meal from our kitchen to your door, with our own riders — every time." },
  { image: butterChicken, eyebrow: "Rewards", title: "Dine more.\nEarn more.", body: "Join Happy Home Gold and unlock complimentary courses, priority bookings & more." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const isLast = i === slides.length - 1;

  return (
    <div className="min-h-dvh w-full flex justify-center bg-background">
      <div className="relative w-full max-w-[440px] min-h-dvh overflow-hidden bg-background">
        <div className="relative h-[58vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={i}
              src={slides[i].image}
              alt=""
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
          <button
            onClick={() => nav({ to: "/auth/login" })}
            className="absolute top-4 right-4 text-white/90 text-sm font-medium px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md"
            style={{ marginTop: "env(safe-area-inset-top)" }}
          >
            Skip
          </button>
        </div>

        <div className="relative -mt-12 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">{slides[i].eyebrow}</p>
              <h2 className="font-display text-[34px] leading-[1.05] font-bold mt-3 whitespace-pre-line">
                {slides[i].title}
              </h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-[90%]">{slides[i].body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5 mt-8">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-8 bg-accent" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-10">
            <Link to="/auth/login" className="text-sm font-medium text-muted-foreground">
              Sign in
            </Link>
            <button
              onClick={() => (isLast ? nav({ to: "/auth/register" }) : setI(i + 1))}
              className="flex items-center gap-1.5 pl-5 pr-2 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-sm shadow-[var(--shadow-luxe)] active:scale-95 transition"
            >
              {isLast ? "Get Started" : "Next"}
              <span className="grid place-items-center h-8 w-8 rounded-full bg-accent-foreground text-accent">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
