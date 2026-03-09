'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export default function GuardianPage() {
  const { tf } = useI18n();
  const { persona } = usePersona();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isCrisis, setIsCrisis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }
    
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/guardian/chat?userId=${user.id}&limit=50`);
        if (!response.ok) throw new Error('Failed to load history');
        
        const data = await response.json();
        setMessages(data.conversations || []);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Allow anonymous Guardian chat (free crisis tier)
    const userId = user?.id || 'anonymous';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/guardian/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: input.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsCrisis(data.isCrisis || false);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: tf('guardianError'),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setIsCrisis(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || loadingHistory) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🛡️</div>
          <p className="text-gray-400">{tf('guardianLoading')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-2">
            🛡️ {tf('guardianTitle')}
          </h1>
          <p className="text-gray-400">
            {tf('guardianSubtitle')} • Persona: {persona}
          </p>
        </div>

        {isCrisis && (
          <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-red-400 mb-1">{tf('guardianCrisisTitle')}</h3>
                <p className="text-sm text-gray-300">
                  {tf('guardianCrisisDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🛡️</div>
                <p className="text-lg">{tf('guardianReady')}</p>
                <p className="text-sm mt-2">{tf('guardianEmpty')}</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-ryvynn-cyan/20 border border-ryvynn-cyan/30 text-white'
                      : 'bg-ryvynn-purple/20 border border-ryvynn-purple/30 text-white'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="text-xs text-ryvynn-purple font-bold mb-2">🛡️ Guardian</div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-ryvynn-purple/20 border border-ryvynn-purple/30">
                  <div className="text-xs text-ryvynn-purple font-bold mb-2">🛡️ Guardian</div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-ryvynn-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-ryvynn-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-ryvynn-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-gray-800 p-4 bg-black/50">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={tf('guardianPlaceholder')}
                rows={2}
                className="flex-1 bg-gray-900 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-purple resize-none"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-8 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {loading ? '⚡' : '🛡️'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
              <span>{tf('guardianKeyboardHint')}</span>
              <span className="text-ryvynn-purple font-bold">{tf('guardianFreeLabel')}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
          <h3 className="font-bold text-ryvynn-cyan mb-2">🛡️ {tf('guardianInfoTitle')}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• {tf('guardianInfo1')}</li>
            <li>• {tf('guardianInfo2')}</li>
            <li>• {tf('guardianInfo3')}</li>
            <li>• {tf('guardianInfo4')}</li>
            <li>• {tf('guardianInfo5')}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
