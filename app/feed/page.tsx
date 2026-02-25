'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame } from 'lucide-react';
import Link from 'next/link';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';
import { MiracleCard } from '@/components/miracle/MiracleCard';

interface Miracle {
  id: string;
  content: string;
  createdAt: string;
  views: number;
  likes: number;
}

const FALLBACK_MIRACLES = [
  "I carried a storm inside me for years.\nToday, for the first time,\nI felt the sun break through.",
  "They said I was too broken to be loved.\nBut the cracks are where\nthe light learned to enter.",
  "I whispered my pain into the void.\nThe void whispered back:\n'You are not alone.'",
  "Three years of silence.\nOne moment of honesty.\nA lifetime of healing began.",
  "I thought the fire would consume me.\nInstead, it forged me\ninto something unbreakable.",
  "The weight I carried\nwasn't mine to hold.\nI finally set it down today.",
];

export default function FeedPage() {
  const [miracles, setMiracles] = useState<Miracle[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetch('/api/miracle/feed')
      .then((res) => res.json())
      .then((data) => {
        if (data.miracles && data.miracles.length > 0) {
          setMiracles(data.miracles);
        } else {
          setUseFallback(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setUseFallback(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CrisisBanner />

      <header className="flex items-center gap-4 px-6 py-5">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Miracle Feed</h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-20">
        <p className="text-muted-foreground text-sm mb-8">
          Anonymous confessions transformed into light
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Flame className="h-6 w-6 text-accent" />
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {useFallback
              ? FALLBACK_MIRACLES.map((text, i) => (
                  <MiracleCard key={i} text={text} index={i} />
                ))
              : miracles.map((miracle, i) => (
                  <MiracleCard
                    key={miracle.id}
                    text={miracle.content}
                    index={i}
                  />
                ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/confess"
            className="inline-flex items-center gap-2 bg-accent hover:bg-flame-600 text-accent-foreground font-bold py-3 px-8 rounded-lg transition-all"
          >
            <Flame className="h-4 w-4" />
            Share Your Story
          </Link>
        </div>
      </main>
    </div>
  );
}
