'use client';

import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';
import type { Persona } from '@/contexts/PersonaContext';

export function PersonaSelector() {
  const { tp } = useI18n();
  const { persona, setPersona, ratedMode, setRatedMode, is18Plus } = usePersona();

  const personas: { id: Persona; icon: string }[] = [
    { id: 'feminine', icon: '🌺' },
    { id: 'masculine', icon: '⚔️' },
    { id: 'neutral', icon: '⚖️' },
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold text-ryvynn-cyan mb-3">
        {tp('choosePersona')}
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`p-3 rounded-lg border transition-all ${
              persona === p.id
                ? 'border-ryvynn-cyan bg-ryvynn-cyan/10 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{p.icon}</div>
            <div className="text-xs font-medium">{tp(p.id)}</div>
          </button>
        ))}
      </div>

      {is18Plus && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={ratedMode}
            onChange={(e) => setRatedMode(e.target.checked)}
            className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
          />
          <div>
            <div className="text-sm text-white font-medium group-hover:text-ryvynn-cyan">
              {tp('enableRated')}
            </div>
            <div className="text-xs text-gray-500">
              {tp('ratedWarning')}
            </div>
          </div>
        </label>
      )}
    </div>
  );
}
