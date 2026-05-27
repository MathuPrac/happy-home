'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { categories, dishes } from '@/features/menu/data/menu.data';
import { PageShell } from '@/layouts/page-shell';
import { SectionTitle } from '@/layouts/section-title';

export function MenuPage() {
  const [cuisine, setCuisine] = useState<'All' | 'Sri Lankan' | 'Indian'>('All');
  const filtered = dishes.filter((d) => cuisine === 'All' || d.cuisine === cuisine);

  return (
    <PageShell>
      <section className="container-luxe py-20">
        <SectionTitle
          eyebrow="The menu"
          title="A composed evening."
          lead="Served à la carte. Most dishes are designed to share — your server will guide pairings."
        />

        <div className="mt-12 flex flex-wrap gap-2">
          {(['All', 'Sri Lankan', 'Indian'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCuisine(c)}
              className={`relative rounded-sm border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all ${
                cuisine === c
                  ? 'border-gold bg-gold text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-gold/60 hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-20 space-y-24">
          {categories.map((category) => {
            const items = filtered.filter((d) => d.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <div className="mb-10 flex items-center gap-6">
                  <h3 className="font-display text-3xl md:text-4xl">{category}</h3>
                  <div className="hairline flex-1" />
                </div>

                <AnimatePresence mode="popLayout">
                  <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
                    {items.map((dish, index) => (
                      <motion.div
                        key={dish.name}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.04 }}
                        className="group"
                      >
                        <div className="flex items-baseline gap-4">
                          <h4 className="font-display text-2xl text-foreground">
                            {dish.name}
                            {dish.signature ? (
                              <Star className="ml-2 inline h-3.5 w-3.5 fill-gold text-gold" />
                            ) : null}
                          </h4>
                          <div className="flex-1 border-b border-dashed border-border" />
                          <span className="font-display text-xl text-gold">${dish.price}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {dish.description}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
                          {dish.cuisine}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="mt-24 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Star className="mr-2 inline h-3 w-3 fill-gold text-gold" />
          Chef&apos;s signature · Prices in USD · 10% service added
        </p>
      </section>
    </PageShell>
  );
}
