'use client';

import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { FlameAvatar } from '@/components/avatar/FlameAvatar';
import { SafeMode } from '@/components/safe-mode/SafeMode';
import { SacredGeometry, SacredDivider } from '@/components/sacred/SacredGeometry';

type GenderVoice = 'masculine' | 'feminine' | 'neutral';
type AdviceStyle = 'clinical' | 'friendly' | 'uncut';
type ThemeOption = 'dark-flame' | 'obsidian' | 'sacred-light';

const THEMES: { id: ThemeOption; label: string; colors: [string, string] }[] = [
  { id: 'dark-flame', label: 'Dark Flame', colors: ['#12121a', '#c026d3'] },
  { id: 'obsidian', label: 'Obsidian', colors: ['#000000', '#3f3f46'] },
  { id: 'sacred-light', label: 'Sacred Light', colors: ['#0f0f17', '#fbbf24'] },
];

export default function SettingsPage() {
  const [genderVoice, setGenderVoice] = useState<GenderVoice>('neutral');
  const [adviceStyle, setAdviceStyle] = useState<AdviceStyle>('friendly');
  const [ageVerified, setAgeVerified] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>('dark-flame');
  const [safeMode, setSafeMode] = useState(false);

  const handleClearSession = () => {
    setGenderVoice('neutral');
    setAdviceStyle('friendly');
    setAgeVerified(false);
    setTheme('dark-flame');
  };

  return (
    <>
      <SafeMode isActive={safeMode} onExit={() => setSafeMode(false)} />

      <div className="min-h-screen bg-background text-foreground relative overflow-hidden sacred-grid">
        {/* Background sacred geometry */}
        <div className="fixed top-[20%] right-[-8%] pointer-events-none z-0">
          <SacredGeometry
            pattern="metatrons-cube"
            size={400}
            opacity={0.015}
            color="rgba(249,115,22,0.5)"
            strokeWidth={0.3}
          />
        </div>
        <div className="fixed bottom-[-10%] left-[-5%] pointer-events-none z-0">
          <SacredGeometry
            pattern="flower-of-life"
            size={350}
            opacity={0.018}
            color="rgba(249,115,22,0.4)"
            strokeWidth={0.3}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center gap-4 px-6 py-5 border-b border-border">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </header>

        <div className="relative z-10 max-w-lg mx-auto px-5 py-8 flex flex-col gap-10">
          {/* Section: Your Flame */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-accent font-semibold mb-6">
              Your Flame
            </h2>
            <div className="flex flex-col items-center py-4">
              <FlameAvatar level={3} xp={67} maxXp={100} />
            </div>
          </section>

          <SacredDivider />

          {/* Section: Preferences */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
              Preferences
            </h2>
            <div className="flex flex-col gap-5">
              {/* Gender Voice */}
              <div>
                <label className="text-sm text-card-foreground mb-2 block">Gender Voice</label>
                <div className="flex gap-2">
                  {(['masculine', 'feminine', 'neutral'] as GenderVoice[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setGenderVoice(option)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
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

              {/* Advice Persona */}
              <div>
                <label className="text-sm text-card-foreground mb-2 block">Advice Persona</label>
                <div className="flex gap-2">
                  {(['clinical', 'friendly', 'uncut'] as AdviceStyle[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setAdviceStyle(option)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
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

              {/* 18+ Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-card-foreground">18+ Content</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Show unfiltered confessions</p>
                </div>
                <button
                  onClick={() => setAgeVerified(!ageVerified)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    ageVerified ? 'bg-accent' : 'bg-border'
                  }`}
                  role="switch"
                  aria-checked={ageVerified}
                  aria-label="Toggle 18+ content"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
                      ageVerified ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          <SacredDivider />

          {/* Section: Theme */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
              Theme
            </h2>
            <div className="flex gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    theme === t.id
                      ? 'border-accent bg-card'
                      : 'border-border hover:border-accent/30'
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: t.colors[0] }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: t.colors[1] }}
                    />
                  </div>
                  <span className="text-xs text-card-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          <SacredDivider />

          {/* Section: Safety */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
              Safety
            </h2>
            <button
              onClick={() => setSafeMode(true)}
              className="w-full bg-card border border-border rounded-lg p-4 text-left hover:border-accent/30 transition-colors"
            >
              <p className="text-sm font-semibold text-card-foreground">Enter Safe Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Guided breathing and crisis resources
              </p>
            </button>
          </section>

          <SacredDivider />

          {/* Section: Privacy */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
              Privacy
            </h2>
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-sm text-card-foreground leading-relaxed">
                RYVYNN stores zero personal data. Confessions are never saved. Only anonymized miracles remain. Your session preferences live only in this browser tab.
              </p>
              <button
                onClick={handleClearSession}
                className="mt-4 inline-flex items-center gap-2 text-destructive hover:text-fuchsia-400 text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear Session
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
