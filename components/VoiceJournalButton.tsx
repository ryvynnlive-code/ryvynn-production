'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}
interface ISpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void; abort(): void;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: ISpeechRecognitionResultEvent) => void) | null;
}
interface ISpeechRecognitionErrorEvent extends Event { error: string; }
interface ISpeechRecognitionResultEvent extends Event {
  results: { length: number; [i: number]: { isFinal: boolean; [i: number]: { transcript: string } } };
}

type State = 'idle' | 'listening' | 'saving' | 'done' | 'error';

export function VoiceJournalButton() {
  const { user } = useAuth();
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [supported, setSupported] = useState(false);
  const transcriptRef = useRef('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));
  }, []);

  // Show after 10pm, hide before 6am - late night mode
  const [isLateNight, setIsLateNight] = useState(true);
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setIsLateNight(h >= 22 || h < 6);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const saveEntry = useCallback(async (text: string) => {
    if (!text.trim()) { setState('idle'); return; }
    setState('saving');
    const userId = user?.id || 'anonymous';
    try {
      // Encrypt client-side if user is logged in
      let content = text;
      if (user) {
        const { encrypt } = await import('@/lib/encryption');
        const key = `ryvynn-journal-${user.id}`;
        content = await encrypt(text, key);
      }
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, encryptedContent: content }),
      });
      if (!res.ok) throw new Error('Save failed');
      setState('done');
      setTimeout(() => { setState('idle'); setTranscript(''); setExpanded(false); }, 2500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [user]);

  const startListening = useCallback(() => {
    if (!supported) return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => setState('listening');
    rec.onresult = (e: ISpeechRecognitionResultEvent) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTranscript(full);
      transcriptRef.current = full;
    };
    rec.onend = () => saveEntry(transcriptRef.current);
    rec.onerror = () => { setState('error'); setTimeout(() => setState('idle'), 2000); };
    recognitionRef.current = rec;
    rec.start();
  }, [supported, saveEntry]);

  const stopAndSave = () => {
    recognitionRef.current?.stop();
  };

  if (!supported) return null;

  const getIcon = () => {
    if (state === 'listening') return '⏹️';
    if (state === 'saving') return '💾';
    if (state === 'done') return '✨';
    if (state === 'error') return '⚠️';
    return isLateNight ? '🌙' : '📓';
  };

  const getLabel = () => {
    if (state === 'listening') return 'Tap to save';
    if (state === 'saving') return 'Saving...';
    if (state === 'done') return 'Saved ✨';
    if (state === 'error') return 'Try again';
    return isLateNight ? '3AM Journal' : 'Voice Journal';
  };

  const getBtnStyle = () => {
    if (state === 'listening') return 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse';
    if (state === 'done') return 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.7)]';
    if (state === 'saving') return 'bg-yellow-500/70';
    return 'bg-gradient-to-br from-ryvynn-cyan to-ryvynn-purple shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105';
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Transcript bubble */}
      {expanded && state === 'listening' && transcript && (
        <div className="bg-gray-900 border border-ryvynn-purple rounded-2xl px-4 py-3 max-w-[220px] text-sm text-gray-200 shadow-xl animate-fade-in">
          <p className="text-xs text-ryvynn-purple font-bold mb-1">🎙️ Hearing you...</p>
          <p className="line-clamp-4">{transcript}</p>
        </div>
      )}

      {/* Expand prompt */}
      {expanded && state === 'idle' && (
        <div className="bg-gray-900 border border-ryvynn-cyan/40 rounded-2xl px-4 py-3 max-w-[200px] text-sm shadow-xl">
          <p className="text-xs text-ryvynn-cyan font-bold mb-1">{isLateNight ? '🌙 Can\'t sleep?' : '📓 Quick Journal'}</p>
          <p className="text-gray-300 text-xs">Tap mic, speak freely. Auto-saves encrypted.</p>
          <button onClick={startListening} className="mt-2 w-full py-1.5 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg text-white text-xs font-bold hover:opacity-90 transition-all">
            Start Speaking
          </button>
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={state === 'listening' ? stopAndSave : state === 'idle' ? () => { setExpanded(e => !e); } : undefined}
        className={`w-14 h-14 rounded-full text-2xl font-bold text-white transition-all duration-200 flex items-center justify-center ${getBtnStyle()}`}
        title={getLabel()}
      >
        {getIcon()}
      </button>

      {/* Label */}
      <span className="text-xs text-gray-500 text-right">{getLabel()}</span>
    </div>
  );
}
