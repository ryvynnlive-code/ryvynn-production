'use client';

import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';

export function AgeGate() {
  const { tp } = useI18n();
  const { is18Plus, setIs18Plus } = usePersona();

  if (is18Plus) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-ryvynn-cyan rounded-lg max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        
        <h1 className="text-3xl font-bold text-ryvynn-cyan mb-4">
          {tp('ageGateTitle')}
        </h1>
        
        <p className="text-gray-300 mb-8">
          {tp('ageGateSubtitle')}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setIs18Plus(true)}
            className="w-full px-6 py-4 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg text-white font-bold hover:opacity-90"
          >
            {tp('ageConfirm')}
          </button>
          
          <button
            onClick={() => window.location.href = 'https://www.google.com'}
            className="w-full px-6 py-4 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800"
          >
            {tp('ageDecline')}
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          By continuing, you acknowledge RYVYNN contains raw discussions of trauma, addiction, crisis, and darkness. Not therapy. Not medical advice.
        </div>
      </div>
    </div>
  );
}
