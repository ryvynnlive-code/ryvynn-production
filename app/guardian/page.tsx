'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';

export default function GuardianPage() {
  const { tf } = useI18n();
  const { persona } = usePersona();
  const [messages] = useState([
    { role: 'guardian', content: "I'm here. What's weighing on you?" },
    { role: 'user', content: "I'm struggling today..." },
    { role: 'guardian', content: "That struggle is real. Tell me more about it." },
  ]);
  const [input, setInput] = useState('');

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ryvynn-purple mb-2">
            {tf('guardianTitle')}
          </h1>
          <p className="text-gray-400">{tf('guardianSubtitle')} • Persona: {persona}</p>
        </div>

        {/* Chat Container */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-ryvynn-cyan/20 text-white'
                      : 'bg-ryvynn-purple/20 text-white'
                  }`}
                >
                  {msg.role === 'guardian' && <div className="text-xs text-ryvynn-purple mb-1">🛡️ Guardian</div>}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to your guardian..."
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-purple"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg font-bold text-white hover:opacity-90">
                Send
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              💰 Costs 2 Soul Tokens per message
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
