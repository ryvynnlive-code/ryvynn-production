'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Phone, MessageCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';

type GenderVoice = 'masculine' | 'feminine' | 'neutral';
type AdviceStyle = 'clinical' | 'friendly' | 'uncut';

export default function ConfessPage() {
  const [confession, setConfession] = useState('');
  const [genderVoice, setGenderVoice] = useState<GenderVoice>('neutral');
  const [adviceStyle, setAdviceStyle] = useState<AdviceStyle>('friendly');
  const [loading, setLoading] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [miracle, setMiracle] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCrisis(false);
    setMiracle(null);

    try {
      const res = await fetch('/api/confession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confession,
          genderVoice,
          adviceStyle,
          userId: `anon-${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (data.crisis) {
        setCrisis(true);
      } else if (data.success) {
        setMiracle(data.miracle.content);
        setConfession('');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CrisisBanner />

      <header className="flex items-center gap-4 px-6 py-5">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Confess</h1>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-20">
        {/* Crisis detected */}
        {crisis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-destructive/30 rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-destructive mb-3">
              We detect you may need support
            </h2>
            <p className="text-sm text-card-foreground mb-5 leading-relaxed">
              {"You're not alone. Please reach out to someone who can help:"}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="tel:988"
                className="flex items-center gap-3 bg-muted rounded-lg p-3 hover:bg-border transition-colors"
              >
                <Phone className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">Call 988 — Suicide & Crisis Lifeline</span>
              </a>
              <a
                href="sms:741741"
                className="flex items-center gap-3 bg-muted rounded-lg p-3 hover:bg-border transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">Text 741741 — Crisis Text Line</span>
              </a>
              <a
                href="https://988lifeline.org/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-muted rounded-lg p-3 hover:bg-border transition-colors"
              >
                <Globe className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">Chat Online</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Miracle result */}
        {miracle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-l-[3px] border-l-accent rounded-lg p-6 mb-8"
          >
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Your Miracle</p>
            <p className="text-card-foreground leading-relaxed italic">
              {'"'}{miracle}{'"'}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Your confession was transformed. Now in the miracle feed.
            </p>
            <button
              onClick={() => setMiracle(null)}
              className="mt-3 text-sm text-accent hover:text-flame-400 transition-colors"
            >
              Share another
            </button>
          </motion.div>
        )}

        {/* Confession form */}
        {!miracle && !crisis && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <textarea
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                placeholder="Pour it out. No judgment. No record."
                className="w-full h-44 bg-card border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                disabled={loading}
                required
                minLength={10}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum 10 characters. Never stored. Only miracles saved.
              </p>
            </div>

            {/* Gender Voice */}
            <div>
              <label className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">
                Gender Voice
              </label>
              <div className="flex gap-2">
                {(['masculine', 'feminine', 'neutral'] as GenderVoice[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGenderVoice(option)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      genderVoice === option
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-card text-muted-foreground border border-border hover:border-accent/50'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Advice Style */}
            <div>
              <label className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">
                Advice Style
              </label>
              <div className="flex gap-2">
                {(['clinical', 'friendly', 'uncut'] as AdviceStyle[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAdviceStyle(option)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      adviceStyle === option
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-card text-muted-foreground border border-border hover:border-accent/50'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-card border border-destructive/30 rounded-lg p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || confession.length < 10}
              className="w-full bg-accent hover:bg-flame-600 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground font-bold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Flame className="h-5 w-5" />
              {loading ? 'Transforming...' : 'Transform to Miracle'}
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <Link href="/feed" className="text-sm text-accent hover:text-flame-400 transition-colors">
            View Miracle Feed
          </Link>
        </div>
      </main>
    </div>
  );
}
