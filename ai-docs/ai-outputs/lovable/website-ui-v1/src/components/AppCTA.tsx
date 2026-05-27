import { motion } from "framer-motion";
import { Apple, Smartphone } from "lucide-react";

export function AppCTA() {
  return (
    <section className="container-luxe py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-sm border border-gold/20 bg-card p-10 md:p-16"
      >
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gold">The Happy Home App</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">
              Your table, <span className="gradient-text">in your pocket.</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
              Reserve, reorder favourites, and unlock chef's tasting events before anyone else.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="https://apps.apple.com/app/happy-home"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-sm border border-border bg-background/60 px-6 py-4 transition-all hover:border-gold/60"
              >
                <Apple className="h-6 w-6 text-gold" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Download on the</div>
                  <div className="text-sm font-medium">App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=lk.happyhome"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-sm border border-border bg-background/60 px-6 py-4 transition-all hover:border-gold/60"
              >
                <Smartphone className="h-6 w-6 text-gold" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Get it on</div>
                  <div className="text-sm font-medium">Google Play</div>
                </div>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Already installed?{" "}
              <a href="happyhome://open" className="text-gold underline-offset-4 hover:underline">
                Open the app →
              </a>
            </p>
          </div>

          <div className="relative h-72 md:h-96">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative h-full w-48 rounded-3xl border-4 border-gold/30 bg-gradient-to-br from-background to-card p-3 shadow-luxe">
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-card via-background to-card flex flex-col items-center justify-center gap-3 px-3">
                  <div className="font-display text-2xl text-center">Happy <span className="gradient-text">Home</span></div>
                  <div className="hairline w-16" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center">Table for two<br/>Friday · 8:00 pm</p>
                  <div className="mt-3 h-8 w-full rounded-sm bg-gold/90 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-primary-foreground">
                    Confirmed
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
