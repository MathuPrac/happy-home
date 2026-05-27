import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Star } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/PageShell";
import { dishes, categories } from "@/lib/menu-data";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Happy Home Restaurant" },
      { name: "description", content: "Explore the Happy Home menu: signature Sri Lankan curries, Indian classics, breads, rice, and heritage desserts." },
      { property: "og:title", content: "Menu — Happy Home Restaurant" },
      { property: "og:description", content: "Signature Sri Lankan and Indian dishes, composed with restraint." },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [cuisine, setCuisine] = useState<"All" | "Sri Lankan" | "Indian">("All");
  const filtered = dishes.filter((d) => cuisine === "All" || d.cuisine === cuisine);

  return (
    <PageShell>
      <section className="container-luxe py-20">
        <SectionTitle
          eyebrow="The menu"
          title="A composed evening."
          lead="Served à la carte. Most dishes are designed to share — your server will guide pairings."
        />

        <div className="mt-12 flex flex-wrap gap-2">
          {(["All", "Sri Lankan", "Indian"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={`relative rounded-sm border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all ${
                cuisine === c
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-gold/60 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-20 space-y-24">
          {categories.map((cat) => {
            const items = filtered.filter((d) => d.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-6 mb-10">
                  <h3 className="font-display text-3xl md:text-4xl">{cat}</h3>
                  <div className="flex-1 hairline" />
                </div>

                <AnimatePresence mode="popLayout">
                  <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
                    {items.map((d, i) => (
                      <motion.div
                        key={d.name}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.04 }}
                        className="group"
                      >
                        <div className="flex items-baseline gap-4">
                          <h4 className="font-display text-2xl text-foreground">
                            {d.name}
                            {d.signature && <Star className="inline ml-2 h-3.5 w-3.5 fill-gold text-gold" />}
                          </h4>
                          <div className="flex-1 border-b border-dashed border-border" />
                          <span className="font-display text-xl text-gold">${d.price}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">{d.cuisine}</p>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="mt-24 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Star className="inline h-3 w-3 fill-gold text-gold mr-2" />
          Chef's signature · Prices in USD · 10% service added
        </p>
      </section>
    </PageShell>
  );
}
