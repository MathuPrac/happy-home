'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { dishes } from '@/features/menu/data/menu.data';
import { SectionTitle } from '@/layouts/section-title';

export function SignaturesSection() {
  const signatures = dishes.filter((d) => d.signature).slice(0, 3);

  return (
    <section className="container-luxe py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionTitle eyebrow="Signatures" title="Dishes we are known for." />
        <Link
          href="/menu"
          className="text-sm uppercase tracking-[0.25em] text-gold transition-colors hover:text-gold-soft"
        >
          Full menu →
        </Link>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {signatures.map((dish, index) => (
          <motion.article
            key={dish.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: 'easeOut' }}
            className="group relative overflow-hidden rounded-sm border border-border bg-card transition-all hover:border-gold/40 hover:shadow-luxe"
          >
            {dish.image ? (
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : null}
            <div className="p-7">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                <Star className="h-3 w-3 fill-current" /> {dish.cuisine}
              </div>
              <h3 className="mt-3 font-display text-2xl">{dish.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dish.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-display text-xl text-gold">${dish.price}</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {dish.category}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
