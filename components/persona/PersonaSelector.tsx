'use client';

import { usePersona } from '@/contexts/PersonaContext';
import type { Persona } from '@/contexts/PersonaContext';

const PERSONAS: { id: Persona; icon: string; label: string; desc: string }[] = [
  { id: 'neutral',   icon: '◎', label: 'Neutral',   desc: 'Balanced' },
  { id: 'feminine',  icon: '◉', label: 'Feminine',  desc: 'Warm, nurturing' },
  { id: 'masculine', icon: '◈', label: 'Masculine',  desc: 'Direct, grounded' },
  { id: 'aged',      icon: '◐', label: 'Aged',       desc: 'Wise, patient' },
];

export function PersonaSelector() {
  const { persona, setPersona, ratedMode, setRatedMode, emotionalDepth, setEmotionalDepth, is18Plus } = usePersona();

  return (
    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 16 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: '#636e84', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
        Guardian Voice
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            style={{
              background: persona === p.id ? 'rgba(0,201,232,.12)' : 'transparent',
              border: `1.5px solid ${persona === p.id ? '#00C9E8' : 'rgba(255,255,255,.1)'}`,
              borderRadius: 10, padding: '10px 8px', cursor: 'pointer', textAlign: 'center',
              fontFamily: 'inherit', transition: 'all .15s',
            }}>
            <div style={{ fontSize: 16, marginBottom: 4, color: persona === p.id ? '#00C9E8' : '#636e84' }}>
              {p.icon}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: persona === p.id ? '#eef2fa' : '#636e84', marginBottom: 2 }}>
              {p.label}
            </div>
            <div style={{ fontSize: 10, color: '#3a4352' }}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Emotional depth / tears mode */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10 }}>
        <div
          onClick={() => setEmotionalDepth(!emotionalDepth)}
          style={{
            width: 36, height: 20, borderRadius: 99, flexShrink: 0,
            background: emotionalDepth ? '#00C9E8' : 'rgba(255,255,255,.1)',
            position: 'relative', cursor: 'pointer', transition: 'background .2s',
          }}>
          <span style={{
            position: 'absolute', top: 2, left: emotionalDepth ? 18 : 2, width: 16, height: 16,
            borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block',
          }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#d8e0ee', fontWeight: 500 }}>Tears mode</div>
          <div style={{ fontSize: 10, color: '#3a4352', marginTop: 1 }}>Sit longer with the weight</div>
        </div>
      </label>

      {is18Plus && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            onClick={() => setRatedMode(!ratedMode)}
            style={{
              width: 36, height: 20, borderRadius: 99, flexShrink: 0,
              background: ratedMode ? '#7C5CBF' : 'rgba(255,255,255,.1)',
              position: 'relative', cursor: 'pointer', transition: 'background .2s',
            }}>
            <span style={{
              position: 'absolute', top: 2, left: ratedMode ? 18 : 2, width: 16, height: 16,
              borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#d8e0ee', fontWeight: 500 }}>Unfiltered</div>
            <div style={{ fontSize: 10, color: '#3a4352', marginTop: 1 }}>Raw, uncensored</div>
          </div>
        </label>
      )}
    </div>
  );
}
