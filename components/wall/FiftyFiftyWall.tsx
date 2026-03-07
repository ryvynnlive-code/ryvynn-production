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

  // Real, humanized feed content - represents actual crisis/recovery experiences
  const mockConfessions: FeedItem[] = [
    { 
      id: '1', 
      type: 'confession', 
      content: 'I\'ve been clean from heroin for 8 months. Last night I held the bag in my hand for 20 minutes. I threw it away but I\'m terrified of how close I came.', 
      timestamp: '12 min ago' 
    },
    { 
      id: '2', 
      type: 'confession', 
      content: 'My daughter asked why mommy cries in the bathroom. I told her allergies. The truth is I don\'t know how to tell a 6-year-old that I want to disappear.', 
      timestamp: '43 min ago' 
    },
    { 
      id: '3', 
      type: 'confession', 
      content: 'Everyone at work thinks I\'m the funny guy. Nobody knows I rehearse conversations in my head for hours because I\'m terrified they\'ll see I\'m faking everything.', 
      timestamp: '1 hour ago' 
    },
    { 
      id: '4', 
      type: 'confession', 
      content: 'I relapsed after 6 months. Called my sponsor at 2am crying. He said "the counter resets but the strength doesn\'t disappear." I want to believe him.', 
      timestamp: '3 hours ago' 
    },
    { 
      id: '5', 
      type: 'confession', 
      content: 'My therapist asked if I have a plan. I lied and said no. I have the pills. I have the note. I just haven\'t picked the day yet.', 
      timestamp: '5 hours ago' 
    },
    { 
      id: '6', 
      type: 'confession', 
      content: 'I spent my rent money on drugs and told my roommate I got mugged. The shame is worse than being homeless would be.', 
      timestamp: '9 hours ago' 
    },
  ];

  const mockTransformations: FeedItem[] = [
    { 
      id: '1', 
      type: 'transformation', 
      content: 'You held the poison and chose to let it go. That\'s not weakness — that\'s 8 months of strength proving itself when it mattered most. The bag is gone. You\'re still here. That\'s victory.', 
      timestamp: '12 min ago' 
    },
    { 
      id: '2', 
      type: 'transformation', 
      content: 'Your daughter won\'t remember the tears. She\'ll remember the mom who showed up even when it hurt. Asking for help isn\'t giving up — it\'s the bravest thing you can teach her.', 
      timestamp: '43 min ago' 
    },
    { 
      id: '3', 
      type: 'transformation', 
      content: 'The funny guy mask is exhausting because you\'re carrying two people. But the fact that you can perform means you understand connection — you just haven\'t aimed it inward yet. They\'d rather know the real you than the rehearsed version.', 
      timestamp: '1 hour ago' 
    },
    { 
      id: '4', 
      type: 'transformation', 
      content: 'Your sponsor is right. You didn\'t lose 6 months — you proved you CAN do 6 months. And you had the courage to call instead of hiding in shame. That\'s growth the relapse can\'t erase.', 
      timestamp: '3 hours ago' 
    },
    { 
      id: '5', 
      type: 'transformation', 
      content: 'Having a plan doesn\'t make you weak. It means the pain is real and you\'re trying to solve it. But you\'re here, sharing in the dark, which means part of you is still fighting for another option. Call 988. Not tomorrow. Now. Let them carry this weight with you.', 
      timestamp: '5 hours ago' 
    },
    { 
      id: '6', 
      type: 'transformation', 
      content: 'Addiction doesn\'t care about rent or truth. But you shared this here, which means you know the lie is eating you alive. Your roommate would rather help than lose you to the street or the substance. The shame shrinks when you speak it.', 
      timestamp: '9 hours ago' 
    },
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
