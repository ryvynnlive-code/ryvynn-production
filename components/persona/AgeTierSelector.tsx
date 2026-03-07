'use client';

import { useI18n } from '@/contexts/I18nContext';
import { useAgeTier } from '@/contexts/AgeTierContext';
import type { AgeTier } from '@/contexts/AgeTierContext';

export function AgeTierSelector() {
  const { ageTier, setAgeTier, getAgeRange } = useAgeTier();

  const tiers: { id: AgeTier; icon: string; label: string }[] = [
    { id: 'youth', icon: '🌱', label: 'Youth' },
    { id: 'youngadult', icon: '🚀', label: 'Young Adult' },
    { id: 'adult', icon: '⚡', label: 'Adult' },
    { id: 'mature', icon: '🏔️', label: 'Mature' },
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold text-ryvynn-purple mb-3">
        Age Tier ({getAgeRange()})
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setAgeTier(tier.id)}
            className={`p-3 rounded-lg border transition-all ${
              ageTier === tier.id
                ? 'border-ryvynn-purple bg-ryvynn-purple/10 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{tier.icon}</div>
            <div className="text-xs font-medium">{tier.label}</div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        AI tone adapts to your age group for better resonance
      </p>
    </div>
  );
}
