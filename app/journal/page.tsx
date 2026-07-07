'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { useEncryption } from '@/contexts/EncryptionContext';
import { authedFetch } from '@/lib/authedFetch';

interface JournalEntry {
  id: string;
  encrypted_content: string;
  created_at: string;
  updated_at: string;
}

function JournalLock({ enc }: { enc: ReturnType<typeof useEncryption> }) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const creating = !enc.hasPassphrase;

  const submit = async () => {
    if (busy) return;
    if (creating && pass !== confirm) return;
    setBusy(true);
    try {
      if (creating) await enc.createPassphrase(pass);
      else await enc.unlock(pass);
    } catch {
      /* error surfaced via enc.unlockError */
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-2xl p-8 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {creating ? 'Create your passphrase' : 'Unlock your journal'}
          </h1>
          <p className="text-sm text-gray-400">
            {creating
              ? 'Your entries are encrypted with this passphrase before they ever leave your device. We never see it and cannot reset it.'
              : 'Enter the passphrase you created. It stays on your device only.'}
          </p>
        </div>

        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !creating) submit(); }}
          placeholder="Passphrase"
          className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-cyan mb-3"
          autoFocus
        />

        {creating && (
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            placeholder="Confirm passphrase"
            className="w-full bg-black border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-cyan mb-3"
          />
        )}

        {creating && confirm.length > 0 && pass !== confirm && (
          <p className="text-xs text-red-400 mb-3">Passphrases don&apos;t match.</p>
        )}
        {enc.unlockError && <p className="text-xs text-red-400 mb-3">{enc.unlockError}</p>}

        <button
          onClick={submit}
          disabled={busy || pass.length === 0 || (creating && pass !== confirm)}
          className="w-full py-4 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)]"
        >
          {busy ? 'Working…' : creating ? 'Create & unlock' : 'Unlock'}
        </button>

        {creating && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/40 rounded-lg">
            <p className="text-xs text-yellow-300">
              ⚠️ There is no recovery. If you forget this passphrase, your encrypted entries cannot be read by anyone — including us. That is the point of real privacy.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const { tf } = useI18n();
  const router = useRouter();
  const enc = useEncryption();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [decryptedContent, setDecryptedContent] = useState('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening'>('idle');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isSpeakingEntry, setIsSpeakingEntry] = useState(false);
  const transcriptRef = useRef('');
  const currentEntryRef = useRef('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
      'speechSynthesis' in window
    );
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    try {
      const res = await authedFetch('/api/journal');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const startVoiceDictation = useCallback(() => {
    if (!voiceSupported || typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    currentEntryRef.current = newEntry;
    const rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => setVoiceState('listening');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      transcriptRef.current = full;
      const base = currentEntryRef.current.trimEnd();
      setNewEntry(base ? base + ' ' + full : full);
    };
    rec.onend = () => setVoiceState('idle');
    rec.onerror = () => setVoiceState('idle');
    recognitionRef.current = rec;
    rec.start();
  }, [voiceSupported, newEntry]);

  const stopDictation = () => {
    recognitionRef.current?.stop();
    setVoiceState('idle');
  };

  const readEntryAloud = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeakingEntry) { window.speechSynthesis.cancel(); setIsSpeakingEntry(false); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88; utt.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setIsSpeakingEntry(true);
    utt.onend = () => setIsSpeakingEntry(false);
    utt.onerror = () => setIsSpeakingEntry(false);
    window.speechSynthesis.speak(utt);
  }, [isSpeakingEntry]);

  const handleSave = async () => {
    if (!newEntry.trim() || !user || writing) return;
    setWriting(true);
    try {
      const encrypted = await enc.encryptText(newEntry);
      const res = await authedFetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedContent: encrypted }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setNewEntry('');
      setEntries(prev => [{
        id: Date.now().toString(),
        encrypted_content: encrypted,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, ...prev]);
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).ryvynnNotify?.(`✨ Entry saved! +${data.tokensEarned || 1} 🔥 Soul Tokens earned.`);
      }
    } catch (e) { console.error(e); }
    finally { setWriting(false); }
  };

  const handleViewEntry = async (entry: JournalEntry) => {
    if (!user) return;
    try {
      const decrypted = await enc.decryptText(entry.encrypted_content);
      setDecryptedContent(decrypted);
      setSelectedEntry(entry);
    } catch {
      setDecryptedContent('Unable to decrypt entry.');
      setSelectedEntry(entry);
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

  // Wait until we know whether this account has a passphrase, then require unlock.
  if (!enc.ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔐</div>
          <p className="text-gray-400">Checking your vault…</p>
        </div>
      </main>
    );
  }

  if (!enc.isUnlocked) {
    return <JournalLock enc={enc} />;
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-2">
              📔 {tf('journalTitle')}
            </h1>
            <p className="text-gray-400">{tf('journalSubtitle')}</p>
          </div>
          {voiceSupported && (
            <span className="text-xs text-ryvynn-cyan font-bold">🎤 Voice enabled</span>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-2xl p-6 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span>✍️</span>{tf('journalWriteTitle')}
                </h2>
                {voiceSupported && (
                  <button
                    onClick={voiceState === 'listening' ? stopDictation : startVoiceDictation}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      voiceState === 'listening'
                        ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-ryvynn-cyan hover:text-ryvynn-cyan'
                    }`}
                  >
                    <span>{voiceState === 'listening' ? '⏹️' : '🎤'}</span>
                    <span className="hidden sm:inline">{voiceState === 'listening' ? 'Stop' : 'Dictate'}</span>
                  </button>
                )}
              </div>

              {voiceState === 'listening' && (
                <div className="mb-3 px-3 py-2 bg-red-900/20 border border-red-500/40 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">Listening — speak freely, tap Stop when done</span>
                </div>
              )}

              <textarea
                value={newEntry}
                onChange={e => setNewEntry(e.target.value)}
                placeholder={voiceSupported ? 'Type here or tap 🎤 to speak your entry...' : tf('journalContentPlaceholder')}
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
                  <span>🔒</span><span>{tf('journalClientNote')}</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span>📚</span>{tf('journalPastEntries')} ({entries.length})
              </h2>
              {entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>{tf('journalNoEntries')}</p>
                  <p className="text-sm mt-2">{tf('journalNoEntriesSub')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {entries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => handleViewEntry(entry)}
                      className="w-full text-left p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-ryvynn-cyan transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-gray-500">🔒 {tf('journalEncryptedBadge')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedEntry && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-2xl max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{new Date(selectedEntry.created_at).toLocaleDateString()}</h3>
                  <p className="text-xs text-gray-500">{new Date(selectedEntry.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {voiceSupported && decryptedContent && (
                    <button
                      onClick={() => readEntryAloud(decryptedContent)}
                      className={`p-2 rounded-xl border-2 transition-all ${isSpeakingEntry ? 'border-ryvynn-purple text-ryvynn-purple animate-pulse' : 'border-gray-700 text-gray-400 hover:border-ryvynn-purple hover:text-ryvynn-purple'}`}
                      title={isSpeakingEntry ? 'Stop reading' : 'Read aloud'}
                    >
                      {isSpeakingEntry ? '⏹️' : '🔊'}
                    </button>
                  )}
                  <button onClick={() => { setSelectedEntry(null); setDecryptedContent(''); if (isSpeakingEntry) window.speechSynthesis?.cancel(); }} className="text-gray-400 hover:text-white text-2xl px-2">✕</button>
                </div>
              </div>
              <div className="bg-black border border-gray-800 rounded-xl p-6 mb-6 max-h-[400px] overflow-y-auto">
                <p className="text-white whitespace-pre-wrap leading-relaxed">{decryptedContent}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigator.clipboard.writeText(decryptedContent)} className="flex-1 py-3 border-2 border-ryvynn-cyan rounded-xl text-ryvynn-cyan font-bold hover:bg-ryvynn-cyan/10 transition-all">
                  {tf('journalCopy')}
                </button>
                <button onClick={() => { setSelectedEntry(null); setDecryptedContent(''); }} className="flex-1 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white font-bold hover:scale-105 transition-all">
                  {tf('journalClose')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
          <h3 className="font-bold text-ryvynn-cyan mb-2">{tf('journalEncryptionTitle')}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• {tf('journalPrivacyBullet1')}</li>
            <li>• {tf('journalPrivacyBullet2')}</li>
            <li>• {tf('journalPrivacyBullet3')}</li>
            <li>• {tf('journalPrivacyBullet4')}</li>
            {voiceSupported && <li>• 🎤 Voice dictation — speak entries hands-free</li>}
            {voiceSupported && <li>• 🔊 Read any entry aloud — tap the speaker icon</li>}
          </ul>
        </div>
      </div>
    </main>
  );
}
