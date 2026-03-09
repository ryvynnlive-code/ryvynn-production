'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { encrypt, decrypt } from '@/lib/encryption';

interface JournalEntry {
  id: string;
  encrypted_content: string;
  created_at: string;
  updated_at: string;
}

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const { tf } = useI18n();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [decryptedContent, setDecryptedContent] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/journal?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to load entries');
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newEntry.trim() || !user || writing) return;
    setWriting(true);
    try {
      const encryptionKey = process.env.NEXT_PUBLIC_JOURNAL_KEY || 'demo-encryption-key';
      const encrypted = await encrypt(newEntry, encryptionKey);
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, encryptedContent: encrypted }),
      });
      if (!response.ok) throw new Error('Failed to save entry');
      const data = await response.json();
      alert(`✨ Entry saved! You earned ${data.tokensEarned || 1} 🔥 tokens!`);
      setNewEntry('');
      loadEntries();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setWriting(false);
    }
  };

  const handleViewEntry = async (entry: JournalEntry) => {
    try {
      const encryptionKey = process.env.NEXT_PUBLIC_JOURNAL_KEY || 'demo-encryption-key';
      const decrypted = await decrypt(entry.encrypted_content, encryptionKey);
      setDecryptedContent(decrypted);
      setSelectedEntry(entry);
    } catch (error) {
      console.error('Decryption error:', error);
      alert('Failed to decrypt entry. Check your encryption key.');
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📔</div>
          <p className="text-gray-400">{tf('journalLoading')}</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-2">
            📔 {tf('journalTitle')}
          </h1>
          <p className="text-gray-400">{tf('journalSubtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Write New Entry */}
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-2xl p-6 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>✍️</span>
                {tf('journalWriteTitle')}
              </h2>

              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder={tf('journalContentPlaceholder')}
                rows={12}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-cyan resize-none mb-4"
                disabled={writing}
              />

              <button
                onClick={handleSave}
                disabled={writing || !newEntry.trim()}
                className="w-full py-4 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)]"
              >
                {writing ? tf('journalEncrypting') : tf('journalSaveWithToken')}
              </button>

              <div className="mt-4 p-3 bg-ryvynn-cyan/10 border border-ryvynn-cyan/30 rounded-lg">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span>🔒</span>
                  <span>{tf('journalClientNote')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Past Entries */}
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>📚</span>
                {tf('journalPastEntries')} ({entries.length})
              </h2>

              {entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>{tf('journalNoEntries')}</p>
                  <p className="text-sm mt-2">{tf('journalNoEntriesSub')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleViewEntry(entry)}
                      className="w-full text-left p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-ryvynn-cyan transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">{tf('journalEncryptedBadge')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entry Viewer Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-2xl max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {new Date(selectedEntry.created_at).toLocaleDateString()}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedEntry.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedEntry(null); setDecryptedContent(''); }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="bg-black border border-gray-800 rounded-xl p-6 mb-6 max-h-[400px] overflow-y-auto">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {decryptedContent}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(decryptedContent);
                    alert(tf('journalCopied'));
                  }}
                  className="flex-1 py-3 border-2 border-ryvynn-cyan rounded-xl text-ryvynn-cyan font-bold hover:bg-ryvynn-cyan/10 transition-all"
                >
                  {tf('journalCopy')}
                </button>
                <button
                  onClick={() => { setSelectedEntry(null); setDecryptedContent(''); }}
                  className="flex-1 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white font-bold hover:scale-105 transition-all"
                >
                  {tf('journalClose')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
          <h3 className="font-bold text-ryvynn-cyan mb-2">{tf('journalEncryptionTitle')}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• {tf('journalPrivacyBullet1')}</li>
            <li>• {tf('journalPrivacyBullet2')}</li>
            <li>• {tf('journalPrivacyBullet3')}</li>
            <li>• {tf('journalPrivacyBullet4')}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
