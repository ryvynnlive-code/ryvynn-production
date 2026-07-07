'use client';

import { useState, useEffect } from 'react';
import { authedFetch } from '@/lib/authedFetch';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { encrypt } from '@/lib/encryption';
import { useI18n } from '@/contexts/I18nContext';

interface EternityMessage {
  id: string;
  encrypted_content: string;
  trigger_condition: 'death' | 'date' | 'bloodline';
  trigger_date?: string;
  created_at: string;
}

export default function EternityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tf } = useI18n();
  const [messages, setMessages] = useState<EternityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<'death' | 'date' | 'bloodline'>('death');
  const [triggerDate, setTriggerDate] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadMessages();
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const response = await authedFetch(`/api/eternity?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newMessage.trim() || !user || writing) return;
    if (triggerCondition === 'date' && !triggerDate) {
      alert(tf('eternityTriggerDateLabel'));
      return;
    }

    setWriting(true);

    try {
      const encryptionKey = `ryvynn-eternity-${user.id}`;
      const encrypted = await encrypt(newMessage, encryptionKey);

      const response = await authedFetch('/api/eternity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          encryptedMessage: encrypted,
          triggerCondition,
          recipientInfo: triggerCondition === 'date' ? triggerDate : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save message');

      const data = await response.json();
      alert(`✨ ${tf('eternitySealedMessages')}! +${data.tokensEarned || 5} 🔥`);

      setNewMessage('');
      setTriggerDate('');
      loadMessages();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setWriting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌌</div>
          <p className="text-gray-400">{tf('eternityLoading')}</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ryvynn-purple to-ryvynn-cyan bg-clip-text text-transparent mb-2">
            🌌 {tf('eternityTitle')}
          </h1>
          <p className="text-gray-400">{tf('eternitySubtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Message */}
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-purple rounded-2xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>✨</span>
                {tf('eternityNewMessage')}
              </h2>

              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={tf('eternityContentPlaceholder')}
                rows={10}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-purple resize-none mb-4"
                disabled={writing}
              />

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  {tf('eternityTriggerCondition')}
                </label>
                <select
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value as 'death' | 'date' | 'bloodline')}
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ryvynn-purple"
                  disabled={writing}
                >
                  <option value="death">{tf('eternityTriggerDeath')}</option>
                  <option value="date">{tf('eternityTriggerDate')}</option>
                  <option value="bloodline">{tf('eternityTriggerBloodline')}</option>
                </select>
              </div>

              {triggerCondition === 'date' && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-white mb-2">
                    {tf('eternityTriggerDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={triggerDate}
                    onChange={(e) => setTriggerDate(e.target.value)}
                    className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ryvynn-purple"
                    disabled={writing}
                  />
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={writing || !newMessage.trim()}
                className="w-full py-4 bg-gradient-to-r from-ryvynn-purple to-ryvynn-cyan rounded-xl font-bold text-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {writing ? tf('eternityEncrypting') : tf('eternitySealButton')}
              </button>

              <div className="mt-4 p-3 bg-ryvynn-purple/10 border border-ryvynn-purple/30 rounded-lg">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span>🔒</span>
                  <span>{tf('eternityPrivacyNote')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Saved Messages */}
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>💎</span>
                {tf('eternitySealedMessages')} ({messages.length})
              </h2>

              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>{tf('eternityNoMessages')}</p>
                  <p className="text-sm mt-2">{tf('eternityNoMessagesSub')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-ryvynn-purple">
                          {msg.trigger_condition === 'death' && tf('eternityTriggerDeathLabel')}
                          {msg.trigger_condition === 'date' && `📅 ${new Date(msg.trigger_date!).toLocaleDateString()}`}
                          {msg.trigger_condition === 'bloodline' && tf('eternityTriggerBloodlineLabel')}
                        </span>
                        <span className="text-xs text-gray-500">{tf('eternitySealed')}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {tf('eternityCreated')}: {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
              <h3 className="font-bold text-ryvynn-purple mb-2">{tf('eternityHowTitle')}</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• {tf('eternityHow1')}</li>
                <li>• <strong>{tf('eternityHow2')}</strong></li>
                <li>• <strong>{tf('eternityHow3')}</strong></li>
                <li>• <strong>{tf('eternityHow4')}</strong></li>
                <li>• {tf('eternityHow5')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">💌</div>
            <h3 className="font-bold text-white mb-2">{tf('eternityCard1Title')}</h3>
            <p className="text-sm text-gray-400">{tf('eternityCard1Desc')}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">🎂</div>
            <h3 className="font-bold text-white mb-2">{tf('eternityCard2Title')}</h3>
            <p className="text-sm text-gray-400">{tf('eternityCard2Desc')}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">📜</div>
            <h3 className="font-bold text-white mb-2">{tf('eternityCard3Title')}</h3>
            <p className="text-sm text-gray-400">{tf('eternityCard3Desc')}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-ryvynn-purple/10 border-2 border-ryvynn-purple/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🔐</span>
            <div>
              <h3 className="font-bold text-ryvynn-purple mb-1">{tf('eternityZeroTitle')}</h3>
              <p className="text-sm text-gray-400">{tf('eternityZeroDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
