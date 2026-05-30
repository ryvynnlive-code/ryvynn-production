'use client';

import { usePersona } from '@/contexts/PersonaContext';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { GrowingAvatar } from '@/components/GrowingAvatar';
import type { Persona } from '@/contexts/PersonaContext';
import { useState, useEffect } from 'react';

interface ProfileData { streak_days: number; soul_tokens: number; }

type ThemeToggleProps = { value: boolean; onChange: (v: boolean) => void };

function Toggle({ value, onChange }: ThemeToggleProps) {
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
  const { t, tp, tf, language, setLanguage } = useI18n();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/tokens?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setProfile({ streak_days: d.streak ?? 0, soul_tokens: d.balance ?? 0 }))
      .catch(() => {});
  }, [user]);

  const PERSONAS: { id: Persona; icon: string; label: string; desc: string }[] = [
    { id: 'neutral',   icon: '◎', label: tp('neutral'),   desc: tp('neutralDesc') },
    { id: 'feminine',  icon: '◉', label: tp('feminine'),  desc: tp('feminineDesc') },
    { id: 'masculine', icon: '◈', label: tp('masculine'), desc: tp('masculineDesc') },
    { id: 'aged',      icon: '◐', label: tp('aged'),      desc: tp('agedDesc') },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#07080f', color: '#d8e0ee',
      fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        :root { --cyan:#00C9E8; --purple:#7C5CBF; }
        .lora { font-family:'Lora',Georgia,serif; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '52px 24px 80px' }}>
        <h1 className="lora" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 400,
          color: '#eef2fa', marginBottom: 8 }}>{tf('settings')}</h1>
        <p style={{ fontSize: 14, color: '#636e84', marginBottom: 40 }}>
          {tf('dashboardSubtitle')}
        </p>

        {/* Stats */}
        {profile && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
            {[
              { label: tf('tokenStreak'), value: `${profile.streak_days} days` },
              { label: tf('soulTokens'), value: profile.soul_tokens },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, minWidth: 130, background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '16px 20px',
              }}>
                <div style={{ fontSize: 11, color: '#636e84', textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#00C9E8' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Section: Guardian Persona */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#636e84',
            textTransform: 'uppercase', marginBottom: 20 }}>{tp('choosePersona')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                style={{
                  padding: '16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  border: `1.5px solid ${persona === p.id ? '#00C9E8' : 'rgba(255,255,255,.08)'}`,
                  background: persona === p.id ? 'rgba(0,201,232,.08)' : 'rgba(255,255,255,.03)',
                  transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#eef2fa', marginBottom: 3 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: '#636e84' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Language */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#636e84',
            textTransform: 'uppercase', marginBottom: 20 }}>{t('language')}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['en', 'es'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: '12px 24px', borderRadius: 99, cursor: 'pointer', fontWeight: 600,
                  fontSize: 14, border: `1.5px solid ${language === lang ? '#00C9E8' : 'rgba(255,255,255,.1)'}`,
                  background: language === lang ? 'rgba(0,201,232,.1)' : 'rgba(255,255,255,.03)',
                  color: language === lang ? '#00C9E8' : '#636e84', transition: 'all .15s',
                }}
              >
                {lang === 'en' ? '🇺🇸 English' : '🇲🇽 Español'}
              </button>
            ))}
          </div>
        </section>

        {/* Section: Toggles */}
        <section>
          <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#636e84',
            textTransform: 'uppercase', marginBottom: 4 }}>{tf('settings')}</h2>
          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 14, padding: '0 20px' }}>
            <Row label={tp('ratedEnabled')} desc={tp('ratedWarning')}>
              <Toggle value={ratedMode} onChange={setRatedMode} />
            </Row>
            <Row label={t('featureZeroSurveillance') || 'Dark Mode'} desc="Force dark visual theme">
              <Toggle value={darkMode} onChange={setDarkMode} />
            </Row>
            <Row label="Deep Emotional Mode" desc="Guardian goes deeper into trauma, less surface-level">
              <Toggle value={emotionalDepth} onChange={setEmotionalDepth} />
            </Row>
          </div>
        </section>

        {/* Danger zone */}
        {user && (
          <section style={{ marginTop: 60 }}>
            <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em',
              color: '#ff4444', textTransform: 'uppercase', marginBottom: 20 }}>{tf('dangerZone')}</h2>
            <div style={{ background: 'rgba(255,68,68,.04)', border: '1px solid rgba(255,68,68,.15)',
              borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 14, color: '#eef2fa', marginBottom: 4 }}>{tf('deleteAllData')}</div>
              <div style={{ fontSize: 12, color: '#636e84', marginBottom: 16 }}>{tf('deleteWarning')}</div>
              <button style={{
                padding: '10px 20px', borderRadius: 99, background: 'rgba(255,68,68,.1)',
                border: '1px solid rgba(255,68,68,.3)', color: '#ff4444', fontSize: 13,
                cursor: 'pointer', fontWeight: 500,
              }}
              onClick={() => confirm('This cannot be undone. Delete everything?') && console.log('TODO: delete flow')}>
                {tf('deleteAllData')}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
