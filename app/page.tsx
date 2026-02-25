'use client';

import { useState, useCallback, useRef } from 'react';
import { Settings, Flame } from 'lucide-react';
import Link from 'next/link';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';
import { UnifiedFeed } from '@/components/feed/UnifiedFeed';
import { ConfessionModal } from '@/components/confession/ConfessionModal';
import type { FeedItemType } from '@/components/feed/FeedCard';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const addSubmissionRef = useRef<((content: string, type: FeedItemType) => void) | null>(null);

  const handleConfessionSubmitted = useCallback((content: string) => {
    addSubmissionRef.current?.(content, 'confession');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CrisisBanner />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4">
        <div className="w-10" />
        <div />
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-2xl mx-auto px-5 pb-20">
        <section className="text-center pt-8 pb-10">
          <h1 className="text-5xl md:text-7xl font-bold text-accent animate-glow-pulse flex items-center justify-center gap-3">
            <Flame className="h-10 w-10 md:h-14 md:w-14" />
            RYVYNN
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
            From Our Darkest Hours to Our Brightest Days
          </p>
        </section>

        {/* CTA */}
        <section className="mb-8 text-center">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2.5 bg-accent hover:bg-flame-600 text-accent-foreground font-bold py-3.5 px-8 rounded-xl text-base transition-all"
            style={{
              boxShadow:
                '0 0 30px rgba(249,115,22,0.25), 0 0 60px rgba(249,115,22,0.1)',
            }}
          >
            <Flame className="h-5 w-5" />
            Share Your Confession
          </button>
        </section>

        {/* Unified Miracle + Confession Feed */}
        <section aria-label="Miracle and confession feed">
          <UnifiedFeed addSubmissionRef={addSubmissionRef} />
        </section>
      </main>

      {/* Confession Modal */}
      <ConfessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleConfessionSubmitted}
      />
    </div>
  );
}
