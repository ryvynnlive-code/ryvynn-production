'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TOTAL_SPOTS = 10;

export default function PromoPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'exists'|'error'>('idle');
  const [spotsLeft, setSpotsLeft] = useState<number|null>(null);

  useEffect(() => {
    fetch('/api/email-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ping@count.only', source: 'count_check' }),
    })
      .then(r => r.json())
      .then(d => {
        if (typeof d.count === 'number') {
          setSpotsLeft(Math.max(0, TOTAL_SPOTS - d.count));
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'promo' }),
      });
      const data = await res.json();
      if (data.alreadySignedUp) {
        setStatus('exists');
      } else if (data.success) {
        setStatus('success');
        if (typeof data.count === 'number') setSpotsLeft(Math.max(0, TOTAL_SPOTS - data.count));
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#07080f', color: '#d8e0ee',
      fontFamily: "'Inter',system-ui,sans-serif", padding: '60px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500&display=swap');
        :root { --cyan:#00C9E8; --purple:#8B5CF6; --dim:#636e84; }
        .lora { font-family:'Lora',Georgia,serif; }
        .email-input { width:100%; background:rgba(0,201,232,.06); border:1px solid rgba(0,201,232,.2);
          border-radius:12px; padding:14px 16px; color:#eef2fa; font-size:15px; outline:none;
          box-sizing:border-box; }
        .email-input:focus { border-color:rgba(0,201,232,.5); }
        .email-input::placeholder { color:#636e84; }
        .cta-btn { display:block; width:100%; background:rgba(0,201,232,.1);
          border:1.5px solid #00C9E8; border-radius:99px; padding:16px;
          color:#00C9E8; font-size:16px; font-weight:600; cursor:pointer;
          transition:background .2s; }
        .cta-btn:hover { background:rgba(0,201,232,.18); }
        .cta-btn:disabled { opacity:.5; cursor:not-allowed; }
      `}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" width={52} height={52}
          style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(0,201,232,.4))', marginBottom: 28 }} />

        <h1 className="lora" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400,
          color: '#eef2fa', lineHeight: 1.25, marginBottom: 16 }}>
          Founding Member Access
        </h1>

        {spotsLeft !== null && (
          <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)',
            borderRadius: 99, padding: '8px 20px', display: 'inline-block', marginBottom: 20 }}>
            <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>
              {spotsLeft > 0
                ? `${spotsLeft} of ${TOTAL_SPOTS} founding spots remaining`
                : 'Founding spots filled — join the waitlist'}
            </span>
          </div>
        )}

        <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.8, marginBottom: 12 }}>
          RYVYNN is a private AI companion for the moments you can&apos;t say
          it out loud to anyone else. No account required. Nothing stored.
          Gone when you leave.
        </p>
        <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.8, marginBottom: 28 }}>
          Founding rate —{' '}
          <strong style={{ color: '#eef2fa' }}>$3.69 your first month</strong>, then $12.12/mo.
          Cancel any time.
        </p>

        {/* Features */}
        <div style={{ background: 'rgba(0,201,232,.06)', border: '1px solid rgba(0,201,232,.2)',
          borderRadius: 20, padding: '28px 24px', marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 16 }}>
            Founding member includes:
          </div>
          {[
            'Unlimited Guardian conversations',
            'Soul token economy + growing avatar',
            'Digital Eternity Vault — encrypted messages to your future',
            'Community wall access',
            'Free crisis tier — always, forever',
            'Your name in the founding acknowledgment',
          ].map(f => (
            <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '8px 0', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 14, color: '#d8e0ee' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Email capture */}
        {status === 'success' ? (
          <div style={{ background: 'rgba(0,201,232,.08)', border: '1px solid rgba(0,201,232,.3)',
            borderRadius: 16, padding: '24px', marginBottom: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔥</div>
            <p style={{ color: '#eef2fa', fontWeight: 600, margin: '0 0 6px' }}>
              You&apos;re on the list.
            </p>
            <p style={{ color: 'var(--dim)', fontSize: 13, margin: 0 }}>
              Check your email — founding rate is held for you.
            </p>
          </div>
        ) : status === 'exists' ? (
          <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)',
            borderRadius: 16, padding: '20px', marginBottom: 20 }}>
            <p style={{ color: '#a78bfa', margin: 0, fontSize: 14 }}>
              Already on the list. Check your inbox.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <input
              type="email"
              className="email-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ marginBottom: 12 }}
            />
            <button
              className="cta-btn"
              onClick={handleSubmit}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Locking your spot...' : 'Lock My Founding Rate →'}
            </button>
            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>
                Something went wrong. Try again.
              </p>
            )}
          </div>
        )}

        {/* Direct checkout */}
        <Link href="/pricing"
          style={{ display: 'inline-block', color: 'var(--cyan)', fontSize: 14,
            textDecoration: 'none', marginBottom: 12 }}>
          Skip waitlist — subscribe now →
        </Link>

        <div style={{ marginTop: 8 }}>
          <Link href="/guardian" style={{ fontSize: 14, color: 'var(--dim)' }}>
            Try it free first — no account needed
          </Link>
        </div>

        <p style={{ marginTop: 36, fontSize: 12, color: '#2a3040', lineHeight: 1.8 }}>
          Built by one person. No VC. No surveillance. No ads. Ever.<br />
          AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC
        </p>
      </div>
    </main>
  );
}
