'use client';

import { useState } from 'react';
import { WallFeed } from '@/components/wall/FiftyFiftyWall';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';

export default function WallPage() {
  const [showShare, setShowShare] = useState(false);
  const { t, language } = useI18n();

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
        .amt-chip { background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.12);border-radius:99px;padding:8px 16px;color:#d8e0ee;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s; }
        .amt-chip:hover { border-color:var(--cyan);color:var(--cyan); }
        .amt-chip.active { background:rgba(0,201,232,.14);border-color:var(--cyan);color:var(--cyan); }
      `}</style>

      {/* Guardian access banner */}
      <div style={{ borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(90deg,rgba(0,201,232,.06),rgba(124,92,191,.06))' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: '#aeb8cc', lineHeight: 1.5 }}>
            {language === 'es'
              ? 'El Guardián está despierto ahora mismo — anónimo, sin juicio, sin memoria.'
              : 'The Guardian is awake right now — anonymous, no judgment, no memory.'}
          </span>
          <Link href="/guardian" className="btn" style={{ padding: '8px 18px', fontSize: 13 }}>
            {language === 'es' ? 'Habla con el Guardián' : 'Talk to the Guardian'}
          </Link>
        </div>
      </div>

      {/* Donation block */}
      <DonateBlock />

      <hr className="divider" />

      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '52px 24px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Image src="/assets/dual-flame-logo.png" alt="" width={24} height={24}
            style={{ objectFit: 'contain', opacity: .7 }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em',
            color: 'var(--dim)', textTransform: 'uppercase' }}>
            {language === 'es' ? 'El Muro' : 'The Wall'}
          </span>
        </div>
        <h1 className="lora" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400,
          color: '#eef2fa', lineHeight: 1.2, marginBottom: 14 }}>
          {language === 'es'
            ? 'Palabras que la gente eligió dejar atrás.'
            : 'Words people chose to leave behind.'}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--dim)', marginBottom: 28, maxWidth: 520 }}>
          {language === 'es'
            ? 'Alguien lo escribió. Se sintió escuchado. Decidió que podría ayudar a la próxima persona. Eso es todo. Léelo. O añade el tuyo.'
            : 'Someone typed it. Felt heard. Decided it might help the next person. That\'s all this is. Read it. Or add yours.'}
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setShowShare(true)}>
            {language === 'es' ? 'Deja algo en el muro' : 'Leave something on the wall'}
          </button>
          <Link href="/guardian" style={{ fontSize: 13, color: 'var(--dimmer)', textDecoration: 'none' }}>
            {language === 'es' ? 'O habla con el Guardián primero →' : 'Or talk to Guardian first →'}
          </Link>
        </div>
      </div>

      <hr className="divider" />
      <WallFeed onShare={() => setShowShare(true)} />

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </main>
  );
}

// Donate Block
function DonateBlock() {
  const { language } = useI18n();
  const es = language === 'es';
  const [amount, setAmount] = useState<string>('');
  const [recurring, setRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [3, 9, 36];

  const donate = async () => {
    const dollars = Number(amount);
    if (!dollars || dollars < 1) {
      setError(es ? 'Ingresa una cantidad.' : 'Enter an amount.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: dollars, recurring }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || (es ? 'Algo salió mal.' : 'Something went wrong.'));
        setLoading(false);
      }
    } catch {
      setError(es ? 'Algo salió mal.' : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px 24px' }}>
      <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '22px 22px 24px' }}>
        <p className="lora" style={{ fontSize: '1.15rem', fontWeight: 400, color: '#eef2fa',
          marginBottom: 6, lineHeight: 1.4 }}>
          {es ? 'Mantén esto encendido.' : 'Keep this flame lit.'}
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.65, marginBottom: 18 }}>
          {es
            ? 'RYVYNN es gratis y anónimo — y siempre lo será. Las donaciones cubren los servidores y mantienen al Guardián despierto para la próxima persona en crisis.'
            : 'RYVYNN is free and anonymous — and always will be. Donations cover the servers and keep the Guardian awake for the next person in crisis.'}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {presets.map((p) => (
            <button key={p}
              className={`amt-chip${Number(amount) === p ? ' active' : ''}`}
              onClick={() => { setAmount(String(p)); setError(null); }}>
              ${p}
            </button>
          ))}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.12)',
            borderRadius: 99, padding: '6px 14px' }}>
            <span style={{ color: 'var(--dim)', fontSize: 14 }}>$</span>
            <input
              type="number" min="1" inputMode="decimal"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              placeholder={es ? 'otra' : 'other'}
              style={{ width: 64, background: 'none', border: 'none', outline: 'none',
                color: '#d8e0ee', fontSize: 14, fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18,
          cursor: 'pointer', userSelect: 'none' }}>
          <span onClick={() => setRecurring(!recurring)} style={{
            width: 38, height: 22, borderRadius: 99, flexShrink: 0,
            background: recurring ? 'var(--cyan)' : 'rgba(255,255,255,.14)',
            position: 'relative', transition: 'background .15s' }}>
            <span style={{ position: 'absolute', top: 2, left: recurring ? 18 : 2,
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left .15s' }} />
          </span>
          <span style={{ fontSize: 13.5, color: recurring ? '#d8e0ee' : 'var(--dim)' }}>
            {es ? 'Donar cada mes' : 'Give monthly'}
          </span>
        </label>

        {error && (
          <p style={{ fontSize: 13, color: '#e8a0a0', marginBottom: 12 }}>{error}</p>
        )}

        <button className="btn" onClick={donate} disabled={loading}
          style={{ opacity: loading ? .55 : 1 }}>
          {loading
            ? (es ? 'Abriendo...' : 'Opening...')
            : recurring
              ? (es ? `Donar $${amount || '—'}/mes` : `Donate $${amount || '—'}/mo`)
              : (es ? `Donar $${amount || '—'}` : `Donate $${amount || '—'}`)}
        </button>
        <p style={{ fontSize: 11.5, color: 'var(--dimmer)', marginTop: 12 }}>
          {es
            ? '🔒 Pago seguro vía Stripe · Cancela cuando quieras'
            : '🔒 Secure payment via Stripe · Cancel anytime'}
        </p>
      </div>
    </div>
  );
}

// Share Modal
function ShareModal({ onClose }: { onClose: () => void }) {
  const [text, setText]   = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<'done' | 'blocked' | null>(null);
  const { language } = useI18n();

  const submit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confession: text.trim(), transformation: text.trim(), isAnonymous: true }),
      });
      const data = await res.json();
      setResult(data.blocked ? 'blocked' : 'done');
    } catch { setSaving(false); }
  };

  const es = language === 'es';

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(10px)', zIndex: 50, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0f1119', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 20, padding: '32px 28px', maxWidth: 520, width: '100%' }}>

        {result === 'done' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✓</p>
            <h2 className="lora" style={{ fontSize: '1.5rem', fontWeight: 400,
              color: '#eef2fa', marginBottom: 10 }}>
              {es ? 'Está en el muro.' : 'It\'s on the wall.'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 24, lineHeight: 1.7 }}>
              {es
                ? 'Anónimo. Sin nombre. Solo tus palabras, para quien las necesite después.'
                : 'Anonymous. No name. Just your words, for whoever needs them next.'}
            </p>
            <button className="btn" onClick={onClose}>{es ? 'Listo' : 'Done'}</button>
          </div>
        )}

        {result === 'blocked' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🛡</p>
            <h2 className="lora" style={{ fontSize: '1.4rem', fontWeight: 400,
              color: '#eef2fa', marginBottom: 10 }}>
              {es ? 'Este queda contigo.' : 'This one stays with you.'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 8, lineHeight: 1.7 }}>
              {es
                ? 'Se guarda en privado. Algunas cosas son demasiado crudas para el muro ahora — y está bien.'
                : 'It\'s saved privately. Some things are too raw for the wall right now — and that\'s okay.'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--dimmer)', marginBottom: 24 }}>
              {es
                ? 'Si estás luchando, el Guardián está aquí. O envía un texto al 988.'
                : 'If you\'re struggling, Guardian is here. Or text 988.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/guardian" className="btn" onClick={onClose}>
                {es ? 'Habla con el Guardián' : 'Talk to Guardian'}
              </Link>
              <button className="btn-ghost" onClick={onClose}>{es ? 'Cerrar' : 'Close'}</button>
            </div>
          </div>
        )}

        {!result && (
          <>
            <h2 className="lora" style={{ fontSize: '1.4rem', fontWeight: 400,
              color: '#eef2fa', marginBottom: 8 }}>
              {es
                ? '¿Guardarlo para ti — o dejar que ayude a alguien más?'
                : 'Keep this with you — or let it help someone else?'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--dimmer)', lineHeight: 1.65, marginBottom: 20 }}>
              {es
                ? 'Di lo que has estado cargando. Anónimo. Sin nombre. Sin cuenta. Tú decides si queda privado o va al muro.'
                : 'Say what you\'ve been carrying. Anonymous. No name. No account. You decide if it stays private or goes on the wall.'}
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={es ? 'Escribe lo que quieras dejar aquí...' : 'Type whatever you want to leave here...'}
              autoFocus
              style={{ width: '100%', minHeight: 130, background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 12,
                padding: '14px 16px', fontSize: 15, lineHeight: 1.7, color: '#d8e0ee',
                fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 12, color: 'var(--dimmer)', margin: '8px 0 20px' }}>
              {es
                ? '✓ Anónimo · ✓ Sin cuenta · ✓ Tú eliges qué pasa'
                : '✓ Anonymous · ✓ No account · ✓ You choose what happens'}
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn" onClick={submit}
                disabled={!text.trim() || saving}
                style={{ opacity: text.trim() && !saving ? 1 : .38 }}>
                {saving
                  ? (es ? 'Publicando...' : 'Posting...')
                  : (es ? 'Compartir en el muro' : 'Share to the wall')}
              </button>
              <button className="btn-ghost" onClick={onClose}>
                {es ? 'Guardarlo para mí' : 'Keep it to myself'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
