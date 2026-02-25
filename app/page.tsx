'use client';

import { useState } from 'react';
import { Settings, Flame } from 'lucide-react';
import Link from 'next/link';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';
import { MiracleFeed } from '@/components/miracle/MiracleFeed';
import { ConfessionModal } from '@/components/confession/ConfessionModal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

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
        <section className="text-center pt-8 pb-12">
          <h1
            className="text-5xl md:text-7xl font-bold text-accent animate-glow-pulse flex items-center justify-center gap-3"
          >
            <Flame className="h-10 w-10 md:h-14 md:w-14" />
            RYVYNN
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
            From Our Darkest Hours to Our Brightest Days
          </p>
        </section>

        {/* Miracle Feed */}
        <section aria-label="Miracle feed">
          <MiracleFeed />
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2.5 bg-accent hover:bg-flame-600 text-accent-foreground font-bold py-4 px-10 rounded-xl text-lg transition-all"
            style={{
              boxShadow: '0 0 30px rgba(249,115,22,0.25), 0 0 60px rgba(249,115,22,0.1)',
            }}
          >
            <Flame className="h-5 w-5" />
            Share Your Confession
          </button>
        </section>
      </main>

      {/* Confession Modal */}
      <ConfessionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
