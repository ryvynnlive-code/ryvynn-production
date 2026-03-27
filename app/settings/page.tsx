'use client';

import { usePersona } from '@/contexts/PersonaContext';
import { useAuth } from '@/contexts/AuthContext';
import { GrowingAvatar } from '@/components/GrowingAvatar';
import type { Persona } from '@/contexts/PersonaContext';
import { useState, useEffect } from 'react';

interface ProfileData { streak_days: number; soul_tokens: number; }

const PERSONAS: { id: Persona; icon: string; label: string; desc: string }[] = [
  { id: 'neutral',   icon: '◎', label: 'Neutral',   desc: 'Balanced, universal' },
  { id: 'feminine',  icon: '◉', label: 'Feminine',  desc: 'Warm, nurturing' },
  { id: 'masculine', icon: '◈', label: 'Masculine',  desc: 'Direct, grounded' },
  { id: 'aged',      icon: '◐', label: 'Aged',       desc: 'Wise, long-view' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} aria-pressed={value} style={{
      width: 46, height: 26, borderRadius: 99, border: 'none', flexShrink: 0,
      background: value ? '#00C9E8' : 'rgba(255,255,255,0.1)',
      cursor: 'pointer', position: 'relative', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: value ? 23 : 3, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block',
      }} />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 20, padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, color: '#eef2fa', fontWeight: 500, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#636e84', lineHeight: 1.6 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { persona, setPersona, emotionalDepth, setEmotionalDepth,
          darkMode, setDarkMode, ratedMode, setRatedMode } = usePersona();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/tokens?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setProfile({ streak_days: d.streak ?? 0, soul_tokens: d.balance ?? 0 }))
      .catch(() => {});
  }, [user]);

  return (
    <main style={{ minHeight: '100vh', background: '#07080f', color: '#d8e0ee',
      fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        :root { --cyan:#00C9E8; --dim:#636e84; --border:rgba(255,255,255,0.08); }
      `}</style>

      {/* Hero header — light shines through corner based on dark mode state */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '60%', height: 280, pointerEvents: 'none',
          background: darkMode
            ? 'radial-gradient(ellipse at 100% 0%, rgba(0,201,232,0.07) 0%, rgba(124,92,191,0.04) 45%, transparent 70%)'
            : 'radial-gradient(ellipse at 100% 0%, rgba(245,201,80,0.18) 0%, rgba(0,201,232,0.08) 40%, transparent 68%)',
          transition: 'background 0.6s ease',
        }} />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '52px 24px 36px', position: 'relative' }}>
          <h1 style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)',
            fontWeight: 400, color: '#eef2fa', marginBottom: 8 }}>
            Settings
          </h1>
          <p style={{ fontSize: 14, color: '#636e84' }}>
            Saved to this device. Nothing goes to any server.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Growing Avatar — only for logged in users */}
        {user && profile && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '28px 24px', marginBottom: 40,
            display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <GrowingAvatar streakDays={profile.streak_days} tokens={profile.soul_tokens} size={108} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 14, color: '#eef2fa', fontWeight: 500, marginBottom: 8 }}>
                Your flame grows as you return
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                {[3, 7, 14, 30, 60, 90].map(d => (
                  <div key={d} style={{
                    fontSize: 11, fontWeight: 500,
                    color: profile.streak_days >= d ? '#00C9E8' : 'rgba(255,255,255,0.12)',
                  }}>
                    {d}d
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#636e84' }}>
                {profile.streak_days === 0
                  ? 'Check in on your dashboard to start your streak'
                  : `${profile.streak_days}-day streak · keep going`}
              </div>
            </div>
          </div>
        )}

        {/* Persona */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em',
            color: '#636e84', textTransform: 'uppercase', marginBottom: 14 }}>
            Guardian Persona
          </div>
          <p style={{ fontSize: 13, color: '#636e84', lineHeight: 1.7, marginBottom: 20 }}>
            How your Guardian speaks. Same privacy, different tone.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {PERSONAS.map(p => (
              <button key={p.id} onClick={() => setPersona(p.id)} style={{
                background: persona === p.id ? 'rgba(0,201,232,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${persona === p.id ? '#00C9E8' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, padding: '16px 14px', cursor: 'pointer',
                textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6, color: persona === p.id ? '#00C9E8' : '#636e84' }}>
                  {p.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600,
                  color: persona === p.id ? '#eef2fa' : '#636e84', marginBottom: 3 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: '#3a4352' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Toggles */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em',
            color: '#636e84', textTransform: 'uppercase', marginBottom: 4 }}>
            Experience
          </div>

          <Row label="Dark mode"
            desc={darkMode
              ? "Currently dark. The flame burns brighter in darkness."
              : "Light is on — warmth shines through the corner."}>
            <Toggle value={darkMode} onChange={setDarkMode} />
          </Row>

          <Row label="Emotional depth (tears mode)"
            desc="Guardian sits longer with the weight. More presence, less redirect. Turn on when you need to be fully witnessed.">
            <Toggle value={emotionalDepth} onChange={setEmotionalDepth} />
          </Row>

          <Row label="Unfiltered language"
            desc="Raw, uncensored responses. No softening of hard truths.">
            <Toggle value={ratedMode} onChange={setRatedMode} />
          </Row>
        </section>

        <p style={{ marginTop: 56, fontSize: 12, color: '#1e2535', lineHeight: 1.8 }}>
          All settings are local to this device. Clearing browser storage resets them.<br />
          Nothing about your preferences is transmitted or stored.
        </p>
      </div>
    </main>
  );
}
