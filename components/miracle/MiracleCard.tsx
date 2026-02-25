'use client';

import { motion } from 'framer-motion';

interface MiracleCardProps {
  text: string;
  index: number;
}

export function MiracleCard({ text, index }: MiracleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative rounded-lg border-l-[3px] border-l-accent bg-card p-5 animate-card-glow transition-all duration-300 hover:bg-muted"
    >
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 30px rgba(249,115,22,0.08)' }} />
      <p className="text-card-foreground leading-relaxed text-[15px] relative z-10">
        {text}
      </p>
    </motion.div>
  );
}
