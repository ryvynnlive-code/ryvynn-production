'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export default function EternityPage() {
  const { tf } = useI18n();
  const [messages] = useState([
    { id: '1', recipient: 'Future bloodline', unlockDate: '2075-01-01', preview: 'Encrypted message for my descendants...' },
  ]);

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-ryvynn-purple mb-2">
              {tf('eternityTitle')}
            </h1>
            <p className="text-gray-400">{tf('eternitySubtitle')}</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg font-bold text-white hover:opacity-90">
            + {tf('createEternityMessage')}
          </button>
        </div>

        {/* Warning */}
        <div className="bg-ryvynn-purple/10 border border-ryvynn-purple/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-bold text-ryvynn-purple mb-1">How It Works</h3>
              <p className="text-sm text-gray-400">
                {tf('eternityWarning')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                💰 Costs 10 Soul Tokens to create an eternity message
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-white mb-1">{tf('recipientBloodline')}</div>
                  <div className="text-sm text-gray-400">{tf('unlockDate')}: {msg.unlockDate}</div>
                </div>
                <span className="text-xs text-ryvynn-purple flex items-center gap-1">
                  🔐 {tf('encrypted')}
                </span>
              </div>
              <div className="text-gray-500 italic">
                [Message encrypted - only viewable by recipient after unlock date]
              </div>
            </div>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">⏳</div>
            <p>No eternity messages yet. Create one to outlive your body.</p>
          </div>
        )}
      </div>
    </main>
  );
}
