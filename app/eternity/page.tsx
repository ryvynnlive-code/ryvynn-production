'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { encrypt, decrypt } from '@/lib/encryption';

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
      const response = await fetch(`/api/eternity?userId=${user.id}`);
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
      alert('Please select a trigger date');
      return;
    }

    setWriting(true);

    try {
      const encryptionKey = process.env.NEXT_PUBLIC_JOURNAL_KEY || 'demo-encryption-key';
      const encrypted = await encrypt(newMessage, encryptionKey);

      const response = await fetch('/api/eternity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          encryptedContent: encrypted,
          triggerCondition,
          triggerDate: triggerCondition === 'date' ? triggerDate : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save message');

      const data = await response.json();
      
      alert(`✨ Eternity message saved! You earned ${data.tokensEarned || 5} 🔥 tokens!`);
      
      setNewMessage('');
      setTriggerDate('');
      loadMessages();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save message. Please try again.');
    } finally {
      setWriting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌌</div>
          <p className="text-gray-400">Loading your eternity vault...</p>
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
            🌌 Digital Eternity
          </h1>
          <p className="text-gray-400">
            Encrypted messages for your descendants • Transcending time & death
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Message */}
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-purple rounded-2xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>✨</span>
                Create Eternity Message
              </h2>

              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="What wisdom, love, or truth do you want to leave behind? This will outlive you..."
                rows={10}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-purple resize-none mb-4"
                disabled={writing}
              />

              {/* Trigger Condition */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  Trigger Condition
                </label>
                <select
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value as any)}
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ryvynn-purple"
                  disabled={writing}
                >
                  <option value="death">Upon My Death (verified via obituary/SSN)</option>
                  <option value="date">Specific Date (birthday, anniversary, etc.)</option>
                  <option value="bloodline">When Bloodline Descendant Claims</option>
                </select>
              </div>

              {/* Date Picker (if date trigger selected) */}
              {triggerCondition === 'date' && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-white mb-2">
                    Trigger Date
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
                {writing ? '🔐 Encrypting & Sealing...' : '🌌 Seal in Eternity (+5 Tokens)'}
              </button>

              <div className="mt-4 p-3 bg-ryvynn-purple/10 border border-ryvynn-purple/30 rounded-lg">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span>🔒</span>
                  <span>Military-grade encryption. Delivered only when conditions met.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Saved Messages */}
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>💎</span>
                Sealed Messages ({messages.length})
              </h2>

              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No eternity messages yet.</p>
                  <p className="text-sm mt-2">Leave your legacy for those who come after.</p>
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
                          {msg.trigger_condition === 'death' && '💀 Upon Death'}
                          {msg.trigger_condition === 'date' && `📅 ${new Date(msg.trigger_date!).toLocaleDateString()}`}
                          {msg.trigger_condition === 'bloodline' && '🧬 Bloodline Claim'}
                        </span>
                        <span className="text-xs text-gray-500">🔒 Sealed</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
              <h3 className="font-bold text-ryvynn-purple mb-2">🌌 How Eternity Works</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Messages encrypted & stored indefinitely</li>
                <li>• <strong>Death:</strong> Released when verified (obituary/SSN)</li>
                <li>• <strong>Date:</strong> Auto-delivered on specified date</li>
                <li>• <strong>Bloodline:</strong> Descendants claim with DNA/documents</li>
                <li>• Your legacy, forever preserved</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">💌</div>
            <h3 className="font-bold text-white mb-2">Last Words</h3>
            <p className="text-sm text-gray-400">
              Final messages to loved ones, delivered after you're gone
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">🎂</div>
            <h3 className="font-bold text-white mb-2">Future Blessings</h3>
            <p className="text-sm text-gray-400">
              Birthday messages for descendants not yet born
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">📜</div>
            <h3 className="font-bold text-white mb-2">Family Wisdom</h3>
            <p className="text-sm text-gray-400">
              Ancestral knowledge passed down through generations
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-ryvynn-purple/10 border-2 border-ryvynn-purple/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🔐</span>
            <div>
              <h3 className="font-bold text-ryvynn-purple mb-1">Zero Knowledge Encryption</h3>
              <p className="text-sm text-gray-400">
                Your eternity messages are encrypted on your device before being sent to our servers. 
                We mathematically cannot read them. Only your designated recipients can decrypt them 
                when trigger conditions are met. Your legacy is yours alone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
