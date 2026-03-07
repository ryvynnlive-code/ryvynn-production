'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

type WallView = 'confessions' | 'transformations';

interface FeedItem {
  id: string;
  type: 'confession' | 'transformation';
  content: string;
  timestamp: string;
}

export function FiftyFiftyWall() {
  const { tp } = useI18n();
  const [view, setView] = useState<WallView>('confessions');

  // Mock data - in production this would come from API
  const mockConfessions: FeedItem[] = [
    { id: '1', type: 'confession', content: 'I relapsed after 6 months clean. The shame is crushing me.', timestamp: '2 hours ago' },
    { id: '2', type: 'confession', content: 'Everyone thinks I have it together but I\'m drowning inside.', timestamp: '5 hours ago' },
    { id: '3', type: 'confession', content: 'I push away everyone who tries to help because I don\'t think I deserve it.', timestamp: '1 day ago' },
  ];

  const mockTransformations: FeedItem[] = [
    { id: '1', type: 'transformation', content: 'Six months wasn\'t erased. It\'s proof you CAN do this. Fall seven times, stand up eight.', timestamp: '2 hours ago' },
    { id: '2', type: 'transformation', content: 'The mask you wear proves you\'re strong enough to survive. Now learn to take it off, slowly.', timestamp: '5 hours ago' },
    { id: '3', type: 'transformation', content: 'Believing you don\'t deserve help is the wound talking, not the truth. Healing starts when you challenge that lie.', timestamp: '1 day ago' },
  ];

  const displayItems = view === 'confessions' ? mockConfessions : mockTransformations;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-ryvynn-cyan mb-2">
          {tp('wallTitle')}
        </h2>
        <p className="text-gray-400">
          {tp('wallSubtitle')}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {tp('wallDescription')}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => setView('confessions')}
          className={`pb-3 px-4 font-medium transition-colors ${
            view === 'confessions'
              ? 'text-ryvynn-cyan border-b-2 border-ryvynn-cyan'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🌑 {tp('confessionsTab')}
        </button>
        <button
          onClick={() => setView('transformations')}
          className={`pb-3 px-4 font-medium transition-colors ${
            view === 'transformations'
              ? 'text-ryvynn-purple border-b-2 border-ryvynn-purple'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          ✨ {tp('transformationsTab')}
        </button>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-lg border ${
              item.type === 'confession'
                ? 'bg-gray-900/50 border-gray-800'
                : 'bg-ryvynn-purple/5 border-ryvynn-purple/20'
            }`}
          >
            <p className="text-white mb-3 leading-relaxed">
              {item.content}
            </p>
            <div className="text-xs text-gray-500">
              {item.timestamp} • Anonymous
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No {view} yet. Be the first to share.
        </div>
      )}
    </div>
  );
}
