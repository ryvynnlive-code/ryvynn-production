'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, MapPin } from 'lucide-react';

type GenderVoice = 'masculine' | 'feminine' | 'neutral';
type AdviceStyle = 'clinical' | 'friendly' | 'uncut';

interface ConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfessionModal({ isOpen, onClose }: ConfessionModalProps) {
  const [confession, setConfession] = useState('');
  const [genderVoice, setGenderVoice] = useState<GenderVoice>('neutral');
  const [adviceStyle, setAdviceStyle] = useState<AdviceStyle>('friendly');
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (confession.length < 10) return;
    setLoading(true);
    try {
      await fetch('/api/confession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confession,
          genderVoice,
          adviceStyle,
          ageVerified,
          userId: `anon-${Date.now()}`,
        }),
      });
      setConfession('');
      onClose();
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-background border border-border rounded-xl p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-accent mb-6 flex items-center gap-2">
              <Flame className="h-6 w-6" />
              Share Anonymously
            </h2>

            {/* Textarea */}
            <textarea
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              placeholder="Pour it out. No judgment. No record."
              className="w-full h-40 bg-card border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
            />

            {/* Gender Voice */}
            <div className="mt-5">
              <label className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">
                Gender Voice
              </label>
              <div className="flex gap-2">
                {(['masculine', 'feminine', 'neutral'] as GenderVoice[]).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => setGenderVoice(option)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        genderVoice === option
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-card text-muted-foreground border border-border hover:border-accent/50'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Advice Style */}
            <div className="mt-4">
              <label className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">
                Advice Style
              </label>
              <div className="flex gap-2">
                {(['clinical', 'friendly', 'uncut'] as AdviceStyle[]).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => setAdviceStyle(option)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        adviceStyle === option
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-card text-muted-foreground border border-border hover:border-accent/50'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Age Verified Toggle */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <label className="text-xs uppercase tracking-widest text-accent font-semibold block">
                  Age Verified 18+
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show me unfiltered confessions
                </p>
              </div>
              <button
                onClick={() => setAgeVerified(!ageVerified)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  ageVerified ? 'bg-accent' : 'bg-border'
                }`}
                role="switch"
                aria-checked={ageVerified}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
                    ageVerified ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Location notice */}
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Using your general location for relevant advice. Never stored.
            </p>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={confession.length < 10 || loading}
              className="mt-6 w-full bg-accent hover:bg-flame-600 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground font-bold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-base"
            >
              <Flame className="h-5 w-5" />
              {loading ? 'Transforming...' : 'Release Into the Flame'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
