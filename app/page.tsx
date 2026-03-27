'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/contexts/I18nContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompareRow { featureKey: string; r: boolean; a: boolean; b: boolean; c: boolean; }

const COMPARE: CompareRow[] = [
  { featureKey: 'hpCompareF1', r: false, a: true,  b: true,  c: true  },
  { featureKey: 'hpCompareF2', r: false, a: true,  b: false, c: true  },
  { featureKey: 'hpCompareF3', r: true,  a: false, b: false, c: false },
  { featureKey: 'hpCompareF4', r: true,  a: false, b: false, c: false },
  { featureKey: 'hpCompareF5', r: true,  a: false, b: false, c: true  },
  { featureKey: 'hpCompareF6', r: false, a: true,  b: true,  c: true  },
  { featureKey: 'hpCompareF7', r: true,  a: false, b: false, c: false },
  { featureKey: 'hpCompareF8', r: true,  a: false, b: false, c: false },
];

// FIX: Demo calls internal API — NOT Anthropic directly
async function getRYVYNNDemoResponse(msg: string): Promise<string | null> {
  try {
    const res = await fetch('/api/guardian/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.response ?? null;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const { t, language } = useI18n();

  const [demoMsg, setDemoMsg]     = useState('');
  const [demoReply, setDemoReply] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [chatStep, setChatStep]   = useState(0);
  const [confIdx, setConfIdx]     = useState(0);
  const [confBlur, setConfBlur]   = useState(true);
  const demoRef = useRef<HTMLDivElement>(null);

  const CONF_KEYS = ['hpConf1','hpConf2','hpConf3','hpConf4','hpConf5','hpConf6'] as const;
  const TRUST_KEYS = ['hpTrust1','hpTrust2','hpTrust3','hpTrust4','hpTrust5','hpTrust6','hpTrust7'] as const;
  const PRIV_KEYS = ['hpPriv1','hpPriv2','hpPriv3','hpPriv4','hpPriv5','hpPriv6'] as const;
  const WHO_KEYS  = ['hpWho1','hpWho2','hpWho3','hpWho4','hpWho5','hpWho6','hpWho7','hpWho8'] as const;
  const PREV_KEYS = ['hpPrev1','hpPrev2','hpPrev3'] as const;

  useEffect(() => {
    const timer = setTimeout(() => setShowFloat(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ts = [
      setTimeout(() => setChatStep(1), 900),
      setTimeout(() => setChatStep(2), 2500),
      setTimeout(() => setChatStep(3), 4200),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setConfIdx(i => (i + 1) % CONF_KEYS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // Reset blur when language changes so preview re-blurs
  useEffect(() => { setConfBlur(true); }, [language]);

  const handleDemo = async () => {
    if (!demoMsg.trim() || loading) return;
    setLoading(true);
    setDemoReply(null);
    const reply = await getRYVYNNDemoResponse(demoMsg);
    setDemoReply(reply ?? "I'm right here. This space is completely yours — take a breath and say what you need to say.");
    setLoading(false);
  };

  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="min-h-screen bg-[#06080f] text-[#dde4f0] overflow-x-hidden font-sans">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .ryvynn-landing { font-family: 'Jost', sans-serif; }
        .rv-serif { font-family: 'Cormorant Garamond', serif; }
        @keyframes rv-breathe  { 0%,100%{transform:scale(1);opacity:.14} 50%{transform:scale(1.3);opacity:.26} }
        @keyframes rv-fadeup   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rv-fadein   { from{opacity:0} to{opacity:1} }
        @keyframes rv-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(0,217,255,.45)} 60%{box-shadow:0 0 0 18px rgba(0,217,255,0)} }
        @keyframes rv-floatin  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rv-blink    { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes rv-glow     { 0%,100%{text-shadow:0 0 20px rgba(0,217,255,.4)} 50%{text-shadow:0 0 55px rgba(0,217,255,.95),0 0 90px rgba(139,92,246,.5)} }
        @keyframes rv-bob      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes rv-confslide { 0%{opacity:0;transform:translateY(8px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-8px)} }
        .rv-anim-breathe  { animation: rv-breathe  9s ease-in-out infinite; }
        .rv-anim-breathe2 { animation: rv-breathe 12s ease-in-out infinite reverse; }
        .rv-anim-fadeup1  { animation: rv-fadeup .7s ease forwards; opacity:0; animation-delay:.1s; }
        .rv-anim-fadeup2  { animation: rv-fadeup .8s ease forwards; opacity:0; animation-delay:.25s; }
        .rv-anim-fadeup3  { animation: rv-fadeup .8s ease forwards; opacity:0; animation-delay:.4s; }
        .rv-anim-fadeup4  { animation: rv-fadeup .8s ease forwards; opacity:0; animation-delay:.52s; }
        .rv-anim-fadeup5  { animation: rv-fadeup .8s ease forwards; opacity:0; animation-delay:.65s; }
        .rv-anim-fadeup6  { animation: rv-fadeup .8s ease forwards; opacity:0; animation-delay:.85s; }
        .rv-anim-fadein7  { animation: rv-fadein 1.2s ease forwards; opacity:0; animation-delay:1s; }
        .rv-anim-fadein   { animation: rv-fadein .5s ease forwards; }
        .rv-anim-pulse    { animation: rv-pulse 2.5s infinite; }
        .rv-anim-floatin  { animation: rv-floatin .5s ease forwards; }
        .rv-anim-bob      { animation: rv-bob 3s ease-in-out infinite; }
        .rv-anim-glow     { animation: rv-glow 4s ease-in-out infinite; }
        .rv-anim-blink0   { animation: rv-blink 1.2s ease 0s infinite; }
        .rv-anim-blink1   { animation: rv-blink 1.2s ease .3s infinite; }
        .rv-anim-blink2   { animation: rv-blink 1.2s ease .6s infinite; }
        .rv-anim-confslide { animation: rv-confslide 4s ease-in-out infinite; }
        .rv-card          { background:rgba(255,255,255,0.04); border:1px solid rgba(0,217,255,0.13); border-radius:20px; padding:28px 24px; }
        .rv-card:hover    { border-color:rgba(0,217,255,0.38); transition:border-color .2s; }
        .rv-tag           { display:inline-block; background:rgba(0,217,255,0.09); border:1px solid rgba(0,217,255,0.2); color:#00D9FF; border-radius:99px; padding:4px 14px; font-size:11px; letter-spacing:.12em; font-weight:600; text-transform:uppercase; margin-bottom:18px; }
        .rv-cta           { display:inline-block; background:linear-gradient(135deg,rgba(0,217,255,0.15),rgba(139,92,246,0.15)); border:1.5px solid #00D9FF; border-radius:99px; padding:13px 28px; color:#00D9FF; font-family:'Jost',sans-serif; font-weight:600; font-size:14px; cursor:pointer; text-decoration:none; letter-spacing:.04em; box-shadow:0 0 20px rgba(0,217,255,0.2); transition:all .18s; }
        .rv-cta:hover     { background:rgba(0,217,255,0.22); transform:scale(1.02); }
        .rv-cta-big       { padding:20px 48px; font-size:18px; }
        .rv-cta-xl        { padding:22px 56px; font-size:20px; }
        .rv-section       { max-width:1080px; margin:0 auto; padding:90px 24px; }
        .rv-float-btn:hover { transform:scale(1.05); box-shadow:0 0 32px rgba(0,217,255,.55)!important; }
        .rv-blur-text { filter:blur(7px); user-select:none; transition:filter .3s; }
        .rv-blur-text.revealed { filter:blur(0); }
        .rv-price-card { background:rgba(255,255,255,0.04); border-radius:24px; padding:32px 28px; transition:all .2s; }
        .rv-price-card:hover { transform:translateY(-4px); }
      `}</style>

      <div className="ryvynn-landing">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
          <div className="absolute inset-0 rv-anim-breathe pointer-events-none"
            style={{ background:'radial-gradient(ellipse 75% 75% at 50% 50%,rgba(0,217,255,0.07) 0%,rgba(139,92,246,0.04) 45%,transparent 70%)' }} />
          <div className="absolute inset-0 rv-anim-breathe2 pointer-events-none"
            style={{ background:'radial-gradient(ellipse 40% 40% at 50% 80%,rgba(139,92,246,0.06) 0%,transparent 60%)' }} />

          <div className="rv-tag rv-anim-fadeup1">{t('hpTagPill')}</div>

          <div className="rv-anim-fadeup2 mb-6">
            <Image src="/assets/dual-flame-logo.png" alt="RYVYNN Dual Flame" width={120} height={120}
              className="object-contain drop-shadow-[0_0_40px_rgba(0,217,255,0.4)] rv-anim-bob" />
          </div>

          <h1 className="rv-serif font-light tracking-wide leading-tight text-white mb-5 rv-anim-fadeup2"
            style={{ fontSize:'clamp(3rem,8.5vw,7.5rem)' }}>
            {t('hpH1Line1')}<br />
            <span className="text-ryvynn-cyan rv-anim-glow">{t('hpH1Line2')}</span><br />
            {t('hpH1Line3')}
          </h1>

          <p className="font-light leading-relaxed mb-2 rv-anim-fadeup3 max-w-xl"
            style={{ fontSize:'clamp(.95rem,2.2vw,1.25rem)', color:'#7a8499' }}>
            {t('hpHeroSub1')}<br />
            <em className="text-[#dde4f0]">{t('hpHeroSub2')}</em><br />
            {t('hpHeroSub3')}
          </p>

          <p className="text-sm italic mb-7 rv-anim-fadeup4" style={{ color:'#7a8499' }}>
            {t('hpHeroSub4')}
          </p>

          {/* Chat preview */}
          <div className="w-full max-w-lg rv-anim-fadeup5 mb-8 text-left rounded-2xl p-5"
            style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(0,217,255,0.13)' }}>
            {chatStep >= 1 && (
              <div className="rv-anim-fadein mb-3">
                <div className="text-[10px] tracking-widest mb-1" style={{ color:'#7a8499' }}>{t('hpChatYou')}</div>
                <div className="text-sm leading-relaxed px-4 py-2 rounded-[16px_16px_4px_16px]"
                  style={{ background:'rgba(139,92,246,0.18)', border:'1px solid rgba(139,92,246,0.28)', color:'#dde4f0' }}>
                  {t('hpChatUserMsg')}
                </div>
              </div>
            )}
            {chatStep >= 2 && (
              <div className="rv-anim-fadein mb-2">
                <div className="text-[10px] tracking-widest mb-1 text-ryvynn-cyan">{t('hpChatRyvynn')}</div>
                <div className="text-sm leading-relaxed px-4 py-2 rounded-[16px_16px_16px_4px]"
                  style={{ background:'rgba(0,217,255,0.07)', border:'1px solid rgba(0,217,255,0.15)', color:'#dde4f0' }}>
                  {t('hpChatReply1')}
                </div>
              </div>
            )}
            {chatStep >= 3 && (
              <div className="rv-anim-fadein mt-2">
                <div className="text-sm leading-relaxed px-4 py-2 rounded-[4px_16px_16px_16px]"
                  style={{ background:'rgba(0,217,255,0.07)', border:'1px solid rgba(0,217,255,0.15)', color:'#dde4f0' }}>
                  {t('hpChatReply2')}
                </div>
              </div>
            )}
            {chatStep < 3 && (
              <div className="flex gap-1 mt-2">
                {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full bg-ryvynn-cyan rv-anim-blink${i}`} />)}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 rv-anim-fadeup6">
            <Link href="/guardian" className="rv-cta rv-cta-big rv-anim-pulse">{t('hpCtaMain')}</Link>
            <button onClick={scrollToDemo} className="bg-transparent border-none text-sm cursor-pointer underline decoration-dotted"
              style={{ color:'#7a8499', fontFamily:"'Jost',sans-serif" }}>
              {t('hpCtaScroll')}
            </button>
          </div>

          <div className="rv-anim-fadein7 mt-7 px-5 py-3 rounded-xl text-sm max-w-lg"
            style={{ background:'rgba(255,77,77,0.07)', border:'1px solid rgba(255,77,77,0.2)', color:'#ffaaaa' }}>
            🆘 {t('hpCrisisBar')}{' '}
            <a href="tel:988" className="font-bold">{t('hpCrisisLink')}</a> — free, 24/7.
            <span className="block mt-1 opacity-70">{t('hpCrisisBarSub')}</span>
          </div>
        </section>

        {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
        <div style={{ borderTop:'1px solid rgba(0,217,255,0.13)', borderBottom:'1px solid rgba(0,217,255,0.13)', background:'rgba(255,255,255,0.01)', padding:'16px 24px' }}>
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-7 gap-y-2">
            {TRUST_KEYS.map(k => (
              <span key={k} className="text-xs tracking-wider" style={{ color:'#7a8499' }}>{t(k)}</span>
            ))}
          </div>
        </div>

        {/* ── LIVE DEMO ─────────────────────────────────────────────────────── */}
        <div ref={demoRef} className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">{t('hpDemoTag')}</div>
            <h2 className="rv-serif font-normal text-white mb-4" style={{ fontSize:'clamp(2rem,4vw,3.5rem)', lineHeight:1.2 }}>
              {t('hpDemoH2a')}<br /><span className="text-ryvynn-cyan">{t('hpDemoH2b')}</span>
            </h2>
            <p className="max-w-lg mx-auto leading-relaxed text-[15px]" style={{ color:'#7a8499' }}>
              {t('hpDemoSub')}{' '}<strong className="text-[#dde4f0]">{t('hpDemoSubBold')}</strong>
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rv-card" style={{ borderColor: demoMsg ? 'rgba(0,217,255,0.3)' : 'rgba(0,217,255,0.13)', transition:'border-color .3s' }}>
              <textarea value={demoMsg} onChange={e => setDemoMsg(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleDemo(); } }}
                placeholder={t('hpDemoPlaceholder')}
                className="w-full bg-transparent border-none outline-none resize-none leading-relaxed text-base text-[#dde4f0]"
                style={{ minHeight:110, fontFamily:"'Jost',sans-serif" }} />
              <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop:'1px solid rgba(0,217,255,0.13)' }}>
                <span className="text-xs italic" style={{ color:'#7a8499' }}>{t('hpDemoHint')}</span>
                <button onClick={handleDemo} disabled={loading || !demoMsg.trim()} className="rv-cta"
                  style={{ opacity: loading || !demoMsg.trim() ? .45 : 1, animation: demoMsg.trim() && !loading ? 'rv-pulse 2s infinite' : 'none' }}>
                  {loading ? t('hpDemoBtnLoading') : t('hpDemoBtn')}
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center mt-7 italic" style={{ color:'#7a8499' }}>
                <div className="flex justify-center gap-2 mb-2">
                  {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full bg-ryvynn-cyan rv-anim-blink${i}`} />)}
                </div>
                {language === 'es' ? 'Aquí estoy contigo...' : "I'm right here with you..."}
              </div>
            )}

            {demoReply && !loading && (
              <div className="mt-6 rv-card rv-anim-fadein" style={{ borderColor:'rgba(0,217,255,0.35)' }}>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-widest text-ryvynn-cyan">
                  <Image src="/assets/dual-flame-logo.png" alt="" width={16} height={16} className="inline" />
                  RYVYNN
                  <span className="font-light text-xs" style={{ color:'#7a8499' }}>{t('hpDemoSessionNote')}</span>
                </div>
                <div className="text-[15px] leading-[1.9] whitespace-pre-wrap text-[#dde4f0]">{demoReply}</div>
                <div className="flex gap-3 flex-wrap mt-5 pt-4" style={{ borderTop:'1px solid rgba(0,217,255,0.13)' }}>
                  <Link href="/guardian" className="rv-cta rv-anim-pulse">{t('hpDemoContinueBtn')}</Link>
                  <button onClick={() => { setDemoMsg(''); setDemoReply(null); }}
                    className="rounded-full px-5 py-2 text-sm cursor-pointer"
                    style={{ background:'none', border:'1px solid rgba(0,217,255,0.13)', color:'#7a8499', fontFamily:"'Jost',sans-serif" }}>
                    {t('hpDemoRestartBtn')}
                  </button>
                </div>
                <p className="mt-3 text-xs italic" style={{ color:'#7a8499' }}>{t('hpDemoPrivacyNote')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── SOCIAL PROOF ──────────────────────────────────────────────────── */}
        <div style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-12">
              <div className="rv-tag">{t('hpProofTag')}</div>
              <h2 className="rv-serif font-normal text-white" style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', lineHeight:1.2 }}>
                {t('hpProofH2')}
              </h2>
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))' }}>
              {([['hpQ1','hpQ1time','hpQ1tag'],['hpQ2','hpQ2time','hpQ2tag'],['hpQ3','hpQ3time','hpQ3tag'],['hpQ4','hpQ4time','hpQ4tag']] as const).map(([qk,tk,ak], i) => (
                <div key={i} className="rv-card relative" style={{ borderLeft:'3px solid rgba(0,217,255,0.3)' }}>
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full"
                    style={{ color:'#7a8499', background:'rgba(0,0,0,.4)' }}>{t(tk)}</span>
                  <p className="text-sm italic leading-relaxed mb-3 text-[#dde4f0]">&ldquo;{t(qk)}&rdquo;</p>
                  <span className="text-xs" style={{ color:'#7a8499' }}>— {t(ak)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONFESSION WALL TEASER ────────────────────────────────────────── */}
        <div className="rv-section text-center">
          <div className="rv-tag">{t('hpWallTag')}</div>
          <h2 className="rv-serif font-normal text-white mb-4" style={{ fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.2 }}>
            {t('hpWallH2')}
          </h2>
          <p className="max-w-lg mx-auto text-[15px] mb-10" style={{ color:'#7a8499' }}>{t('hpWallSub')}</p>

          <div className="max-w-xl mx-auto mb-8 rounded-2xl p-8 relative overflow-hidden"
            style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.2)' }}>
            <div className="text-3xl mb-4 text-ryvynn-purple opacity-40">&ldquo;</div>
            <p key={confIdx} className="rv-anim-confslide text-lg italic leading-relaxed text-[#dde4f0] rv-serif">
              {t(CONF_KEYS[confIdx])}
            </p>
            <div className="mt-4 text-xs" style={{ color:'#7a8499' }}>{t('hpWallConfAnon')}</div>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="grid gap-3">
              {PREV_KEYS.map((k, i) => (
                <div key={i} className="rounded-xl px-5 py-4 text-left"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <span className={`text-sm text-[#dde4f0] rv-blur-text ${confBlur ? '' : 'revealed'}`}>
                    {t(k)}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setConfBlur(false)} className="mt-5 rv-cta"
              style={{ borderColor:'rgba(139,92,246,0.6)', color:'#8B5CF6', boxShadow:'0 0 20px rgba(139,92,246,0.15)' }}>
              {t('hpWallRevealBtn')}
            </button>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/wall" className="rv-cta" style={{ borderColor:'rgba(139,92,246,0.5)', color:'#8B5CF6' }}>
              {t('hpWallReadBtn')}
            </Link>
            <Link href="/guardian" className="rv-cta rv-anim-pulse">{t('hpWallShareBtn')}</Link>
          </div>
        </div>

        {/* ── VOID FILLER ───────────────────────────────────────────────────── */}
        <div style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section text-center">
            <h2 className="rv-serif font-normal text-white mb-9" style={{ fontSize:'clamp(2rem,4.5vw,3.5rem)', lineHeight:1.2 }}>
              {t('hpVoidH2a')}<br /><span className="text-ryvynn-cyan">{t('hpVoidH2b')}</span>
            </h2>
            <div className="max-w-2xl mx-auto flex flex-col gap-5">
              <p className="font-light text-center leading-[1.9] text-base" style={{ color:'#7a8499' }}>{t('hpVoidP1')}</p>
              <p className="font-light text-center leading-[1.9] text-base" style={{ color:'#7a8499' }}>{t('hpVoidP2')}</p>
              <p className="font-medium text-left pl-5 leading-[1.9] text-base text-[#dde4f0]" style={{ borderLeft:'3px solid #8B5CF6' }}>{t('hpVoidP3')}</p>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div className="rv-section">
          <div className="text-center mb-14">
            <div className="rv-tag">{t('hpStepsTag')}</div>
            <h2 className="rv-serif font-normal text-white" style={{ fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.2 }}>{t('hpStepsH2')}</h2>
          </div>
          <div className="grid gap-7" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>
            {([['hpStep1n','hpStep1title','hpStep1desc'],['hpStep2n','hpStep2title','hpStep2desc'],['hpStep3n','hpStep3title','hpStep3desc']] as const).map(([nk,tk,dk], i) => (
              <div key={i} className="rv-card relative overflow-hidden">
                <span className="absolute rv-serif font-bold leading-none select-none right-4"
                  style={{ fontSize:'4rem', color:'rgba(0,217,255,0.07)', top:'-8px' }}>{t(nk)}</span>
                <div className="text-xs font-semibold tracking-widest mb-3 text-ryvynn-cyan">STEP {t(nk)}</div>
                <h3 className="text-white font-medium text-lg mb-3">{t(tk)}</h3>
                <p className="text-sm leading-relaxed" style={{ color:'#7a8499' }}>{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOOLS ─────────────────────────────────────────────────────────── */}
        <div style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-14">
              <div className="rv-tag">{t('hpToolsTag')}</div>
              <h2 className="rv-serif font-normal text-white" style={{ fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.2 }}>
                {t('hpToolsH2a')}<br /><span className="text-ryvynn-cyan">{t('hpToolsH2b')}</span>
              </h2>
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))' }}>
              {(['⚡','🔒','🎯','🌙','🪙','🔮'] as const).map((icon, i) => {
                const n = i + 1;
                return (
                  <div key={i} className="rv-card">
                    <div className="text-3xl mb-4">{icon}</div>
                    <h3 className="text-white font-semibold text-base mb-2">{t(`hpTool${n}title` as any)}</h3>
                    <p className="text-sm leading-relaxed" style={{ color:'#7a8499' }}>{t(`hpTool${n}desc` as any)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PRIVACY ───────────────────────────────────────────────────────── */}
        <div style={{ background:'linear-gradient(135deg,rgba(0,217,255,0.05) 0%,rgba(139,92,246,0.05) 100%)', borderTop:'1px solid rgba(0,217,255,0.13)', borderBottom:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section text-center">
            <div className="rv-tag">{t('hpPrivacyTag')}</div>
            <h2 className="rv-serif font-normal text-white mb-10" style={{ fontSize:'clamp(2.2rem,5vw,4.5rem)', lineHeight:1.2 }}>
              {t('hpPrivacyH2a')}<br />
              <span style={{ textDecoration:'underline', textDecorationColor:'#ff4d4d', textUnderlineOffset:10 }}>{t('hpPrivacyH2b')}</span>
            </h2>
            <div className="grid gap-4 max-w-3xl mx-auto mb-12" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))' }}>
              {PRIV_KEYS.map(k => (
                <div key={k} className="text-sm text-[#dde4f0] px-4 py-3 rounded-2xl"
                  style={{ background:'rgba(0,0,0,.35)', border:'1px solid rgba(0,217,255,.1)' }}>
                  <span className="text-ryvynn-cyan mr-2">✓</span>{t(k)}
                </div>
              ))}
            </div>
            <p className="max-w-xl mx-auto leading-relaxed text-[15px] mb-7" style={{ color:'#7a8499' }}>{t('hpPrivacyP')}</p>
            <p className="rv-serif font-light text-white leading-relaxed" style={{ fontSize:'clamp(1.5rem,3vw,2.4rem)' }}>
              {t('hpPrivacyQuote')}<br /><span className="text-ryvynn-cyan">{t('hpPrivacyQuote2')}</span>
            </p>
          </div>
        </div>

        {/* ── COMPARISON ────────────────────────────────────────────────────── */}
        <div className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">{t('hpCompareTag')}</div>
            <h2 className="rv-serif font-normal text-white" style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', lineHeight:1.2 }}>
              {t('hpCompareH2a')}<br /><span className="text-ryvynn-cyan">{t('hpCompareH2b')}</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border:'1px solid rgba(0,217,255,0.13)' }}>
            <table className="w-full" style={{ borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid rgba(0,217,255,0.13)', background:'rgba(0,217,255,0.04)' }}>
                  {(['Feature','RYVYNN','Replika','BetterHelp','Character.ai'] as const).map((h, i) => (
                    <th key={i} style={{ padding:'16px 18px', textAlign: i===0 ? 'left' : 'center',
                      color: i===1 ? '#00D9FF' : '#7a8499', fontWeight: i===1 ? 700 : 400,
                      fontSize: i===1 ? 15 : 12, whiteSpace:'nowrap', letterSpacing:'.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: i%2 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding:'13px 18px', color:'#dde4f0', fontSize:13 }}>{t(row.featureKey as any)}</td>
                    {([row.r, row.a, row.b, row.c] as boolean[]).map((val, j) => (
                      <td key={j} style={{ padding:'13px 18px', textAlign:'center', fontSize:17 }}>
                        {j===0
                          ? (val ? <span style={{ color:'#4ade80' }}>✓</span> : <span style={{ color:'#ff4d4d' }}>✗</span>)
                          : (val ? <span style={{ color:'#ff4d4d' }}>⚠</span> : <span style={{ color:'#4ade80' }}>✓</span>)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-3 text-xs" style={{ color:'#7a8499' }}>{t('hpCompareNote')}</p>
        </div>

        {/* ── THERAPY GAP ───────────────────────────────────────────────────── */}
        <div style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="grid gap-14 items-center" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))' }}>
              <div>
                <div className="rv-tag">{t('hpTherapyTag')}</div>
                <h2 className="rv-serif font-normal text-white mb-6" style={{ fontSize:'clamp(2rem,3.5vw,2.8rem)', lineHeight:1.2 }}>
                  {t('hpTherapyH2a')}<br /><span className="text-ryvynn-cyan">{t('hpTherapyH2b')}</span>
                </h2>
                <p className="leading-[1.9] text-[15px] mb-5" style={{ color:'#7a8499' }}>{t('hpTherapyP1')}</p>
                <p className="leading-[1.9] text-[15px] text-[#dde4f0]">{t('hpTherapyP2')}</p>
              </div>
              <div className="flex flex-col gap-3">
                {([['hpStat1label','hpStat1value',false],['hpStat2label','hpStat2value',false],['hpStat3label','hpStat3value',true],['hpStat4label','hpStat4value',true],['hpStat5label','hpStat5value',true]] as const).map(([lk,vk,pos], i) => (
                  <div key={i} className="rv-card flex justify-between items-center px-6 py-4">
                    <span className="text-sm" style={{ color:'#7a8499' }}>{t(lk)}</span>
                    <span className="font-semibold text-base" style={{ color: pos ? '#4ade80' : '#ff4d4d' }}>{t(vk)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── DUAL FLAME STORY ──────────────────────────────────────────────── */}
        <div className="rv-section text-center">
          <div className="mb-5 flex justify-center rv-anim-bob">
            <Image src="/assets/dual-flame-logo.png" alt="Dual Flame" width={80} height={80}
              className="object-contain drop-shadow-[0_0_40px_rgba(0,217,255,0.5)]" />
          </div>
          <div className="rv-tag">{t('hpFlameTag')}</div>
          <h2 className="rv-serif font-normal text-white mb-6" style={{ fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.2 }}>{t('hpFlameH2')}</h2>
          <div className="max-w-xl mx-auto">
            <p className="leading-[1.9] text-[15px] mb-5" style={{ color:'#7a8499' }}>{t('hpFlameP1')}</p>
            <p className="leading-[1.9] text-[15px] mb-6 text-[#dde4f0]">{t('hpFlameP2')}</p>
            <p className="rv-serif font-light italic leading-relaxed text-ryvynn-cyan" style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)' }}>
              {t('hpFlameQuote')}
            </p>
          </div>
        </div>

        {/* ── WHO ───────────────────────────────────────────────────────────── */}
        <div style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-11">
              <div className="rv-tag">{t('hpWhoTag')}</div>
              <h2 className="rv-serif font-normal text-white" style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', lineHeight:1.2 }}>{t('hpWhoH2')}</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>
              {WHO_KEYS.map(k => (
                <div key={k} className="flex gap-4 items-start py-4 px-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-ryvynn-cyan mt-0.5 flex-shrink-0">→</span>
                  <span className="text-sm leading-relaxed" style={{ color:'#7a8499' }}>{t(k)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SOUL ECONOMY ──────────────────────────────────────────────────── */}
        <div className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">{t('hpSoulTag')}</div>
            <h2 className="rv-serif font-normal text-white" style={{ fontSize:'clamp(2rem,3.5vw,2.8rem)', lineHeight:1.2 }}>{t('hpSoulH2')}</h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))' }}>
            {(['🪙','🤝','✨','📜'] as const).map((icon, i) => {
              const n = i+1;
              return (
                <div key={i} className="rv-card text-center">
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="text-white font-semibold text-base mb-2">{t(`hpSoul${n}title` as any)}</h3>
                  <p className="text-sm leading-relaxed" style={{ color:'#7a8499' }}>{t(`hpSoul${n}desc` as any)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PRICING ───────────────────────────────────────────────────────── */}
        <div style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-14">
              <div className="rv-tag">{t('hpPricingTag')}</div>
              <h2 className="rv-serif font-normal text-white mb-4" style={{ fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.2 }}>
                {t('hpPricingH2a')}<br /><span className="text-ryvynn-cyan">{t('hpPricingH2b')}</span>
              </h2>
              <p className="max-w-lg mx-auto text-[15px]" style={{ color:'#7a8499' }}>{t('hpPricingSub')}</p>
            </div>

            <div className="grid gap-5" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))' }}>
              {/* Free */}
              <div className="rv-price-card" style={{ border:'1.5px solid rgba(122,132,153,0.3)' }}>
                <div className="text-sm font-bold tracking-widest mb-1" style={{ color:'#7a8499' }}>{t('hpPricingFreeName').toUpperCase()}</div>
                <div className="text-3xl font-bold text-white mb-1">$0</div>
                <div className="text-xs mb-5" style={{ color:'#7a8499' }}>{t('hpPricingFreeSub')}</div>
                <ul className="flex flex-col gap-2 mb-7">
                  {(['hpPricingFreeF1','hpPricingFreeF2','hpPricingFreeF3','hpPricingFreeF4'] as const).map(k => (
                    <li key={k} className="flex gap-2 items-start text-sm text-[#dde4f0]">
                      <span className="mt-0.5 flex-shrink-0" style={{ color:'#7a8499' }}>✓</span>{t(k)}
                    </li>
                  ))}
                </ul>
                <Link href="/guardian" className="block text-center rounded-full py-3 text-sm font-semibold no-underline"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(122,132,153,0.3)', color:'#7a8499' }}>
                  {t('hpPricingFreeCta')}
                </Link>
              </div>

              {/* Solo */}
              <div className="rv-price-card relative" style={{ border:'1.5px solid rgba(0,217,255,0.5)', boxShadow:'0 0 40px rgba(0,217,255,0.18)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest"
                  style={{ background:'#00D9FF', color:'#06080f' }}>{t('hpPricingBadgeMostPopular')}</div>
                <div className="text-sm font-bold tracking-widest mb-1 text-ryvynn-cyan">SOLO</div>
                <div className="text-3xl font-bold text-white mb-1">$12.12</div>
                <div className="text-xs mb-5" style={{ color:'#7a8499' }}>{t('hpPricingSoloSub')}</div>
                <ul className="flex flex-col gap-2 mb-5">
                  {(['hpPricingSoloF1','hpPricingSoloF2','hpPricingSoloF3','hpPricingSoloF4','hpPricingSoloF5','hpPricingSoloF6'] as const).map(k => (
                    <li key={k} className="flex gap-2 items-start text-sm text-[#dde4f0]">
                      <span className="mt-0.5 flex-shrink-0 text-ryvynn-cyan">✓</span>{t(k)}
                    </li>
                  ))}
                </ul>
                <div className="text-xs mb-3 px-3 py-2 rounded-xl text-center"
                  style={{ background:'rgba(0,217,255,0.06)', border:'1px solid rgba(0,217,255,0.15)', color:'#00D9FF' }}>
                  {t('hpPricingFreeNote')}
                </div>
                <Link href="/pricing" className="block text-center rounded-full py-3 text-sm font-semibold no-underline"
                  style={{ background:'rgba(0,217,255,0.15)', border:'1.5px solid rgba(0,217,255,0.5)', color:'#00D9FF' }}>
                  {t('hpPricingSoloCta')}
                </Link>
              </div>

              {/* Family */}
              <div className="rv-price-card" style={{ border:'1.5px solid rgba(139,92,246,0.5)' }}>
                <div className="text-sm font-bold tracking-widest mb-1" style={{ color:'#8B5CF6' }}>FAMILY</div>
                <div className="text-3xl font-bold text-white mb-1">$36.93</div>
                <div className="text-xs mb-5" style={{ color:'#7a8499' }}>{t('hpPricingFamilySub')}</div>
                <ul className="flex flex-col gap-2 mb-7">
                  {(['hpPricingFamilyF1','hpPricingFamilyF2','hpPricingFamilyF3','hpPricingFamilyF4'] as const).map(k => (
                    <li key={k} className="flex gap-2 items-start text-sm text-[#dde4f0]">
                      <span className="mt-0.5 flex-shrink-0" style={{ color:'#8B5CF6' }}>✓</span>{t(k)}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center rounded-full py-3 text-sm font-semibold no-underline"
                  style={{ background:'rgba(139,92,246,0.08)', border:'1.5px solid rgba(139,92,246,0.5)', color:'#8B5CF6' }}>
                  {t('hpPricingFamilyCta')}
                </Link>
              </div>

              {/* Lifetime */}
              <div className="rv-price-card relative" style={{ border:'1.5px solid rgba(245,158,11,0.4)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest"
                  style={{ background:'#f59e0b', color:'#06080f' }}>{t('hpPricingBadgeFounder')}</div>
                <div className="text-sm font-bold tracking-widest mb-1" style={{ color:'#f59e0b' }}>LIFETIME</div>
                <div className="text-3xl font-bold text-white mb-1">$369.36</div>
                <div className="text-xs mb-5" style={{ color:'#7a8499' }}>{t('hpPricingLifetimeSub')}</div>
                <ul className="flex flex-col gap-2 mb-7">
                  {(['hpPricingLifetimeF1','hpPricingLifetimeF2','hpPricingLifetimeF3','hpPricingLifetimeF4'] as const).map(k => (
                    <li key={k} className="flex gap-2 items-start text-sm text-[#dde4f0]">
                      <span className="mt-0.5 flex-shrink-0" style={{ color:'#f59e0b' }}>✓</span>{t(k)}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center rounded-full py-3 text-sm font-semibold no-underline"
                  style={{ background:'rgba(245,158,11,0.08)', border:'1.5px solid rgba(245,158,11,0.4)', color:'#f59e0b' }}>
                  {t('hpPricingLifetimeCta')}
                </Link>
              </div>
            </div>

            <p className="text-center mt-8 text-xs" style={{ color:'#7a8499' }}>{t('hpPricingNote')}</p>
          </div>
        </div>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <div style={{ background:'linear-gradient(180deg,#06080f 0%,rgba(0,217,255,0.04) 50%,#06080f 100%)', borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section text-center">
            <div className="mb-5 flex justify-center rv-anim-bob">
              <Image src="/assets/dual-flame-logo.png" alt="Dual Flame" width={64} height={64}
                className="object-contain drop-shadow-[0_0_30px_rgba(0,217,255,0.5)]" />
            </div>
            <h2 className="rv-serif font-normal text-white mb-5" style={{ fontSize:'clamp(2.5rem,6vw,5.5rem)', lineHeight:1.2 }}>
              {t('hpFinalH2a')}<br /><span className="text-ryvynn-cyan">{t('hpFinalH2b')}</span><br />{t('hpFinalH2c')}
            </h2>
            <p className="max-w-md mx-auto leading-[1.85] text-base mb-3" style={{ color:'#7a8499' }}>{t('hpFinalP1')}</p>
            <p className="max-w-md mx-auto text-sm italic mb-10" style={{ color:'#7a8499' }}>{t('hpFinalP2')}</p>
            <Link href="/guardian" className="rv-cta rv-cta-xl rv-anim-pulse">{t('hpFinalCta')}</Link>
            <div className="mt-6 text-sm" style={{ color:'#7a8499' }}>
              {t('hpFinalOr')}{' '}
              <button onClick={scrollToDemo} className="bg-transparent border-none cursor-pointer underline text-ryvynn-cyan text-sm"
                style={{ fontFamily:"'Jost',sans-serif" }}>
                {t('hpFinalDemoLink')}
              </button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer className="text-center py-9 px-6" style={{ borderTop:'1px solid rgba(0,217,255,0.13)' }}>
          <div className="flex justify-center mb-3">
            <Image src="/assets/dual-flame-logo.png" alt="RYVYNN Dual Flame" width={28} height={28}
              className="object-contain opacity-60" />
          </div>
          <div className="text-sm max-w-xl mx-auto leading-[1.95]" style={{ color:'#7a8499' }}>
            <strong>RYVYNN</strong> {t('hpFooterDisclaimer')}<br />
            {t('hpFooterEmergency')}<br />
            {t('hpFooterMission')}<br />
            <span className="text-xs opacity-40">{t('hpFooterCopyright')}</span>
          </div>
        </footer>

        {/* ── FLOAT CTA ─────────────────────────────────────────────────────── */}
        {showFloat && (
          <div className="fixed bottom-6 right-6 z-50 rv-anim-floatin">
            <Link href="/guardian" className="rv-float-btn flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ryvynn-cyan no-underline rv-anim-pulse"
              style={{ background:'rgba(6,8,15,0.96)', border:'1.5px solid #00D9FF', boxShadow:'0 0 24px rgba(0,217,255,0.22)', backdropFilter:'blur(20px)', fontFamily:"'Jost',sans-serif", transition:'all .2s' }}>
              <Image src="/assets/dual-flame-logo.png" alt="" width={20} height={20} className="object-contain" />
              {t('hpFloatBtn')}
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
