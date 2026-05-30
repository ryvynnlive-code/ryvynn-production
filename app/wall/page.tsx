'use client';

import { useState } from 'react';
import { WallFeed } from '@/components/wall/FiftyFiftyWall';
import { useI18n } from '@/contexts/I18nContext';
import Image from 'next/image';
import Link from 'next/link';

export default function WallPage() {
  const [showShare, setShowShare] = useState(false);
  const { t, tp } = useI18n();

  return (
    <main style={{ minHeight: '100vh', background: '#07080f', color: '#d8e0ee',
      fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        :root { --cyan:#00C9E8; --purple:#7C5CBF; --dim:#636e84; --dimmer:#3a4352; --border:rgba(255,255,255,.08); }
        .lora { font-family:'Lora',Georgia,serif; }
        .btn { display:inline-flex;align-items:center;gap:8px;background:rgba(0,201,232,.1);border:1.5px solid #00C9E8;border-radius:99px;padding:11px 22px;color:#00C9E8;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:all .15s;font-family:inherit; }
        .btn:hover { background:rgba(0,201,232,.18); }
        .btn-ghost { background:none;border:none;color:var(--dim);font-family:inherit;font-size:14px;cursor:pointer;padding:0; }
        .btn-ghost:hover { color:var(--cyan); }
        .divider { border:none;border-top:1px solid var(--border);margin:0; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '52px 24px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Image src="/assets/dual-flame-logo.png" alt="" width={24} height={24}
            style={{ objectFit: 'contain', opacity: .7 }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em',
            color: 'var(--dim)', textTransform: 'uppercase' }}>{t('hpWallTag')}</span>
        </div>
        <h1 className="lora" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400,
          color: '#eef2fa', lineHeight: 1.2, marginBottom: 14 }}>
          {t('hpWallH2')}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--dim)', marginBottom: 28, maxWidth: 520 }}>
          {t('hpWallSub')}
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setShowShare(true)}>
            {t('hpWallShareBtn')}
          </button>
          <Link href="/guardian" style={{ fontSize: 13, color: 'var(--dimmer)', textDecoration: 'none' }}>
            {t('hpWallReadBtn')} →
          </Link>
        </div>
      </div>

      <hr className="divider" />
      <WallFeed onShare={() => setShowShare(true)} />

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </main>
  );
}

// ─── Share Modal ─────────────────────────────────────────────────────────────
function ShareModal({ onClose }: { onClose: () => void }) {
  const { tp } = useI18n();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/confession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confession: text, shareToWall: true }),
      });
      if (res.ok) setDone(true);
    } catch {}
    setLoading(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#0d1117', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 16, padding: 32, maxWidth: 520, width: '100%',
      }} onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
            <p style={{ color: '#eef2fa', fontSize: 18, marginBottom: 8 }}>{tp('confessionSharedAnon')}</p>
            <button onClick={onClose} style={{ marginTop: 16, color: '#636e84', background: 'none',
              border: 'none', cursor: 'pointer', fontSize: 14 }}>{tp('journalClose')}</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, color: '#eef2fa', marginBottom: 8 }}>{tp('confessionTransformBtn')}</h2>
            <p style={{ fontSize: 13, color: '#636e84', marginBottom: 20 }}>{tp('confessionPrivacyNote')}</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={tp('confessionWritePlaceholder')}
              style={{
                width: '100%', minHeight: 120, background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 16,
                color: '#d8e0ee', fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={submit}
                disabled={!text.trim() || loading}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 99, background: '#00C9E8',
                  color: '#000', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  opacity: (!text.trim() || loading) ? 0.5 : 1,
                }}
              >
                {loading ? tp('confessionTransformingTitle') : tp('confessionShareWallBtn')}
              </button>
              <button onClick={onClose} style={{
                padding: '12px 20px', borderRadius: 99, background: 'rgba(255,255,255,.06)',
                color: '#636e84', border: 'none', cursor: 'pointer', fontSize: 14,
              }}>{tp('confessionCancel')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
