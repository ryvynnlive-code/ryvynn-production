'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/contexts/I18nContext';

async function getDemoResponse(msg: string, language: string): Promise<string | null> {
  try {
    const res = await fetch('/api/guardian/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, language }),
    });
    if (!res.ok) throw new Error('err');
    const data = await res.json();
    return data.response ?? null;
  } catch { return null; }
}

const QUOTE_KEYS = [
  ['hpQ1','hpQ1time','hpQ1tag'],
  ['hpQ2','hpQ2time','hpQ2tag'],
  ['hpQ3','hpQ3time','hpQ3tag'],
  ['hpQ4','hpQ4time','hpQ4tag'],
] as const;

const WHO_KEYS = ['v2Who1','v2Who2','v2Who3','v2Who4','v2Who5','v2Who6'] as const;
const CONF_KEYS = ['hpConf1','hpConf2','hpConf3','hpConf4','hpConf5','hpConf6'] as const;

export default function HomePage() {
  const { t, language } = useI18n();
  const [input, setInput]   = useState('');
  const [reply, setReply]   = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [sent, setSent]     = useState(false);
  const [confIdx, setConfIdx] = useState(0);
  const [showFloat, setShowFloat] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowFloat(true), 5000);
    const t2 = setInterval(() => setConfIdx(i => (i + 1) % CONF_KEYS.length), 4500);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  const sendDemo = useCallback(async (text: string) => {
    if (!text.trim() || typing) return;
    setSent(true); setTyping(true); setReply(null);
    const r = await getDemoResponse(text.trim(), language);
    setReply(r ?? (language === 'es'
      ? 'Aquí estoy. Este espacio es completamente tuyo.'
      : "I'm right here. This space is completely yours."));
    setTyping(false);
  }, [typing, language]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDemo(input); }
  };
  const reset = () => { setInput(''); setReply(null); setSent(false); };

  const scrollToDemo = () =>
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="min-h-screen bg-[#06080f] text-[#dde4f0] overflow-x-hidden" style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .rv-serif{font-family:'Cormorant Garamond',serif}
        @keyframes rv-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rv-in{from{opacity:0}to{opacity:1}}
        @keyframes rv-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,217,255,.4)}65%{box-shadow:0 0 0 14px rgba(0,217,255,0)}}
        @keyframes rv-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes rv-blink{0%,100%{opacity:.2}50%{opacity:1}}
        @keyframes rv-slide{0%{opacity:0;transform:translateY(6px)}12%{opacity:1;transform:translateY(0)}88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
        @keyframes rv-glow{0%,100%{opacity:.9}50%{opacity:1;text-shadow:0 0 40px rgba(0,217,255,.45)}}
        @keyframes rv-float{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .rv-up1{animation:rv-up .65s ease forwards;opacity:0;animation-delay:.05s}
        .rv-up2{animation:rv-up .65s ease forwards;opacity:0;animation-delay:.18s}
        .rv-up3{animation:rv-up .65s ease forwards;opacity:0;animation-delay:.30s}
        .rv-up4{animation:rv-up .65s ease forwards;opacity:0;animation-delay:.42s}
        .rv-up5{animation:rv-up .65s ease forwards;opacity:0;animation-delay:.54s}
        .rv-in{animation:rv-in .4s ease forwards}
        .rv-bob{animation:rv-bob 3.5s ease-in-out infinite}
        .rv-slide{animation:rv-slide 4.5s ease-in-out infinite}
        .rv-glow{animation:rv-glow 3.5s ease-in-out infinite}
        .rv-pulse{animation:rv-pulse 2.2s infinite}
        .rv-float-anim{animation:rv-float .45s ease forwards}
        .rv-blink0{animation:rv-blink 1.3s ease 0s infinite}
        .rv-blink1{animation:rv-blink 1.3s ease .3s infinite}
        .rv-blink2{animation:rv-blink 1.3s ease .6s infinite}
        .rv-section{max-width:1040px;margin:0 auto;padding:80px 20px}
        .rv-tag{display:inline-block;background:rgba(0,217,255,.08);border:1px solid rgba(0,217,255,.2);color:#00D9FF;border-radius:99px;padding:4px 14px;font-size:11px;letter-spacing:.1em;font-weight:600;text-transform:uppercase;margin-bottom:16px}
        .rv-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:24px 20px;transition:border-color .2s}
        .rv-card:hover{border-color:rgba(0,217,255,.25)}
        .rv-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(0,217,255,.12);border:1.5px solid #00D9FF;border-radius:99px;padding:15px 32px;color:#00D9FF;font-family:'Jost',sans-serif;font-weight:600;font-size:16px;cursor:pointer;text-decoration:none;letter-spacing:.03em;transition:all .18s;box-shadow:0 0 24px rgba(0,217,255,.15)}
        .rv-btn:hover{background:rgba(0,217,255,.22);transform:scale(1.02)}
        .rv-ghost{display:inline-block;border:none;background:none;color:#7a8499;font-family:'Jost',sans-serif;font-size:14px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-style:dotted}
        .rv-ghost:hover{color:#dde4f0}
        .rv-check::before{content:'✓ ';color:#00D9FF;font-weight:700}
        .rv-divider{border:none;border-top:1px solid rgba(255,255,255,.06);margin:0}
        .rv-float-wrap:hover{transform:scale(1.04);box-shadow:0 0 28px rgba(0,217,255,.45)!important}
        .rv-demo-ta{background:transparent;border:none;outline:none;resize:none;width:100%;font-family:'Jost',sans-serif;font-size:16px;line-height:1.65;color:#dde4f0}
        .rv-demo-ta::placeholder{color:#3a4455}
      `}</style>

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 70% 60% at 50% 45%,rgba(0,217,255,.05) 0%,rgba(139,92,246,.03) 50%,transparent 75%)'}} />

        <div className="rv-up1 mb-5 rv-bob">
          <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" width={64} height={64}
            className="object-contain drop-shadow-[0_0_24px_rgba(0,217,255,.35)]" />
        </div>

        <h1 className="rv-up2 rv-serif font-light text-white leading-tight mb-4"
          style={{fontSize:'clamp(2.8rem,8vw,6.5rem)',letterSpacing:'-.01em'}}>
          <span className="rv-glow">{t('v2HeroH1' as any)}</span>
        </h1>

        <p className="rv-up3 font-light mb-1" style={{fontSize:'clamp(1.05rem,2.5vw,1.3rem)',color:'#9aA0b0',maxWidth:440}}>
          {t('v2HeroSub' as any)}
        </p>
        <p className="rv-up3 font-light mb-8" style={{fontSize:'clamp(1.05rem,2.5vw,1.3rem)',color:'#7a8499',maxWidth:440}}>
          {t('v2HeroSub2' as any)}
        </p>

        {/* Trust strip ABOVE the CTA */}
        <div className="rv-up4 flex flex-wrap justify-center gap-x-5 gap-y-2 mb-8 max-w-lg">
          {(['v2TrustAnon','v2TrustNoHistory','v2TrustNoTrack','v2TrustNotTherapy'] as const).map(k => (
            <span key={k} className="rv-check text-sm" style={{color:'#7a8499'}}>{t(k as any)}</span>
          ))}
        </div>

        <div className="rv-up5 flex flex-col items-center gap-3 mb-12">
          <Link href="/guardian" className="rv-btn rv-pulse">{t('v2CtaMain' as any)}</Link>
          <button className="rv-ghost" onClick={scrollToDemo}>{t('v2CtaDemo' as any)} ↓</button>
        </div>

        <div className="rv-up5 text-sm px-4 py-2.5 rounded-xl"
          style={{background:'rgba(255,60,60,.06)',border:'1px solid rgba(255,60,60,.18)',color:'#ffaaaa',maxWidth:420}}>
          🆘 {language === 'es' ? '¿En crisis? ' : 'In crisis? '}
          <a href="tel:988" className="font-bold text-white">988</a>
          {language === 'es' ? ' — gratis, 24/7' : ' — free, 24/7'}
        </div>
      </section>

      <hr className="rv-divider" />

      {/* ─── EMBEDDED DEMO ─────────────────────────────────────────────────── */}
      <section id="demo-section" style={{padding:'64px 20px'}}>
        <div style={{maxWidth:560,margin:'0 auto'}}>
          <p className="text-center text-sm mb-5 font-semibold" style={{color:'#00D9FF',letterSpacing:'.08em',textTransform:'uppercase'}}>
            {t('v2DemoLabel' as any)}
          </p>
          <div style={{background:'rgba(255,255,255,.03)',border:`1px solid ${sent ? 'rgba(0,217,255,.3)' : 'rgba(255,255,255,.09)'}`,borderRadius:20,overflow:'hidden',transition:'border-color .3s'}}>
            {!sent ? (
              <div style={{padding:20}}>
                <textarea className="rv-demo-ta" style={{minHeight:100}}
                  placeholder={t('v2DemoPlaceholder' as any)}
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
                <div className="flex justify-between items-center mt-3 pt-3" style={{borderTop:'1px solid rgba(255,255,255,.06)'}}>
                  <span className="text-xs" style={{color:'#3a4455'}}>
                    {language === 'es' ? 'Enter para enviar' : 'Enter to send'}
                  </span>
                  <button onClick={() => sendDemo(input)} disabled={!input.trim()}
                    className="rv-btn"
                    style={{padding:'10px 22px',fontSize:14,opacity:input.trim() ? 1 : .35,animation:input.trim() ? 'rv-pulse 2.2s infinite' : 'none'}}>
                    {t('v2DemoBtn' as any)}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{padding:20}}>
                <div className="mb-4">
                  <div className="text-[10px] tracking-widest mb-1.5" style={{color:'#3a4455'}}>{language === 'es' ? 'TÚ' : 'YOU'}</div>
                  <div className="text-sm leading-relaxed px-4 py-2.5 inline-block"
                    style={{background:'rgba(139,92,246,.15)',border:'1px solid rgba(139,92,246,.25)',color:'#dde4f0',borderRadius:'16px 16px 4px 16px',maxWidth:'85%'}}>
                    {input}
                  </div>
                </div>
                {typing ? (
                  <div className="flex gap-1.5 mt-2 pl-1">
                    {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full bg-ryvynn-cyan rv-blink${i}`} />)}
                  </div>
                ) : reply ? (
                  <div className="rv-in">
                    <div className="flex items-center gap-2 mb-2">
                      <Image src="/assets/dual-flame-logo.png" alt="" width={14} height={14} className="object-contain opacity-80" />
                      <span className="text-[10px] tracking-widest font-semibold" style={{color:'#00D9FF'}}>RYVYNN</span>
                    </div>
                    <div className="text-[15px] leading-[1.85] whitespace-pre-wrap text-[#dde4f0] mb-5">{reply}</div>
                    <div className="pt-4 flex gap-3 flex-wrap" style={{borderTop:'1px solid rgba(255,255,255,.06)'}}>
                      <Link href="/guardian" className="rv-btn" style={{fontSize:14,padding:'11px 22px'}}>
                        {t('v2DemoContinueBtn' as any)}
                      </Link>
                      <button onClick={reset} className="rv-ghost text-sm">{t('v2DemoRestartBtn' as any)}</button>
                    </div>
                    <p className="mt-3 text-xs italic" style={{color:'#3a4455'}}>{t('v2DemoSessionNote' as any)}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <hr className="rv-divider" />

      {/* ─── WHY IT'S SAFE ─────────────────────────────────────────────────── */}
      <section style={{background:'rgba(255,255,255,.015)'}}>
        <div className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">{t('v2SafeTag' as any)}</div>
            <h2 className="rv-serif font-normal text-white" style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',lineHeight:1.25}}>{t('v2SafeH2' as any)}</h2>
            <p className="mt-3 max-w-lg mx-auto text-base" style={{color:'#7a8499'}}>{t('v2SafeP' as any)}</p>
          </div>
          <div className="grid gap-5" style={{gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
            {([
              ['v2SafeCard1Title','v2SafeCard1Desc','🔒','rgba(0,217,255,.1)','rgba(0,217,255,.2)'],
              ['v2SafeCard2Title','v2SafeCard2Desc','🧠','rgba(139,92,246,.1)','rgba(139,92,246,.2)'],
              ['v2SafeCard3Title','v2SafeCard3Desc','💬','rgba(255,255,255,.04)','rgba(255,255,255,.1)'],
            ] as const).map(([tk,dk,icon,bg,border],i) => (
              <div key={i} className="rv-card" style={{background:bg,borderColor:border}}>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-white mb-2">{t(tk as any)}</h3>
                <p className="text-sm leading-relaxed" style={{color:'#9aA0b0'}}>{t(dk as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rv-divider" />

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <div className="rv-section">
        <div className="text-center mb-12">
          <div className="rv-tag">{t('v2HowTag' as any)}</div>
          <h2 className="rv-serif font-normal text-white" style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',lineHeight:1.25}}>{t('v2HowH2' as any)}</h2>
        </div>
        <div className="grid gap-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))'}}>
          {([['01','v2HowStep1','v2HowStep1Desc'],['02','v2HowStep2','v2HowStep2Desc'],['03','v2HowStep3','v2HowStep3Desc']] as const).map(([n,tk,dk],i) => (
            <div key={i} className="rv-card relative overflow-hidden">
              <span className="absolute right-4 rv-serif font-bold select-none" style={{fontSize:'4.5rem',lineHeight:1,color:'rgba(0,217,255,.06)',top:'-8px'}}>{n}</span>
              <div className="text-xs font-semibold tracking-widest mb-2 text-ryvynn-cyan">STEP {n}</div>
              <h3 className="font-semibold text-white text-base mb-1.5">{t(tk as any)}</h3>
              <p className="text-sm leading-relaxed" style={{color:'#7a8499'}}>{t(dk as any)}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="rv-divider" />

      {/* ─── SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <section style={{background:'rgba(255,255,255,.015)'}}>
        <div className="rv-section">
          <div className="text-center mb-10">
            <div className="rv-tag">{t('v2ProofTag' as any)}</div>
            <h2 className="rv-serif font-normal text-white" style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',lineHeight:1.25}}>{t('v2ProofH2' as any)}</h2>
          </div>
          <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))'}}>
            {QUOTE_KEYS.map(([qk,tk,ak],i) => (
              <div key={i} className="rv-card" style={{borderLeft:'3px solid rgba(0,217,255,.25)'}}>
                <span className="text-[10px] px-2 py-0.5 rounded-full float-right" style={{color:'#3a4455',background:'rgba(0,0,0,.3)'}}>{t(tk)}</span>
                <p className="text-sm italic leading-relaxed mb-2.5 text-[#dde4f0]" style={{clear:'both'}}>&ldquo;{t(qk)}&rdquo;</p>
                <span className="text-xs" style={{color:'#3a4455'}}>— {t(ak)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rv-divider" />

      {/* ─── WHO IT'S FOR ──────────────────────────────────────────────────── */}
      <div className="rv-section">
        <div className="text-center mb-10">
          <div className="rv-tag">{t('v2WhoTag' as any)}</div>
          <h2 className="rv-serif font-normal text-white" style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',lineHeight:1.25}}>{t('v2WhoH2' as any)}</h2>
        </div>
        <div className="grid max-w-2xl mx-auto" style={{gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
          {WHO_KEYS.map(k => (
            <div key={k} className="flex gap-3 items-start py-3.5 px-2" style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}>
              <span className="text-ryvynn-cyan mt-0.5 flex-shrink-0 text-sm">→</span>
              <span className="text-sm leading-relaxed" style={{color:'#9aA0b0'}}>{t(k as any)}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="rv-divider" />

      {/* ─── CONFESSION ROTATOR ────────────────────────────────────────────── */}
      <section style={{background:'rgba(139,92,246,.04)',borderTop:'1px solid rgba(139,92,246,.1)',borderBottom:'1px solid rgba(139,92,246,.1)'}}>
        <div className="rv-section text-center" style={{padding:'60px 20px'}}>
          <p className="text-xs tracking-widest font-semibold mb-6 uppercase" style={{color:'#8B5CF6'}}>
            {language === 'es' ? 'Lo que la gente guarda dentro' : 'What people carry alone'}
          </p>
          <div style={{maxWidth:520,margin:'0 auto'}}>
            <span className="text-4xl rv-serif text-ryvynn-purple opacity-30">&ldquo;</span>
            <p key={confIdx} className="rv-slide rv-serif font-light text-xl leading-relaxed text-[#dde4f0] italic mt-1 mb-4">
              {t(CONF_KEYS[confIdx])}
            </p>
            <span className="text-xs" style={{color:'#3a4455'}}>
              {language === 'es' ? '— Anónimo · compartido voluntariamente' : '— Anonymous · shared voluntarily'}
            </span>
          </div>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <Link href="/wall" className="rv-btn" style={{fontSize:14,padding:'11px 24px',borderColor:'rgba(139,92,246,.6)',color:'#8B5CF6',background:'rgba(139,92,246,.08)',boxShadow:'none'}}>
              {language === 'es' ? 'Leer el muro' : 'Read the wall'}
            </Link>
            <Link href="/guardian" className="rv-ghost" style={{fontSize:14}}>
              {language === 'es' ? 'Comparte el tuyo →' : 'Share yours →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────────────── */}
      <div className="rv-section">
        <div className="text-center mb-12">
          <div className="rv-tag">{t('v2PricingTag' as any)}</div>
          <h2 className="rv-serif font-normal text-white" style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',lineHeight:1.25}}>
            {t('v2PricingH2' as any)}<br /><span className="text-ryvynn-cyan">{t('v2PricingH2b' as any)}</span>
          </h2>
          <p className="mt-3 text-sm" style={{color:'#7a8499'}}>{t('v2PricingSub' as any)}</p>
        </div>
        <div className="grid gap-5 max-w-lg mx-auto" style={{gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))'}}>
          {/* Free */}
          <div className="rv-card text-center" style={{border:'1px solid rgba(255,255,255,.1)'}}>
            <div className="text-2xl font-bold text-white mb-1">$0</div>
            <div className="text-xs mb-4" style={{color:'#7a8499'}}>{t('v2PricingFreeSub' as any)}</div>
            <ul className="text-sm text-left space-y-2 mb-5" style={{color:'#9aA0b0',listStyle:'none',padding:0}}>
              {[t('hpPricingFreeF1'),t('hpPricingFreeF2'),t('hpPricingFreeF3')].map((f,i) => (
                <li key={i} className="rv-check">{f}</li>
              ))}
            </ul>
            <Link href="/guardian" className="block text-center text-sm font-semibold py-2.5 rounded-full no-underline"
              style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#9aA0b0'}}>
              {t('v2PricingFreeCta' as any)}
            </Link>
          </div>
          {/* Solo */}
          <div className="rv-card text-center relative" style={{border:'1.5px solid rgba(0,217,255,.45)',boxShadow:'0 0 32px rgba(0,217,255,.1)'}}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full tracking-widest"
              style={{background:'#00D9FF',color:'#06080f'}}>{t('hpPricingBadgeMostPopular')}</div>
            <div className="text-2xl font-bold text-white mb-0.5 mt-1">{t('v2PricingSoloPrice' as any)}</div>
            <div className="text-xs mb-1 text-ryvynn-cyan">{t('v2PricingSoloFirstMonth' as any)}</div>
            <div className="text-xs mb-4" style={{color:'#7a8499'}}>{language === 'es' ? '· cancela cuando quieras' : '· cancel anytime'}</div>
            <ul className="text-sm text-left space-y-2 mb-5" style={{color:'#9aA0b0',listStyle:'none',padding:0}}>
              {[t('hpPricingSoloF1'),t('hpPricingSoloF2'),t('hpPricingSoloF3')].map((f,i) => (
                <li key={i} className="rv-check">{f}</li>
              ))}
            </ul>
            <Link href="/pricing" className="block text-center text-sm font-semibold py-2.5 rounded-full no-underline"
              style={{background:'rgba(0,217,255,.14)',border:'1.5px solid rgba(0,217,255,.45)',color:'#00D9FF'}}>
              {t('v2PricingSoloCta' as any)}
            </Link>
          </div>
        </div>
        <p className="text-center mt-6 text-xs" style={{color:'#3a4455'}}>{t('v2PricingNote' as any)}</p>
        <div className="text-center mt-3">
          <Link href="/pricing" className="rv-ghost text-sm">
            {language === 'es' ? 'Ver todos los planes →' : 'View all plans →'}
          </Link>
        </div>
      </div>

      <hr className="rv-divider" />

      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{background:'linear-gradient(180deg,#06080f 0%,rgba(0,217,255,.03) 60%,#06080f 100%)'}}>
        <div className="rv-section text-center" style={{padding:'80px 20px'}}>
          <div className="mb-5 flex justify-center rv-bob">
            <Image src="/assets/dual-flame-logo.png" alt="" width={52} height={52}
              className="object-contain drop-shadow-[0_0_24px_rgba(0,217,255,.4)]" />
          </div>
          <h2 className="rv-serif font-light text-white mb-4" style={{fontSize:'clamp(2.2rem,5.5vw,4.5rem)',lineHeight:1.2}}>
            {t('v2FinalH2' as any)}
          </h2>
          <p className="mb-8 max-w-sm mx-auto leading-relaxed" style={{fontSize:15,color:'#7a8499'}}>
            {t('v2FinalSub' as any)}
          </p>
          <Link href="/guardian" className="rv-btn rv-pulse" style={{fontSize:18,padding:'18px 44px'}}>
            {t('v2FinalCta' as any)}
          </Link>
          <div className="mt-5 text-sm" style={{color:'#3a4455'}}>
            {t('v2FinalOr' as any)}{' '}
            <button className="rv-ghost text-sm" onClick={scrollToDemo}>{t('v2FinalDemoLink' as any)}</button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="text-center py-8 px-5" style={{borderTop:'1px solid rgba(255,255,255,.05)'}}>
        <div className="flex justify-center mb-3">
          <Image src="/assets/dual-flame-logo.png" alt="" width={24} height={24} className="object-contain opacity-40" />
        </div>
        <div className="text-sm max-w-lg mx-auto leading-relaxed" style={{color:'#3a4455'}}>
          {t('v2FooterLegal' as any)}<br />
          {t('v2FooterEmergency' as any)}<br />
          <span className="text-xs opacity-60">{t('v2FooterCopy' as any)}</span>
        </div>
      </footer>

      {/* ─── FLOATING CTA ──────────────────────────────────────────────────── */}
      {showFloat && (
        <div className="fixed bottom-5 right-5 z-30 rv-float-anim">
          <Link href="/guardian"
            className="rv-float-wrap flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ryvynn-cyan no-underline rv-pulse"
            style={{background:'rgba(6,8,15,.97)',border:'1.5px solid #00D9FF',boxShadow:'0 0 20px rgba(0,217,255,.2)',backdropFilter:'blur(20px)',fontFamily:"'Jost',sans-serif",transition:'all .18s'}}>
            <Image src="/assets/dual-flame-logo.png" alt="" width={18} height={18} className="object-contain" />
            {t('v2FloatBtn' as any)}
          </Link>
        </div>
      )}
    </main>
  );
}
