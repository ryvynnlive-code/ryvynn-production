'use client';

import { useState } from 'react';
import { FiftyFiftyWall } from '@/components/wall/FiftyFiftyWall';
import { ConfessionModal } from '@/components/confession/ConfessionModal';
import { PersonaSelector } from '@/components/persona/PersonaSelector';
import { useI18n } from '@/contexts/I18nContext';

export default function WallPage() {
  const { tp } = useI18n();
  const [confessionModalOpen, setConfessionModalOpen] = useState(false);

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Sidebar with Persona Selector */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          <aside className="space-y-6">
            <PersonaSelector />
            
            <button
              onClick={() => setConfessionModalOpen(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg text-white font-bold hover:opacity-90"
            >
              🌑 {tp('submitConfession')}
            </button>
          </aside>

          {/* Main Wall */}
          <div>
            <FiftyFiftyWall />
          </div>
        </div>
      </div>

      <ConfessionModal
        isOpen={confessionModalOpen}
        onClose={() => setConfessionModalOpen(false)}
      />
    </main>
  );
}
