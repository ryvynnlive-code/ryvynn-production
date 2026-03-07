'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export default function JournalPage() {
  const { tf } = useI18n();
  const [entries] = useState([
    { id: '1', date: '2026-03-07', content: 'First entry in my dark journal...', encrypted: true },
    { id: '2', date: '2026-03-06', content: 'Facing my shadows today...', encrypted: true },
  ]);

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-ryvynn-cyan mb-2">
              {tf('journalTitle')}
            </h1>
            <p className="text-gray-400">{tf('yourEyesOnly')}</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg font-bold text-white hover:opacity-90">
            + {tf('newEntry')}
          </button>
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">{entry.date}</div>
                {entry.encrypted && (
                  <span className="text-xs text-ryvynn-purple flex items-center gap-1">
                    🔐 {tf('encrypted')}
                  </span>
                )}
              </div>
              <p className="text-white">{entry.content}</p>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📓</div>
            <p>No entries yet. Start your shadow work.</p>
          </div>
        )}
      </div>
    </main>
  );
}
