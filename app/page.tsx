'use client';

import { useState, useCallback, useRef } from 'react';
import { Settings, Flame } from 'lucide-react';
import Link from 'next/link';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';
import { UnifiedFeed } from '@/components/feed/UnifiedFeed';
import { ConfessionModal } from '@/components/confession/ConfessionModal';
import { SacredGeometry, SacredDivider } from '@/components/sacred/SacredGeometry';
import type { FeedItemType } from '@/components/feed/FeedCard';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const addSubmissionRef = useRef<((content: string, type: FeedItemType) => void) | null>(null);

  const handleConfessionSubmitted = useCallback((content: string) => {
    addSubmissionRef.current?.(content, 'confession');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden sacred-grid">
      <CrisisBanner />

      {/* Background sacred geometry -- barely visible, slowly rotating */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <SacredGeometry
          pattern="flower-of-life"
          size={800}
          opacity={0.025}
          color="rgba(249,115,22,0.8)"
          strokeWidth={0.5}
        />
      </div>
      <div className="fixed top-[-10%] right-[-10%] pointer-events-none z-0">
        <SacredGeometry
          pattern="metatrons-cube"
          size={500}
          opacity={0.018}
          color="rgba(249,115,22,0.6)"
          strokeWidth={0.4}
        />
      </div>
      <div className="fixed bottom-[-15%] left-[-8%] pointer-events-none z-0">
        <SacredGeometry
          pattern="sri-yantra"
          size={450}
          opacity={0.02}
          color="rgba(249,115,22,0.7)"
          strokeWidth={0.5}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
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
      <main className="relative z-10 max-w-2xl mx-auto px-5 pb-20">
        <section className="text-center pt-8 pb-10 relative">
          {/* Sacred geometry behind logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <SacredGeometry
              pattern="seed-of-life"
              size={240}
              opacity={0.05}
              color="rgba(249,115,22,1)"
              strokeWidth={0.6}
            />
          </div>

          <h1 className="relative text-5xl md:text-7xl font-bold text-accent animate-glow-pulse flex items-center justify-center gap-3">
            <Flame className="h-10 w-10 md:h-14 md:w-14" />
            RYVYNN
          </h1>
          <p className="relative mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
            From Our Darkest Hours to Our Brightest Days
          </p>
        </section>

        <SacredDivider className="mb-6" />

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

        <SacredDivider className="mb-8" />

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
