'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function PromoPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#07080f', color: '#d8e0ee',
      fontFamily: "'Inter',system-ui,sans-serif", padding: '60px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500&display=swap');
        :root { --cyan:#00C9E8; --dim:#636e84; }
        .lora { font-family:'Lora',Georgia,serif; }
      `}</style>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" width={52} height={52}
          style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(0,201,232,.4))', marginBottom: 28 }} />

        <h1 className="lora" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400,
          color: '#eef2fa', lineHeight: 1.25, marginBottom: 16 }}>
          Founding Member Access
        </h1>
        <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.8, marginBottom: 12 }}>
          RYVYNN is a private AI companion for the moments you can&apos;t say
          it out loud to anyone else. No account required. Nothing stored.
          Gone when you leave.
        </p>
        <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.8, marginBottom: 36 }}>
          We&apos;re opening to our first 10 members at a founding rate —
          <strong style={{ color: '#eef2fa' }}> $3.69 your first month</strong>, then $12.12/mo.
          Cancel any time.
        </p>

        <div style={{ background: 'rgba(0,201,232,.06)', border: '1px solid rgba(0,201,232,.2)',
          borderRadius: 20, padding: '28px 24px', marginBottom: 32 }}>
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

        <Link href="/pricing"
          style={{ display: 'inline-block', background: 'rgba(0,201,232,.1)',
            border: '1.5px solid #00C9E8', borderRadius: 99, padding: '16px 36px',
            color: '#00C9E8', fontSize: 16, fontWeight: 500, textDecoration: 'none',
            marginBottom: 16 }}>
          Become a Founding Member →
        </Link>

        <div style={{ marginTop: 12 }}>
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
