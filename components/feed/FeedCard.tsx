'use client';

import { motion } from 'framer-motion';
import { Flame, Heart, Eye } from 'lucide-react';

export type FeedItemType = 'miracle' | 'confession';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  content: string;
  timestamp: string;
  likes?: number;
  views?: number;
}

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const isMiracle = item.type === 'miracle';

  return (
    <motion.article
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative rounded-lg border-l-[3px] p-5 animate-card-glow transition-all duration-300 hover:bg-muted ${
        isMiracle ? 'border-l-accent bg-card' : 'border-l-flame-400 bg-[#111118]'
      }`}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: isMiracle
            ? '0 0 30px rgba(249,115,22,0.08)'
            : '0 0 30px rgba(251,146,60,0.06)',
        }}
      />

      {/* Type badge */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold ${
            isMiracle ? 'text-accent' : 'text-flame-400'
          }`}
        >
          <Flame className="h-3 w-3" />
          {isMiracle ? 'Miracle' : 'Confession'}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {item.timestamp}
        </span>
      </div>

      {/* Content */}
      <p
        className={`leading-relaxed text-[15px] relative z-10 whitespace-pre-line ${
          isMiracle ? 'text-card-foreground' : 'text-card-foreground/90 italic'
        }`}
      >
        {isMiracle ? item.content : `"${item.content}"`}
      </p>

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-4 relative z-10">
        {item.likes !== undefined && (
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors text-xs">
            <Heart className="h-3.5 w-3.5" />
            {item.likes}
          </button>
        )}
        {item.views !== undefined && (
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Eye className="h-3.5 w-3.5" />
            {item.views}
          </span>
        )}
      </div>
    </motion.article>
  );
}
