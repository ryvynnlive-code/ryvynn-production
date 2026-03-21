'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function GuardianPage() {
  const { tf } = useI18n();
  const { persona } = usePersona();
  const { user, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isCrisis, setIsCrisis] = useState(false);

  // Voice state
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRec = (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
                      (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    const hasSynth = 'speechSynthesis' in window;
    setVoiceSupported(!!SpeechRec && hasSynth);
    if (hasSynth) synthRef.current = window.speechSynthesis;
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    if (!user) { setLoadingHistory(false); return; }
    const load = async () => {
      try {
        const res = await fetch(`/api/guardian/chat?userId=${user.id}&limit=50`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setMessages(data.conversations || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
  }, [user]);

  // Speak text via SpeechSynthesis
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const clean = text.replace(/[#*_~`]/g, '').replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Try to pick a warm female voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('karen') ||
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('zira') ||
      (v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsSpeaking(true); setVoiceState('speaking'); };
    utterance.onend = () => {
      setIsSpeaking(false);
      setVoiceState('idle');
      // Auto re-listen in voice mode after Guardian finishes speaking
      if (voiceMode) setTimeout(() => startListening(), 600);
    };
    utterance.onerror = () => { setIsSpeaking(false); setVoiceState('idle'); };
    synthRef.current.speak(utterance);
  }, [voiceMode]);

  // Send message to Guardian API
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userId = user?.id || 'anonymous';

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTranscript('');
    setLoading(true);
    setVoiceState('processing');

    try {
      const res = await fetch('/api/guardian/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsCrisis(data.isCrisis || false);

      // Speak the response if in voice mode
      if (voiceMode) {
        speak(data.response);
      } else {
        setVoiceState('idle');
      }
    } catch {
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: tf('guardianError'),
      };
      setMessages(prev => [...prev, fallback]);
      setIsCrisis(true);
      setVoiceState('idle');
    } finally {
      setLoading(false);
    }
  }, [loading, user, voiceMode, speak, tf]);

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!voiceSupported) return;
    const SpeechRec = (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
                      (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) return;

    // Stop if already speaking
    if (isSpeaking && synthRef.current) synthRef.current.cancel();

    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceState('listening');
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const current = Array.from(e.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      setTranscript(current);
      if (e.results[e.results.length - 1].isFinal) {
        setInput(current);
      }
    };
    recognition.onend = () => {
      setVoiceState('idle');
      // Auto-send if we got something
      if (transcript.trim()) {
        sendMessage(transcript.trim());
      }
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('Speech error:', e.error);
      setVoiceState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceSupported, isSpeaking, transcript, sendMessage]);

  // Stop listening
  const stopListening = () => {
    recognitionRef.current?.stop();
    setVoiceState('idle');
  };

  // Stop Guardian speaking
  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
    setVoiceState('idle');
  };

  // Toggle voice mode
  const toggleVoiceMode = () => {
    if (voiceMode) {
      stopListening();
      stopSpeaking();
    }
    setVoiceMode(!voiceMode);
    setVoiceState('idle');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const getMicButtonStyle = () => {
    if (voiceState === 'listening') return 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-110 animate-pulse';
    if (voiceState === 'processing') return 'bg-yellow-500/50 cursor-not-allowed';
    if (voiceState === 'speaking') return 'bg-ryvynn-purple shadow-[0_0_30px_rgba(139,92,246,0.8)] animate-pulse';
    return 'bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple hover:scale-110 shadow-[0_0_20px_rgba(0,217,255,0.4)]';
  };

  const getMicIcon = () => {
    if (voiceState === 'listening') return '🎙️';
    if (voiceState === 'processing') return '⚡';
    if (voiceState === 'speaking') return '🔊';
    return '🎤';
  };

  const getVoiceLabel = () => {
    if (voiceState === 'listening') return 'Listening... tap to send';
    if (voiceState === 'processing') return 'Guardian is thinking...';
    if (voiceState === 'speaking') return 'Guardian is speaking... tap to stop';
    return 'Tap mic to speak';
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
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-1">
              🛡️ {tf('guardianTitle')}
            </h1>
            <p className="text-gray-400 text-sm">
              {tf('guardianSubtitle')} • Persona: {persona}
            </p>
          </div>

          {/* Voice Mode Toggle */}
          {voiceSupported && (
            <button
              onClick={toggleVoiceMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                voiceMode
                  ? 'bg-ryvynn-purple/20 border-ryvynn-purple text-ryvynn-purple shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-ryvynn-purple hover:text-ryvynn-purple'
              }`}
            >
              <span>{voiceMode ? '🔊' : '🔇'}</span>
              <span>{voiceMode ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
          )}
        </div>

        {/* Crisis Banner */}
        {isCrisis && (
          <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-red-400 mb-1">{tf('guardianCrisisTitle')}</h3>
                <p className="text-sm text-gray-300">{tf('guardianCrisisDesc')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">

          {/* Messages */}
          <div className="h-[460px] overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🛡️</div>
                <p className="text-lg">{tf('guardianReady')}</p>
                <p className="text-sm mt-2">{tf('guardianEmpty')}</p>
                {voiceMode && (
                  <p className="text-sm mt-3 text-ryvynn-purple font-bold animate-pulse">
                    🎤 Voice mode active — tap the mic to speak
                  </p>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-ryvynn-cyan/20 border border-ryvynn-cyan/30 text-white'
                    : 'bg-ryvynn-purple/20 border border-ryvynn-purple/30 text-white'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="text-xs text-ryvynn-purple font-bold mb-2 flex items-center gap-1">
                      🛡️ Guardian
                      {voiceMode && isSpeaking && (
                        <span className="ml-2 flex gap-1">
                          <span className="w-1 h-3 bg-ryvynn-purple rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-3 bg-ryvynn-purple rounded animate-bounce" style={{ animationDelay: '100ms' }} />
                          <span className="w-1 h-3 bg-ryvynn-purple rounded animate-bounce" style={{ animationDelay: '200ms' }} />
                        </span>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-ryvynn-purple/20 border border-ryvynn-purple/30">
                  <div className="text-xs text-ryvynn-purple font-bold mb-2">🛡️ Guardian</div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-ryvynn-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-ryvynn-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-ryvynn-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-gray-800 p-4 bg-black/60">

            {/* Voice Mode UI */}
            {voiceMode ? (
              <div className="flex flex-col items-center gap-4">
                {/* Live transcript */}
                {(transcript || voiceState === 'listening') && (
                  <div className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 text-sm min-h-[48px]">
                    {transcript || <span className="text-gray-600 animate-pulse">Listening...</span>}
                  </div>
                )}

                {/* Voice state label */}
                <p className={`text-sm font-medium ${
                  voiceState === 'listening' ? 'text-red-400' :
                  voiceState === 'speaking' ? 'text-ryvynn-purple' :
                  voiceState === 'processing' ? 'text-yellow-400' :
                  'text-gray-500'
                }`}>
                  {getVoiceLabel()}
                </p>

                {/* Mic / Stop button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={voiceState === 'speaking' ? stopSpeaking : voiceState === 'listening' ? stopListening : startListening}
                    disabled={voiceState === 'processing'}
                    className={`w-20 h-20 rounded-full text-3xl font-bold text-white transition-all duration-200 ${getMicButtonStyle()}`}
                  >
                    {getMicIcon()}
                  </button>
                </div>

                {/* Fallback text input in voice mode */}
                <div className="w-full flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Or type instead..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-ryvynn-purple"
                    disabled={loading}
                  />
                  {input.trim() && (
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white font-bold text-sm hover:scale-105 transition-all"
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>

            ) : (
              /* Text Mode UI */
              <div>
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={tf('guardianPlaceholder')}
                    rows={2}
                    className="flex-1 bg-gray-900 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ryvynn-purple resize-none"
                    disabled={loading}
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={loading || !input.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                      {loading ? '⚡' : '🛡️'}
                    </button>
                    {voiceSupported && (
                      <button
                        onClick={startListening}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-400 hover:border-ryvynn-purple hover:text-ryvynn-purple hover:scale-105 disabled:opacity-50 transition-all"
                        title="Tap to speak"
                      >
                        🎤
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                  <span>{tf('guardianKeyboardHint')}</span>
                  <span className="text-ryvynn-purple font-bold">{tf('guardianFreeLabel')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
          <h3 className="font-bold text-ryvynn-cyan mb-2">🛡️ {tf('guardianInfoTitle')}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• {tf('guardianInfo1')}</li>
            <li>• {tf('guardianInfo2')}</li>
            <li>• {tf('guardianInfo3')}</li>
            <li>• {tf('guardianInfo4')}</li>
            <li>• {tf('guardianInfo5')}</li>
            {voiceSupported && (
              <li>• 🎤 Voice mode available — toggle top right for two-way voice conversation</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
