import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 pt-20"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}

export function SectionTitle({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-2xl"
    >
      {eyebrow && <div className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</div>}
      <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05]">{title}</h2>
      {lead && <p className="mt-5 text-muted-foreground leading-relaxed">{lead}</p>}
    </motion.div>
  );
}
