'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';

interface ConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfessionModal({ isOpen, onClose }: ConfessionModalProps) {
  const { tp } = useI18n();
  const { persona, ratedMode } = usePersona();
  const [confession, setConfession] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confession.trim()) return;

    setSubmitting(true);
    
    try {
      // TODO: API call to submit confession
      // await fetch('/api/confession', { method: 'POST', body: JSON.stringify({ confession, persona, ratedMode }) })
      
      // For now, just close
      setTimeout(() => {
        setConfession('');
        setSubmitting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Confession submission failed:', error);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-ryvynn-cyan">
            {tp('submitConfession')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={confession}
            onChange={(e) => setConfession(e.target.value)}
            placeholder="Face your darkness. Write what haunts you. (Anonymous, never stored raw)"
            className="w-full h-48 bg-black border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-cyan resize-none"
            disabled={submitting}
          />

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Persona: {persona} {ratedMode && '| R-Rated Mode'}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!confession.trim() || submitting}
                className="px-6 py-2 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Anonymous'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 border-t border-gray-800 pt-4">
          🔐 Your raw confession is NEVER stored. AI transforms it immediately, then discards the original. Zero surveillance.
        </div>
      </div>
    </div>
  );
}
