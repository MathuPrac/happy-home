'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  lead?: string;
}

export function SectionTitle({ eyebrow, title, lead }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="max-w-2xl"
    >
      {eyebrow ? (
        <motion.div className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</motion.div>
      ) : null}
      <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">{title}</h2>
      {lead ? <p className="mt-5 leading-relaxed text-muted-foreground">{lead}</p> : null}
    </motion.div>
  );
}
