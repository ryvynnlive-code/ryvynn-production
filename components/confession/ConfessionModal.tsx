'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, MapPin, Music } from 'lucide-react';
import { SacredGeometry } from '@/components/sacred/SacredGeometry';
import dynamic from 'next/dynamic';

const SoundPlayer = dynamic(() => import('@/components/sound/SoundPlayer'), { ssr: false });

type GenderVoice  = 'masculine' | 'feminine' | 'neutral';
type AdviceStyle  = 'clinical'  | 'friendly' | 'uncut';

interface ConfessionModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSubmitted?: (content: string) => void;
}

export function ConfessionModal({ isOpen, onClose, onSubmitted }: ConfessionModalProps) {
  const [confession,   setConfession]   = useState('');
  const [genderVoice,  setGenderVoice]  = useState<GenderVoice>('neutral');
  const [adviceStyle,  setAdviceStyle]  = useState<AdviceStyle>('friendly');
  const [ageVerified,  setAgeVerified]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [miracle,      setMiracle]      = useState<string | null>(null);
  const [showSound,    setShowSound]    = useState(false);
  const [mood,         setMood]         = useState('calm');

  const MOODS = ['calm', 'heavy', 'anxious', 'release', 'steady'];

  const handleSubmit = async () => {
    if (confession.length < 10) return;
    setLoading(true);
    setMiracle(null);
    setShowSound(false);
    try {
      const res  = await fetch('/api/confession', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          confession, genderVoice, adviceStyle, ageVerified,
          userId: `anon-${Date.now()}`,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.crisis) {
        // Crisis — close modal, banner handles it
        onSubmitted?.(confession);
        reset();
        onClose();
        return;
      }

      if (data.miracle?.content) {
        setMiracle(data.miracle.content);
        onSubmitted?.(data.miracle.content);
      } else {
        onSubmitted?.(confession);
        reset();
        onClose();
      }
    } catch {
      onSubmitted?.(confession);
      reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  function reset() {
    setConfession('');
    setMiracle(null);
    setShowSound(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-background border border-border rounded-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sacred geometry watermark */}
            <div className="absolute -top-6 -right-6 pointer-events-none">
              <SacredGeometry pattern="sri-yantra" size={180} opacity={0.03} color="rgba(249,115,22,0.8)" strokeWidth={0.4} />
            </div>

            <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>

            {/* ---- MIRACLE VIEW ---- */}
            {miracle ? (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
                  <Flame className="h-6 w-6" />
                  Your Miracle
                </h2>
                <div className="rounded-xl bg-card border border-border p-5">
                  <p className="text-foreground leading-relaxed italic text-sm">{miracle}</p>
                </div>
                <p className="text-xs text-muted-foreground">Your original words were never stored. This miracle is yours.</p>

                {/* Sound healing offer */}
                {!showSound ? (
                  <button
                    onClick={() => setShowSound(true)}
                    className="w-full py-3 rounded-lg border border-fuchsia-800/50 text-fuchsia-400 hover:bg-fuchsia-950/30 text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Music className="h-4 w-4" />
                    Turn this into healing sound
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {MOODS.map(m => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={`flex-1 py-1.5 rounded text-xs font-medium transition-all capitalize ${
                            mood === m
                              ? 'bg-fuchsia-700 text-white'
                              : 'bg-card text-muted-foreground border border-border hover:border-fuchsia-700/50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <SoundPlayer mood={mood} confessionText={confession} onClose={() => setShowSound(false)} />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { reset(); }}
                    className="flex-1 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-flame-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Flame className="h-4 w-4" /> Share Another
                  </button>
                </div>
              </div>
            ) : (
              /* ---- CONFESSION FORM ---- */
              <>
                <h2 className="text-2xl font-bold text-accent mb-6 flex items-center gap-2">
                  <Flame className="h-6 w-6" />
                  Share Anonymously
                </h2>

                <textarea
                  value={confession}
                  onChange={(e) => setConfession(e.target.value)}
                  placeholder="Pour it out. No judgment. No record."
                  className="w-full h-40 bg-card border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {confession.length} chars · minimum 10 · anonymous always
                </p>

                {/* Gender Voice */}
                <div className="mt-5">
                  <label className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">Gender Voice</label>
                  <div className="flex gap-2">
                    {(['masculine','feminine','neutral'] as GenderVoice[]).map(o => (
                      <button key={o} onClick={() => setGenderVoice(o)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          genderVoice === o ? 'bg-accent text-accent-foreground' : 'bg-card text-muted-foreground border border-border hover:border-accent/50'
                        }`}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advice Style */}
                <div className="mt-4">
                  <label className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">Advice Style</label>
                  <div className="flex gap-2">
                    {(['clinical','friendly','uncut'] as AdviceStyle[]).map(o => (
                      <button key={o} onClick={() => setAdviceStyle(o)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          adviceStyle === o ? 'bg-accent text-accent-foreground' : 'bg-card text-muted-foreground border border-border hover:border-accent/50'
                        }`}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 18+ Toggle */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-semibold block">Age Verified 18+</label>
                    <p className="text-xs text-muted-foreground mt-0.5">Unfiltered confessions</p>
                  </div>
                  <button
                    onClick={() => setAgeVerified(!ageVerified)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${ageVerified ? 'bg-accent' : 'bg-border'}`}
                    role="switch" aria-checked={ageVerified}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${ageVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  Location used for local advice only. Never stored.
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={confession.length < 10 || loading}
                  className="mt-6 w-full bg-accent hover:bg-flame-600 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground font-bold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Flame className="h-5 w-5" />
                  {loading ? 'Transforming...' : 'Release Into the Flame'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
