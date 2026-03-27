'use client';

import { useState } from 'react';
import { WallFeed } from '@/components/wall/WallFeed';

export default function WallPage() {
  const [showShare, setShowShare] = useState(false);

  return (
    <main className="min-h-screen bg-[#07080f] text-[#d8e0ee]" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        :root { --cyan:#00C9E8; --dim:#636e84; --dimmer:#3a4352; --border:rgba(255,255,255,.08); }
        .lora { font-family:'Lora',Georgia,serif; }
        .btn { display:inline-flex;align-items:center;gap:8px;background:rgba(0,201,232,.1);border:1.5px solid var(--cyan);border-radius:99px;padding:12px 24px;color:var(--cyan);font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:all .15s; }
        .btn:hover { background:rgba(0,201,232,.18); }
        .btn-ghost { background:none;border:none;color:var(--dim);font-family:inherit;font-size:14px;cursor:pointer;text-decoration:underline;text-underline-offset:3px; }
        .btn-ghost:hover { color:var(--cyan); }
        .divider { border:none;border-top:1px solid var(--border);margin:0; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 32px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 10 }}>
          The Wall
        </p>
        <h1 className="lora" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, color: '#eef2fa', lineHeight: 1.2, marginBottom: 14 }}>
          Words people chose to leave behind.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--dim)', marginBottom: 28, maxWidth: 520 }}>
          Everything here was shared voluntarily. Someone typed it, felt heard, and decided it might help someone else. That's all this is.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setShowShare(true)}>
            Add yours to the wall
          </button>
          <span style={{ fontSize: 13, color: 'var(--dimmer)' }}>
            Or just read — no account needed
          </span>
        </div>
      </div>

      <hr className="divider" />

      {/* Wall feed */}
      <WallFeed onShare={() => setShowShare(true)} />

      {/* Share modal */}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </main>
  );
}

// ─── Share Modal ─────────────────────────────────────────────────────────────
function ShareModal({ onClose }: { onClose: () => void }) {
  const [text, setText]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await fetch('/api/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // confession = transformation = same text — user wrote what they want to share
        body: JSON.stringify({ confession: text.trim(), transformation: text.trim(), isAnonymous: true }),
      });
      setDone(true);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0f1119', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>✓</p>
            <h2 className="lora" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#eef2fa', marginBottom: 10 }}>It's on the wall.</h2>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 24 }}>Anonymous. No name. Just your words, for whoever needs them next.</p>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2 className="lora" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#eef2fa', marginBottom: 8 }}>
              Share something with the wall
            </h2>
            <p style={{ fontSize: 13, color: 'var(--dimmer)', marginBottom: 20, lineHeight: 1.65 }}>
              Something you went through. Something you learned. Something you wish someone had said to you.<br />
              Posted anonymously. No name. No account. You can close this tab and it won't follow you.
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type whatever you want to leave here..."
              autoFocus
              style={{
                width: '100%', minHeight: 130, background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 12,
                padding: '14px 16px', fontSize: 15, lineHeight: 1.7,
                color: '#d8e0ee', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 12, color: 'var(--dimmer)', margin: '8px 0 20px' }}>
              ✓ Anonymous · ✓ No account needed · ✓ Your name never appears
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn" onClick={submit} disabled={!text.trim() || saving}
                style={{ opacity: text.trim() && !saving ? 1 : .4 }}>
                {saving ? 'Posting...' : 'Post to wall'}
              </button>
              <button className="btn-ghost" onClick={onClose}>Cancel — keep it to myself</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
