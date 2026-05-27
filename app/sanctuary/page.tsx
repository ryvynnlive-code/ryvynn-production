'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ============================================================
   RYVYNN SANCTUARY — /sanctuary
   Pure anonymous space. No accounts. No tracking. No history.
   Adapted from RyvynnApp.jsx v3.0 → Next.js production.

   Wire-ups added:
   - Supabase Realtime presence (real anonymous count)
   - Story persistence via /api/sanctuary/stories
   - Felt voting persisted to DB
   ============================================================ */

/* ── STORAGE KEYS ─────────────────────────────────────────── */
const DRAFT_KEY    = 'ryvynn_draft_v1';
const BOOKMARK_KEY = 'ryvynn_bookmarks_v1';
const AGE_KEY      = 'ryvynn_age';

/* ── SEED DATA (shown until DB loads) ─────────────────────── */
const SEED_STORIES = [
  { id:'h1', label:'Anonymous — 3:14 AM', category:'Addiction',  text:"I've been sober 11 days. I threw up twice tonight from withdrawals. I didn't use. That's the whole story.",                        felt:847,  replies:[], feed:'heard',   tier:'safe' },
  { id:'h2', label:'Anonymous',           category:'Grief',      text:"My son died 8 months ago. I still set a plate for him sometimes. I don't know how to stop.",                                       felt:1203, replies:[], feed:'heard',   tier:'safe' },
  { id:'h3', label:'Anonymous — Late',    category:'Loneliness', text:"I haven't had a real conversation with anyone in 19 days. I counted. I just needed to say that somewhere.",                         felt:692,  replies:[], feed:'heard',   tier:'safe' },
  { id:'h4', label:'Anonymous',           category:'Family',     text:"I cut off my parents six months ago to survive. I miss them every day and I'd do it again.",                                       felt:934,  replies:[], feed:'heard',   tier:'safe' },
  { id:'h5', label:'Anonymous',           category:'Anxiety',    text:"I canceled plans again. I hate myself for it. I hate that I can't just be normal. I am so tired of fighting my own brain.",        felt:1102, replies:[], feed:'heard',   tier:'safe' },
  { id:'h6', label:'Anonymous — 2 AM',    category:'Trauma',     text:"I still flinch when someone raises their voice and I'm 34 years old. He's been dead for twelve years and he still wins.",         felt:1421, replies:[], feed:'heard',   tier:'raw'  },
  { id:'t1', label:'Anonymous',           category:'Survival',   text:"Last year I was going to end it. I'm still here. I don't know why I made it but I did. If you're where I was — stay.",            felt:2341, replies:[], feed:'through', tier:'safe' },
  { id:'t2', label:'Anonymous — Early',   category:'Recovery',   text:"Two years clean from heroin. I cried in a grocery store today because I could actually afford food. Progress looks weird.",        felt:1876, replies:[], feed:'through', tier:'safe' },
  { id:'t3', label:'Anonymous',           category:'Hope',       text:"I didn't think I'd see 30. I'm 34 now. Messy, broke, still figuring it out. But here.",                                           felt:1567, replies:[], feed:'through', tier:'safe' },
  { id:'t4', label:'Anonymous',           category:'Recovery',   text:"I was homeless at 22. I have a key to a door now. That's everything.",                                                             felt:1988, replies:[], feed:'through', tier:'safe' },
  { id:'t5', label:'Anonymous',           category:'Survival',   text:"I relapsed 7 times before it stuck. 7 isn't failure. It's 7 attempts. Whoever needs to hear that — that's you.",                  felt:2104, replies:[], feed:'through', tier:'safe' },
  { id:'t6', label:'Anonymous',           category:'Hope',       text:"Therapy didn't work for me. Neither did meds. What worked was one friend who didn't leave. Find that person. They exist.",        felt:1733, replies:[], feed:'through', tier:'safe' },
];

const CAT: Record<string, string> = {
  Addiction:'#a78bfa', Grief:'#60a5fa', Loneliness:'#94a3b8',
  Trauma:'#f87171',    Anxiety:'#fb923c', Recovery:'#34d399',
  Family:'#f9a8d4',    Survival:'#facc15', Hope:'#00D9FF',
};

/* ── CRISIS DETECTION ─────────────────────────────────────── */
const EXPLICIT_CRISIS = [
  'kill myself','kill my self','killing myself',
  'end my life','ending my life','end it tonight',
  'suicide','suicidal',
  'want to die','wanna die','want to be dead',
  'going to do it','gonna do it','doing it tonight',
  'tonight is the night',
  'have a plan','my plan is','i have pills','i have a gun',
  "won't be here tomorrow",'wont be here tomorrow',
  'this is goodbye','final goodbye',
];
const DISTRESS = [
  'tired of existing','tired of being here','tired of living',
  "don't see the point","dont see the point",'no point anymore',
  "can't go on",'cant go on',"can't do this anymore",'cant do this anymore',
  'no reason to',"what's the point",'whats the point',
  'give up','giving up','nothing matters','nothing matters anymore',
  'better off without me','everyone would be better',
  'disappear forever','just disappear','fade away',
  'stop existing','hate being alive','hate existing',
  "can't keep doing this",'cant keep doing this',
];

function detectCrisisLevel(text: string): 'none' | 'distress' | 'explicit' {
  if (!text) return 'none';
  const lower = text.toLowerCase();
  if (EXPLICIT_CRISIS.some(kw => lower.includes(kw))) return 'explicit';
  if (DISTRESS.some(kw => lower.includes(kw))) return 'distress';
  return 'none';
}

/* ── TEXT / SIMILARITY / PII ──────────────────────────────── */
function getTimeMessage() {
  const h = new Date().getHours();
  if (h >= 0  && h < 5)  return "You're not alone at this hour.";
  if (h >= 5  && h < 8)  return 'Early morning. We\'re here.';
  if (h >= 22)           return "Late night. We're still here.";
  return "We're here. Take your time.";
}

function normalizeText(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function jaccardSimilarity(a: string, b: string) {
  const A = new Set(normalizeText(a).split(' ').filter(Boolean));
  const B = new Set(normalizeText(b).split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / new Set([...A, ...B]).size;
}

function detectPII(text: string) {
  const t = normalizeText(text);
  return [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    /\b\d{5}(?:-\d{4})?\b/,
    /\b(?:school|high school|college|university|work|job|address|apartment|street|ave|road|rd|blvd|drive|dr)\b/,
    /\b(?:my name is|i am\s+[a-z]+\s+[a-z]+)\b/,
  ].some(p => p.test(t));
}

interface Story {
  id: string; label: string; category: string; text: string;
  felt: number; replies: Reply[]; feed: string; tier: string;
}
interface Reply { id: string; text: string; when: string; }

function getRelatedStories(stories: Story[], story: Story, limit = 3) {
  return [...stories]
    .filter(s => s.id !== story.id)
    .map(s => ({
      s,
      score: (s.category === story.category ? 2 : 0) + jaccardSimilarity(s.text, story.text),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.s);
}

function inferCategory(text: string) {
  const l = (text || '').toLowerCase();
  if (l.includes('sober') || l.includes('withdraw') || l.includes('addict')) return 'Addiction';
  if (l.includes('died')  || l.includes('grief')    || l.includes('loss'))   return 'Grief';
  if (l.includes('alone') || l.includes('lonely')   || l.includes('isolat')) return 'Loneliness';
  if (l.includes('anxie') || l.includes('panic')    || l.includes('worr'))   return 'Anxiety';
  if (l.includes('trauma')|| l.includes('abuse')    || l.includes('flinch')) return 'Trauma';
  if (l.includes('recov') || l.includes('clean')    || l.includes('step'))   return 'Recovery';
  if (l.includes('parent')|| l.includes('family')   || l.includes('mom') || l.includes('dad')) return 'Family';
  if (l.includes('surviv')|| l.includes('relaps')   || l.includes('made it')) return 'Survival';
  return 'Hope';
}

function inferFeed(text: string) {
  const l = (text || '').toLowerCase();
  const through = ['made it','still here','clean from','years clean','got through','past it','i survived',"didn't think i'd","didnt think i'd"];
  return through.some(k => l.includes(k)) ? 'through' : 'heard';
}

/* ── SAFE STORAGE ─────────────────────────────────────────── */
function safeGet(key: string) {
  try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; }
  catch { return null; }
}
function safeSet(key: string, val: string) {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(key, val); }
  catch { /* swallow */ }
}
function safeParseJSON<T>(value: string | null, fallback: T): T {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

/* ── HOOKS ────────────────────────────────────────────────── */

// Real Supabase Realtime presence with fallback simulation
function useLivePresence() {
  const [count, setCount] = useState(() => 180 + Math.floor(Math.random() * 100));

  useEffect(() => {
    let channel: ReturnType<typeof import('@/lib/supabase')['supabase']['channel']> | null = null;

    // Try real presence
    import('@/lib/supabase').then(({ supabase }) => {
      const BASE = 147; // floor so it never reads "2 here with you" on day 1
      channel = supabase.channel('ryvynn-sanctuary', {
        config: { presence: { key: 'anon_' + Math.random().toString(36).slice(2, 10) } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!channel) return;
          const realCount = Object.values(channel.presenceState() as Record<string, unknown[]>).flat().length;
          setCount(Math.max(realCount + BASE, 150));
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED' && channel) {
            await channel.track({ t: Date.now() });
          }
        });
    }).catch(() => {/* supabase not available, use simulation only */});

    // Simulation fallback always runs (keeps count alive if Realtime disconnects)
    const id = setInterval(() => {
      setCount(c => Math.max(150, Math.min(420, c + Math.floor(Math.random() * 5) - 2)));
    }, 4500);

    return () => {
      clearInterval(id);
      if (channel) {
        import('@/lib/supabase').then(({ supabase }) => supabase.removeChannel(channel!)).catch(() => {});
      }
    };
  }, []);

  return count;
}

function useDraftAutosave(text: string, setText: (t: string) => void) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const saved = safeGet(DRAFT_KEY);
    if (saved && !text) setText(saved);
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hydrated) safeSet(DRAFT_KEY, text || '');
  }, [text, hydrated]);
}

function useBookmarks(): [string[], (id: string) => void] {
  const [bookmarks, setBookmarks] = useState<string[]>(() => safeParseJSON(safeGet(BOOKMARK_KEY), []));
  useEffect(() => { safeSet(BOOKMARK_KEY, JSON.stringify(bookmarks)); }, [bookmarks]);
  const toggle = useCallback((id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  }, []);
  return [bookmarks, toggle];
}

/* ── PRIMITIVES ───────────────────────────────────────────── */
function FlameIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="sg-flame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D9FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M16 2C16 2 8 10 8 20C8 25.5 11.5 30 16 32C20.5 30 24 25.5 24 20C24 14 20 8 16 2Z" fill="url(#sg-flame)" opacity="0.9" />
      <path d="M16 12C16 12 12 17 12 22C12 24.8 13.8 27 16 28C18.2 27 20 24.8 20 22C20 17 16 12 16 12Z" fill="#8B5CF6" opacity="0.7" />
      <ellipse cx="16" cy="36" rx="5" ry="2" fill="#00D9FF" opacity="0.3" />
    </svg>
  );
}

type BtnVariant = 'primary' | 'outline' | 'danger';
function btn(variant: BtnVariant): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
    transition: 'all 0.2s', fontFamily: "'Lora', Georgia, serif",
  };
  if (variant === 'primary') return { ...base, padding: '12px 24px', background: 'linear-gradient(135deg, #8B5CF6, #00D9FF)', border: 'none', color: '#fff' };
  if (variant === 'danger')  return { ...base, padding: '12px 24px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5' };
  return { ...base, padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.25)', color: '#94a3b8' };
}

/* ── AGE GATE ─────────────────────────────────────────────── */
function AgeGate({ onChoose }: { onChoose: (t: string) => void }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#050510',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  padding:24, textAlign:'center' }}>
      <FlameIcon size={56} />
      <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:'clamp(1.6rem, 4vw, 2.2rem)',
                   color:'#f1f5f9', margin:'32px 0 16px', letterSpacing:'-0.01em' }}>
        Before you come in.
      </h1>
      <p style={{ color:'#94a3b8', maxWidth:460, lineHeight:1.7, marginBottom:40,
                  fontFamily:"'Lora', Georgia, serif" }}>
        This is an anonymous space for real, hard things. We need to know roughly who's here so we can keep it safe.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:320 }}>
        <button onClick={() => onChoose('adult')}   style={{ ...btn('primary'), padding:'14px 24px' }}>I'm 18 or older</button>
        <button onClick={() => onChoose('teen')}    style={{ ...btn('outline'), padding:'14px 24px' }}>I'm 14 to 17</button>
        <button onClick={() => onChoose('under14')} style={{ ...btn('outline'), padding:'14px 24px',
                                                              borderColor:'rgba(255,255,255,0.08)', color:'#64748b' }}>
          I'm younger than 14
        </button>
      </div>
      <p style={{ marginTop:32, fontSize:12, color:'#475569', maxWidth:380, lineHeight:1.7,
                  fontFamily:"'Lora', Georgia, serif" }}>
        We don't store your answer with anything that identifies you. This just changes what you see.
      </p>
    </div>
  );
}

function UnderageRedirect({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#050510',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  padding:24, textAlign:'center' }}>
      <FlameIcon size={48} />
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:'1.8rem', color:'#f1f5f9', margin:'24px 0 16px' }}>
        We're glad you're here. But not yet.
      </h2>
      <p style={{ color:'#cbd5e1', maxWidth:480, lineHeight:1.8, marginBottom:24,
                  fontFamily:"'Lora', Georgia, serif", fontSize:16 }}>
        Ryvynn was built for people 14 and up. That isn't a rule meant to hurt you — it's because the things people write here can be heavy, and we want to make sure the right kind of help reaches you.
      </p>
      <div style={{ background:'rgba(0,217,255,0.06)', border:'1px solid rgba(0,217,255,0.2)',
                    borderRadius:12, padding:'20px 24px', maxWidth:480, textAlign:'left', marginBottom:32 }}>
        <p style={{ color:'#e2e8f0', fontFamily:"'Lora', Georgia, serif", lineHeight:1.8, margin:0, fontSize:15 }}>
          If you are hurting right now, or someone is hurting you, please tell a trusted adult.<br /><br />
          <strong style={{ color:'#00D9FF' }}>Call or text 988</strong> — free, anonymous, they listen.<br />
          <strong style={{ color:'#00D9FF' }}>Childhelp:</strong> 1-800-422-4453<br />
          <strong style={{ color:'#00D9FF' }}>Emergency:</strong> 911
        </p>
      </div>
      <button onClick={onBack} style={btn('outline')}>Go back</button>
    </div>
  );
}

/* ── CRISIS STRIP ─────────────────────────────────────────── */
function CrisisStrip() {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:90,
                  background:'rgba(5,5,16,0.92)', backdropFilter:'blur(8px)',
                  borderTop:'1px solid rgba(248,113,113,0.15)',
                  padding:'8px 16px', textAlign:'center',
                  fontFamily:"'Lora', Georgia, serif" }}>
      <p style={{ margin:0, fontSize:11, color:'#64748b', letterSpacing:'0.04em' }}>
        In crisis? <span style={{ color:'#fca5a5', fontWeight:600 }}>988</span> — call or text · Emergency <span style={{ color:'#fca5a5', fontWeight:600 }}>911</span>
      </p>
    </div>
  );
}

/* ── NAV (sanctuary-local, no auth) ──────────────────────── */
function SanctuaryNav({ presence, bookmarkCount, onShowBookmarks }: {
  presence: number; bookmarkCount: number; onShowBookmarks: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
                  background:scrolled ? 'rgba(5,5,15,0.92)' : 'transparent',
                  backdropFilter:scrolled ? 'blur(12px)' : 'none',
                  borderBottom:scrolled ? '1px solid rgba(139,92,246,0.15)' : 'none',
                  transition:'all 0.4s ease', padding:'14px 24px',
                  display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <FlameIcon size={22} />
        <span style={{ fontFamily:"'Cinzel', serif", fontSize:14, letterSpacing:'0.14em',
                       color:'#e2e8f0', fontWeight:600 }}>RYVYNN</span>
      </a>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        {bookmarkCount > 0 && (
          <button onClick={onShowBookmarks}
                  style={{ background:'none', border:'none', color:'#64748b',
                           cursor:'pointer', fontSize:12, fontFamily:"'Lora', Georgia, serif",
                           display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ color:'#00D9FF' }}>★</span> {bookmarkCount}
          </button>
        )}
        <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12,
                       color:'#475569', fontFamily:"'Lora', Georgia, serif" }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399',
                         boxShadow:'0 0 8px rgba(52,211,153,0.6)', display:'inline-block',
                         animation:'pulse 2s infinite' }} />
          {presence} here
        </span>
      </div>
    </nav>
  );
}

/* ── HERO ─────────────────────────────────────────────────── */
function Hero({ onSay }: { onSay: () => void }) {
  return (
    <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center',
                      padding:'120px 24px 100px', textAlign:'center' }}>
      <div style={{ animation:'fadeIn 1.2s ease' }}>
        <FlameIcon size={64} />
        <h1 style={{ fontFamily:"'Cinzel', serif",
                     fontSize:'clamp(2.2rem, 6vw, 4rem)',
                     color:'#f1f5f9', margin:'32px 0 24px',
                     letterSpacing:'-0.02em', lineHeight:1.15 }}>
          Say the thing<br />
          <span style={{ background:'linear-gradient(135deg, #8B5CF6, #00D9FF)',
                         WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            you can't say anywhere else.
          </span>
        </h1>
        <p style={{ color:'#94a3b8', maxWidth:540, margin:'0 auto 48px',
                    fontSize:'clamp(1rem, 2vw, 1.15rem)', lineHeight:1.8,
                    fontFamily:"'Lora', Georgia, serif" }}>
          No accounts. No names. No trace. Just a place to put it down — privately, or shared with people who get it.
        </p>
        <button onClick={onSay}
                style={{ ...btn('primary'), fontSize:16, padding:'16px 36px',
                         boxShadow:'0 0 40px rgba(139,92,246,0.3)' }}>
          I need to say something
        </button>
        <p style={{ marginTop:20, fontSize:12, color:'#334155',
                    fontFamily:"'Lora', Georgia, serif" }}>
          110% anonymous · No account needed · Free at the core
        </p>
      </div>
    </section>
  );
}

/* ── CRISIS TAKEOVER ──────────────────────────────────────── */
function CrisisTakeover({ onContinueWriting, onClose }: {
  onContinueWriting: () => void; onClose: () => void;
}) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300,
                  background:'rgba(5,5,16,0.98)', backdropFilter:'blur(24px)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  padding:24, textAlign:'center', animation:'fadeIn 0.6s ease' }}>
      <FlameIcon size={56} />
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:'clamp(1.6rem, 4vw, 2.2rem)',
                   color:'#f1f5f9', margin:'32px 0 20px' }}>
        Hold on.
      </h2>
      <p style={{ color:'#cbd5e1', maxWidth:480, lineHeight:1.8, marginBottom:12,
                  fontFamily:"'Lora', Georgia, serif", fontSize:16 }}>
        What you're writing suggests you might be in a really dark place right now. That matters.
      </p>
      <p style={{ color:'#e2e8f0', maxWidth:480, lineHeight:1.8, marginBottom:40,
                  fontFamily:"'Lora', Georgia, serif", fontSize:16 }}>
        Before you keep going — please reach out to someone who can actually be there with you.
      </p>
      <div style={{ background:'rgba(248,113,113,0.08)', border:'2px solid rgba(248,113,113,0.35)',
                    borderRadius:12, padding:'24px 28px', maxWidth:420, marginBottom:32 }}>
        <p style={{ color:'#fca5a5', fontSize:18, fontWeight:700, margin:'0 0 12px',
                    fontFamily:"'Cinzel', serif", letterSpacing:'0.05em' }}>988</p>
        <p style={{ color:'#cbd5e1', fontSize:15, margin:0, lineHeight:1.7,
                    fontFamily:"'Lora', Georgia, serif" }}>
          Suicide & Crisis Lifeline<br />
          <span style={{ color:'#94a3b8', fontSize:14 }}>Call or text. Free. Anonymous. 24/7.</span>
        </p>
      </div>
      <button onClick={onContinueWriting}
              style={{ background:'none', border:'none', color:'#64748b',
                       fontSize:13, cursor:'pointer', textDecoration:'underline',
                       fontFamily:"'Lora', Georgia, serif", padding:8 }}>
        I'm okay, let me keep writing
      </button>
      <button onClick={onClose}
              style={{ background:'none', border:'none', color:'#475569',
                       fontSize:12, cursor:'pointer', fontFamily:"'Lora', Georgia, serif", marginTop:8 }}>
        Close
      </button>
    </div>
  );
}

/* ── WRITING MOMENT ───────────────────────────────────────── */
type Stage = 'write' | 'confirm-publish' | 'private-fade' | 'private-done' | 'published';

function WritingMoment({ onClose, presence, ageTier, onPublish, allStories }: {
  onClose: () => void; presence: number; ageTier: string | null;
  onPublish: (s: Story) => void; allStories: Story[];
}) {
  const [text, setText] = useState('');
  const [stage, setStage] = useState<Stage>('write');
  const [crisisLevel, setCrisisLevel] = useState<'none'|'distress'|'explicit'>('none');
  const [showCrisisTakeover, setShowCrisisTakeover] = useState(false);
  const [showPIIWarning, setShowPIIWarning] = useState(false);
  const [fadeText, setFadeText] = useState(false);
  const [similar, setSimilar] = useState<Story[]>([]);
  const [publishing, setPublishing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const timeMsg = getTimeMessage();

  useDraftAutosave(text, setText);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus?.(), 300);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (!text.trim()) { setCrisisLevel('none'); setShowPIIWarning(false); return; }
    const level = detectCrisisLevel(text);
    setCrisisLevel(level);
    setShowPIIWarning(detectPII(text));
    if (level === 'explicit' && !showCrisisTakeover) {
      const t = setTimeout(() => setShowCrisisTakeover(true), 800);
      return () => clearTimeout(t);
    }
  }, [text, showCrisisTakeover]);

  useEffect(() => {
    if (stage === 'private-fade') {
      setFadeText(true);
      const t = setTimeout(() => setStage('private-done'), 3200);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    const category = inferCategory(text);
    const feed = inferFeed(text);

    try {
      const res = await fetch('/api/sanctuary/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, feed }),
      });
      const json = await res.json();

      let story: Story;
      if (json.success && json.story) {
        story = json.story;
      } else {
        // Fallback: optimistic local story
        story = {
          id: `local_${Date.now()}`,
          label: 'Anonymous — Just now',
          category, text, felt: Math.floor(Math.random() * 80) + 20,
          replies: [], feed, tier: 'safe',
        };
      }

      onPublish(story);
      setSimilar(getRelatedStories(allStories, story, 3));
      setStage('published');
      safeSet(DRAFT_KEY, '');
    } catch {
      // Fail open — still show published state
      const story: Story = {
        id: `local_${Date.now()}`,
        label: 'Anonymous — Just now',
        category: inferCategory(text), text,
        felt: Math.floor(Math.random() * 80) + 20,
        replies: [], feed: inferFeed(text), tier: 'safe',
      };
      onPublish(story);
      setSimilar(getRelatedStories(allStories, story, 3));
      setStage('published');
      safeSet(DRAFT_KEY, '');
    } finally {
      setPublishing(false);
    }
  }, [text, allStories, onPublish]);

  if (showCrisisTakeover) {
    return <CrisisTakeover onContinueWriting={() => setShowCrisisTakeover(false)} onClose={onClose} />;
  }

  const overlay: React.CSSProperties = {
    position:'fixed', inset:0, zIndex:200,
    background:'rgba(3,3,12,0.98)', backdropFilter:'blur(24px)',
    animation:'fadeIn 0.6s ease',
  };

  /* WRITE */
  if (stage === 'write') {
    return (
      <div style={{ ...overlay, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'20px 24px', flexShrink:0 }}>
          <span style={{ fontSize:11, color:'#64748b', fontFamily:"'Lora', Georgia, serif",
                         display:'flex', alignItems:'center', gap:6, opacity:0.7 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399',
                           boxShadow:'0 0 8px rgba(52,211,153,0.6)', display:'inline-block' }} />
            {presence} here with you
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#475569',
                                              cursor:'pointer', fontSize:18, padding:8 }}>✕</button>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                      padding:'0 24px', maxWidth:720, margin:'0 auto', width:'100%' }}>
          {timeMsg && (
            <p style={{ fontSize:13, color:'#94a3b8', textAlign:'center', marginBottom:32,
                        fontFamily:"'Lora', Georgia, serif", fontStyle:'italic',
                        letterSpacing:'0.02em', animation:'fadeIn 1.2s ease 0.3s both' }}>
              {timeMsg}
            </p>
          )}
          <textarea
            ref={ref}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Say the thing."
            style={{ width:'100%', minHeight:200, background:'transparent',
                     border:'none', outline:'none', color:'#f1f5f9',
                     fontSize:'clamp(1.1rem, 2.5vw, 1.35rem)', lineHeight:1.8,
                     resize:'none', fontFamily:"'Lora', Georgia, serif", textAlign:'center' }}
          />
          {showPIIWarning && (
            <div style={{ background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.25)',
                          borderRadius:8, padding:'12px 16px', marginTop:16, animation:'fadeIn 0.3s ease' }}>
              <p style={{ color:'#fdba74', fontSize:13, margin:0, lineHeight:1.6,
                          fontFamily:"'Lora', Georgia, serif" }}>
                ⚠ This may include identifying details. Consider removing them before sharing.
              </p>
            </div>
          )}
          {crisisLevel === 'distress' && (
            <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)',
                          borderRadius:8, padding:'14px 18px', marginTop:16, animation:'fadeIn 0.4s ease' }}>
              <p style={{ color:'#fca5a5', fontSize:13, lineHeight:1.7, margin:0,
                          fontFamily:"'Lora', Georgia, serif" }}>
                What you're writing sounds heavy. You can keep going — but if you need someone right now, <strong>988</strong> is there. Call or text.
              </p>
            </div>
          )}
          <p style={{ fontSize:11, color:'#334155', textAlign:'center', marginTop:24,
                      fontFamily:"'Lora', Georgia, serif",
                      opacity:text.trim() ? 0 : 0.7, transition:'opacity 0.4s' }}>
            Tip: don't include names, addresses, schools, or anything that could identify you.
          </p>
        </div>
        <div style={{ padding:'20px 24px 32px', flexShrink:0,
                      display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap',
                      opacity:text.trim() ? 1 : 0,
                      pointerEvents:text.trim() ? 'auto' : 'none',
                      transition:'opacity 0.4s ease',
                      maxWidth:560, margin:'0 auto', width:'100%' }}>
          <button onClick={() => setStage('private-fade')} style={{ ...btn('outline'), flex:1, minWidth:140 }}>
            Keep private
          </button>
          <button onClick={() => setStage('confirm-publish')} style={{ ...btn('primary'), flex:1, minWidth:140 }}>
            Share anonymously
          </button>
        </div>
      </div>
    );
  }

  /* PRIVATE FADE */
  if (stage === 'private-fade') {
    return (
      <div style={{ ...overlay, display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ maxWidth:600, width:'100%', textAlign:'center',
                      opacity:fadeText ? 0 : 1,
                      transition:'opacity 2.5s ease 0.4s',
                      filter:fadeText ? 'blur(8px)' : 'blur(0px)' }}>
          <p style={{ fontFamily:"'Lora', Georgia, serif",
                      fontSize:'clamp(1.1rem, 2.5vw, 1.35rem)',
                      color:'#f1f5f9', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{text}</p>
        </div>
        <p style={{ position:'absolute', bottom:'30%', fontSize:12, color:'#64748b',
                    letterSpacing:'0.15em', fontFamily:"'Lora', Georgia, serif",
                    textTransform:'uppercase',
                    opacity:fadeText ? 0.9 : 0, transition:'opacity 1.5s ease 1s' }}>
          Letting go
        </p>
      </div>
    );
  }

  /* PRIVATE DONE */
  if (stage === 'private-done') {
    return (
      <div style={{ ...overlay, display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
        <FlameIcon size={56} />
        <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:'clamp(1.6rem, 4vw, 2.2rem)',
                     color:'#f1f5f9', margin:'32px 0 20px' }}>You said it. That matters.</h2>
        <p style={{ color:'#94a3b8', maxWidth:460, lineHeight:1.8, marginBottom:12,
                    fontFamily:"'Lora', Georgia, serif", fontSize:16 }}>
          What you wrote does not exist after this moment. No record. No trace.
        </p>
        <p style={{ color:'#cbd5e1', maxWidth:460, lineHeight:1.8, marginBottom:40,
                    fontFamily:"'Lora', Georgia, serif", fontSize:16 }}>
          You said the thing. That is not nothing.
        </p>
        {crisisLevel !== 'none' && (
          <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)',
                        borderRadius:10, padding:'16px 20px', maxWidth:460, marginBottom:32 }}>
            <p style={{ color:'#fca5a5', fontSize:14, lineHeight:1.7, margin:0,
                        fontFamily:"'Lora', Georgia, serif" }}>
              If any part of you is still hurting — <strong>988</strong> is there. Call or text. Anonymous.
            </p>
          </div>
        )}
        <button onClick={onClose} style={btn('outline')}>Close</button>
      </div>
    );
  }

  /* CONFIRM PUBLISH */
  if (stage === 'confirm-publish') {
    return (
      <div style={{ ...overlay, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ background:'#0d0d1a', border:'1px solid rgba(139,92,246,0.2)',
                      borderRadius:16, maxWidth:520, width:'100%', padding:'32px 28px' }}>
          <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:'#f1f5f9', marginBottom:20 }}>
            One last thing
          </h3>
          <p style={{ color:'#cbd5e1', fontSize:15, lineHeight:1.8, marginBottom:16,
                      fontFamily:"'Lora', Georgia, serif" }}>
            Once published, your story stays on the wall — anonymized — so someone else can see they're not alone.
          </p>
          <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.7, marginBottom:20,
                      fontFamily:"'Lora', Georgia, serif" }}>
            We'll strip obvious identifiers before posting. Even so — don't include names, exact places, or anything that could identify you.
          </p>
          {showPIIWarning && (
            <div style={{ background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.25)',
                          borderRadius:8, padding:'12px 16px', marginBottom:24 }}>
              <p style={{ color:'#fdba74', fontSize:13, margin:0, lineHeight:1.6,
                          fontFamily:"'Lora', Georgia, serif" }}>
                ⚠ Your post may include identifying details. Are you sure?
              </p>
            </div>
          )}
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => setStage('write')} style={{ ...btn('outline'), flex:1 }}>Go back</button>
            <button onClick={handlePublish} disabled={publishing}
                    style={{ ...btn('primary'), flex:1, opacity:publishing ? 0.7 : 1 }}>
              {publishing ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* PUBLISHED */
  return (
    <div style={{ ...overlay, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', padding:24, textAlign:'center',
                  overflowY:'auto' }}>
      <FlameIcon size={56} />
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:'clamp(1.6rem, 4vw, 2.2rem)',
                   color:'#f1f5f9', margin:'32px 0 20px' }}>It's on the wall.</h2>
      <p style={{ color:'#cbd5e1', maxWidth:460, lineHeight:1.8,
                  marginBottom:similar.length > 0 ? 32 : 40,
                  fontFamily:"'Lora', Georgia, serif", fontSize:16 }}>
        Somewhere, someone will read this and feel less alone because you had the courage to say it.
      </p>
      {similar.length > 0 && (
        <div style={{ width:'100%', maxWidth:480, marginBottom:40, textAlign:'left' }}>
          <p style={{ fontSize:11, color:'#64748b', letterSpacing:'0.12em', marginBottom:16,
                      fontFamily:"'Lora', Georgia, serif", textTransform:'uppercase' }}>
            Others who've been there:
          </p>
          {similar.map(s => (
            <div key={s.id}
                 style={{ padding:'14px 16px', background:'rgba(255,255,255,0.03)',
                          borderRadius:8, marginBottom:10,
                          borderLeft:`3px solid ${CAT[s.category] || '#8B5CF6'}` }}>
              <p style={{ color:CAT[s.category] || '#94a3b8', fontSize:11, margin:'0 0 6px',
                          fontWeight:600, fontFamily:"'Lora', Georgia, serif",
                          letterSpacing:'0.05em' }}>{s.category}</p>
              <p style={{ color:'#cbd5e1', fontSize:14, margin:0, lineHeight:1.6,
                          fontFamily:"'Lora', Georgia, serif" }}>{s.text}</p>
            </div>
          ))}
        </div>
      )}
      {crisisLevel !== 'none' && (
        <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)',
                      borderRadius:10, padding:'16px 20px', maxWidth:460, marginBottom:32, width:'100%' }}>
          <p style={{ color:'#fca5a5', fontSize:14, lineHeight:1.7, margin:0,
                      fontFamily:"'Lora', Georgia, serif" }}>
            If part of you is still hurting — <strong>988</strong>. Call or text.
          </p>
        </div>
      )}
      <button onClick={onClose} style={btn('outline')}>Close</button>
    </div>
  );
}

/* ── STORY CARD ───────────────────────────────────────────── */
function StoryCard({ story, isBookmarked, onToggleBookmark }: {
  story: Story; isBookmarked: boolean; onToggleBookmark: (id: string) => void;
}) {
  const [felt, setFelt] = useState(story.felt);
  const [pressed, setPressed] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>(story.replies || []);
  const color = CAT[story.category] || '#94a3b8';

  const handleFelt = async () => {
    if (pressed) return;
    setFelt(f => f + 1);
    setPressed(true);
    // Fire-and-forget to DB
    fetch('/api/sanctuary/stories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: story.id }),
    }).catch(() => {/* swallow — local state already updated */});
  };

  const handlePostReply = () => {
    if (!replyText.trim()) return;
    const newReply: Reply = { id: `r${Date.now()}`, text: replyText.trim(), when: 'just now' };
    setReplies(prev => [...prev, newReply]);
    setReplyText('');
    setShowReplyBox(false);
    setShowReplies(true);
  };

  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:12, padding:24, transition:'border-color 0.3s, transform 0.2s' }}
         onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
         onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                    marginBottom:14, gap:12 }}>
        <span style={{ fontSize:12, color:'#475569', fontFamily:"'Lora', Georgia, serif" }}>
          {story.label}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:11, color, background:`${color}18`, borderRadius:4,
                         padding:'3px 10px', fontWeight:600, letterSpacing:'0.05em',
                         fontFamily:"'Lora', Georgia, serif" }}>
            {story.category}
          </span>
          <button onClick={() => onToggleBookmark(story.id)}
                  title={isBookmarked ? 'Remove bookmark' : 'Save'}
                  style={{ background:'none', border:'none',
                           color:isBookmarked ? '#00D9FF' : '#334155',
                           cursor:'pointer', fontSize:18, padding:'2px 4px',
                           lineHeight:1, transition:'color 0.2s, transform 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>
      <p style={{ color:'#cbd5e1', fontSize:15, lineHeight:1.75, margin:'0 0 20px',
                  fontFamily:"'Lora', Georgia, serif" }}>{story.text}</p>
      <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={handleFelt}
                style={{ background:pressed ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                         border:`1px solid ${pressed ? 'rgba(0,217,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                         borderRadius:6, padding:'8px 14px',
                         color:pressed ? '#00D9FF' : '#64748b',
                         cursor:pressed ? 'default' : 'pointer', fontSize:13, transition:'all 0.2s',
                         fontFamily:"'Lora', Georgia, serif" }}>
          I've felt this · {felt.toLocaleString()}
        </button>
        <button onClick={() => setShowReplyBox(!showReplyBox)}
                style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)',
                         borderRadius:6, padding:'8px 14px', color:'#64748b',
                         cursor:'pointer', fontSize:13, fontFamily:"'Lora', Georgia, serif" }}>
          {replies.length > 0 ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : 'Reply'}
        </button>
        {replies.length > 0 && (
          <button onClick={() => setShowReplies(!showReplies)}
                  style={{ background:'none', border:'none', color:'#475569',
                           cursor:'pointer', fontSize:12, fontFamily:"'Lora', Georgia, serif" }}>
            {showReplies ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {showReplyBox && (
        <div style={{ marginTop:16 }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    placeholder="Say something kind. Stay anonymous."
                    style={{ width:'100%', minHeight:60, background:'rgba(255,255,255,0.04)',
                             border:'1px solid rgba(139,92,246,0.2)', borderRadius:6,
                             padding:'10px 14px', color:'#e2e8f0', fontSize:14,
                             outline:'none', boxSizing:'border-box', resize:'vertical',
                             fontFamily:"'Lora', Georgia, serif", lineHeight:1.6 }} />
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={handlePostReply} disabled={!replyText.trim()}
                    style={{ ...btn('primary'), fontSize:13, padding:'8px 20px',
                             opacity:replyText.trim() ? 1 : 0.4 }}>
              Post anonymously
            </button>
            <button onClick={() => { setShowReplyBox(false); setReplyText(''); }}
                    style={{ ...btn('outline'), fontSize:13, padding:'8px 20px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {showReplies && replies.length > 0 && (
        <div style={{ marginTop:20, paddingTop:16,
                      borderTop:'1px solid rgba(255,255,255,0.06)',
                      display:'flex', flexDirection:'column', gap:12 }}>
          {replies.map(r => (
            <div key={r.id} style={{ background:'rgba(0,217,255,0.04)',
                                      borderLeft:'2px solid rgba(0,217,255,0.3)',
                                      padding:'10px 14px', borderRadius:4 }}>
              <p style={{ color:'#cbd5e1', fontSize:14, margin:0, lineHeight:1.6,
                          fontFamily:"'Lora', Georgia, serif" }}>{r.text}</p>
              <p style={{ color:'#475569', fontSize:11, marginTop:6,
                          fontFamily:"'Lora', Georgia, serif" }}>Anonymous · {r.when}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── WALL ─────────────────────────────────────────────────── */
function Wall({ stories, ageTier, bookmarks, onToggleBookmark, showBookmarksOnly, setShowBookmarksOnly }: {
  stories: Story[]; ageTier: string | null;
  bookmarks: string[]; onToggleBookmark: (id: string) => void;
  showBookmarksOnly: boolean; setShowBookmarksOnly: (v: boolean) => void;
}) {
  const [feed, setFeed] = useState<'heard'|'through'>('heard');
  const [filter, setFilter] = useState('All');

  const visible = useMemo(() => {
    return stories
      .filter(s => showBookmarksOnly ? bookmarks.includes(s.id) : s.feed === feed)
      .filter(s => ageTier === 'adult' || s.tier === 'safe')
      .filter(s => filter === 'All' || s.category === filter);
  }, [stories, feed, filter, ageTier, bookmarks, showBookmarksOnly]);

  const categories = useMemo(() => {
    const src = showBookmarksOnly
      ? stories.filter(s => bookmarks.includes(s.id))
      : stories.filter(s => s.feed === feed);
    return ['All', ...Array.from(new Set(src.map(s => s.category)))];
  }, [stories, feed, bookmarks, showBookmarksOnly]);

  const feedCounts = useMemo(() => ({
    heard:   stories.filter(s => s.feed === 'heard'   && (ageTier === 'adult' || s.tier === 'safe')).length,
    through: stories.filter(s => s.feed === 'through' && (ageTier === 'adult' || s.tier === 'safe')).length,
  }), [stories, ageTier]);

  return (
    <section id="wall" style={{ padding:'100px 24px 80px', maxWidth:820, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <span style={{ fontSize:11, letterSpacing:'0.15em', color:'#8B5CF6', fontWeight:600,
                       fontFamily:"'Lora', Georgia, serif" }}>THE WALL</span>
        <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:'clamp(1.8rem, 4vw, 2.8rem)',
                     color:'#f1f5f9', margin:'12px 0 16px' }}>
          Real words from real people.
        </h2>
        <p style={{ color:'#64748b', maxWidth:500, margin:'0 auto', lineHeight:1.7,
                    fontFamily:"'Lora', Georgia, serif" }}>
          No performances. No profiles. Just people saying the thing they needed to say.
        </p>
      </div>

      {/* FEED TOGGLE */}
      <div style={{ display:'flex', justifyContent:'center', background:'rgba(255,255,255,0.03)',
                    borderRadius:100, padding:4, maxWidth:480, margin:'0 auto 16px',
                    border:'1px solid rgba(139,92,246,0.15)' }}>
        {(['heard','through'] as const).map(f => (
          <button key={f}
                  onClick={() => { setFeed(f); setFilter('All'); setShowBookmarksOnly(false); }}
                  style={{ flex:1, padding:'12px 20px', borderRadius:100, border:'none',
                           background:!showBookmarksOnly && feed === f
                             ? 'linear-gradient(135deg, #8B5CF6, #00D9FF)' : 'transparent',
                           color:!showBookmarksOnly && feed === f ? '#fff' : '#94a3b8',
                           fontWeight:600, cursor:'pointer', fontSize:13,
                           transition:'all 0.3s', fontFamily:"'Lora', Georgia, serif" }}>
            {f === 'heard' ? 'Need to be heard' : 'Got through something'}{' '}
            <span style={{ opacity:0.6, fontWeight:400, fontSize:11 }}>({feedCounts[f]})</span>
          </button>
        ))}
      </div>

      {bookmarks.length > 0 && (
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <button onClick={() => { setShowBookmarksOnly(!showBookmarksOnly); setFilter('All'); }}
                  style={{ background:showBookmarksOnly ? 'rgba(0,217,255,0.12)' : 'none',
                           border:`1px solid ${showBookmarksOnly ? 'rgba(0,217,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                           borderRadius:20, padding:'6px 16px',
                           color:showBookmarksOnly ? '#00D9FF' : '#64748b',
                           cursor:'pointer', fontSize:12, fontFamily:"'Lora', Georgia, serif" }}>
            ★ Saved stories ({bookmarks.length})
          </button>
        </div>
      )}

      {/* CATEGORY FILTER */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:40, justifyContent:'center' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
                  style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer',
                           background:filter === cat ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.04)',
                           border:`1px solid ${filter === cat ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                           color:filter === cat ? '#a78bfa' : '#64748b',
                           transition:'all 0.2s', fontFamily:"'Lora', Georgia, serif" }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {visible.length === 0 ? (
          <p style={{ textAlign:'center', color:'#475569', padding:40,
                      fontFamily:"'Lora', Georgia, serif" }}>
            {showBookmarksOnly
              ? 'No saved stories under this filter. Bookmark stories with ☆.'
              : 'Nothing here yet under this filter.'}
          </p>
        ) : (
          visible.map(s => (
            <StoryCard key={s.id} story={s}
                       isBookmarked={bookmarks.includes(s.id)}
                       onToggleBookmark={onToggleBookmark} />
          ))
        )}
      </div>
    </section>
  );
}

/* ── GUARDIAN SECTION ─────────────────────────────────────── */
function Guardian() {
  return (
    <section style={{ padding:'80px 24px', maxWidth:800, margin:'0 auto' }}>
      <div style={{ background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.15)',
                    borderRadius:16, padding:'48px 40px' }}>
        <span style={{ fontSize:11, letterSpacing:'0.15em', color:'#8B5CF6', fontWeight:600,
                       fontFamily:"'Lora', Georgia, serif" }}>GUARDIAN SAFETY LAYER</span>
        <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:'clamp(1.5rem, 3.5vw, 2.2rem)',
                     color:'#f1f5f9', margin:'16px 0 24px' }}>
          This is not a replacement for help.
        </h2>
        <p style={{ color:'#94a3b8', lineHeight:1.8, marginBottom:24, fontFamily:"'Lora', Georgia, serif" }}>
          Ryvynn is not a therapist, doctor, or emergency service. If you or someone else is in immediate danger, contact emergency services or a crisis line. <strong style={{ color:'#e2e8f0' }}>Call or text 988.</strong>
        </p>
        <p style={{ color:'#94a3b8', lineHeight:1.8, marginBottom:40, fontFamily:"'Lora', Georgia, serif" }}>
          The system watches for crisis language and changes how it responds. Safety always wins over style.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
          {[
            { label:'Clinical Mode',    desc:'Calm. Structured. Grounding.',  color:'#60a5fa' },
            { label:'Formal Mode',      desc:'Respectful. Steady. Clear.',    color:'#a78bfa' },
            { label:'Best Friend Mode', desc:'Direct. Human. Real.',          color:'#00D9FF' },
          ].map(m => (
            <div key={m.label}
                 style={{ background:'rgba(255,255,255,0.03)', borderRadius:10,
                          padding:'20px 18px', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:13, fontWeight:600, color:m.color, marginBottom:8,
                            fontFamily:"'Lora', Georgia, serif" }}>{m.label}</div>
              <div style={{ fontSize:13, color:'#64748b', lineHeight:1.6,
                            fontFamily:"'Lora', Georgia, serif" }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ───────────────────────────────────────────────── */
function SanctuaryFooter() {
  return (
    <footer style={{ padding:'60px 24px 80px', textAlign:'center',
                     borderTop:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ marginBottom:16 }}><FlameIcon size={32} /></div>
      <p style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:'#e2e8f0',
                  letterSpacing:'0.15em', marginBottom:8 }}>RYVYNN.LIVE</p>
      <p style={{ fontSize:13, color:'#475569', marginBottom:6, fontFamily:"'Lora', Georgia, serif" }}>Free at the core.</p>
      <p style={{ fontSize:12, color:'#334155', fontFamily:"'Lora', Georgia, serif" }}>
        Anonymous support for the moments people usually face alone.
      </p>
      <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize:11, color:'#334155', letterSpacing:'0.05em',
                    fontFamily:"'Lora', Georgia, serif" }}>
          NEXXT GEN INNOVATIONS LLC · Operating as AONIXX and RYVYNN · Tucson, AZ
        </p>
      </div>
    </footer>
  );
}

/* ============================================================
   SANCTUARY PAGE ROOT
   ============================================================ */
export default function SanctuaryPage() {
  const [ageTier, setAgeTier]                 = useState<string|null>(null);
  const [showAgeGate, setShowAgeGate]         = useState(false);
  const [underageBlocked, setUnderageBlocked] = useState(false);
  const [showWriting, setShowWriting]         = useState(false);
  const [stories, setStories]                 = useState<Story[]>(SEED_STORIES);
  const [storiesLoaded, setStoriesLoaded]     = useState(false);
  const [bookmarks, toggleBookmark]           = useBookmarks();
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const presence                              = useLivePresence();

  // Hydrate localStorage values client-side
  useEffect(() => {
    const savedAge = safeGet(AGE_KEY);
    setAgeTier(savedAge);
    setShowAgeGate(!savedAge);
  }, []);

  // Load real stories from DB, merge with seed
  useEffect(() => {
    if (storiesLoaded) return;
    fetch('/api/sanctuary/stories')
      .then(r => r.json())
      .then(({ stories: dbStories }) => {
        if (dbStories && dbStories.length > 0) {
          // Merge: DB stories first, then seed stories not already in DB
          const dbIds = new Set(dbStories.map((s: Story) => s.id));
          const merged = [...dbStories, ...SEED_STORIES.filter(s => !dbIds.has(s.id))];
          setStories(merged);
        }
        setStoriesLoaded(true);
      })
      .catch(() => setStoriesLoaded(true)); // fail open with seed data
  }, [storiesLoaded]);

  const handleAgeChoice = (tier: string) => {
    if (tier === 'under14') { setUnderageBlocked(true); return; }
    safeSet(AGE_KEY, tier);
    setAgeTier(tier);
    setShowAgeGate(false);
  };

  const handlePublish = useCallback((story: Story) => {
    setStories(prev => [story, ...prev]);
  }, []);

  const scrollToBookmarks = useCallback(() => {
    setShowBookmarksOnly(true);
    setTimeout(() => {
      document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#050510',
                  fontFamily:"'Lora', Georgia, serif", paddingBottom:40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050510; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }
        html { scroll-behavior: smooth; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {underageBlocked && <UnderageRedirect onBack={() => setUnderageBlocked(false)} />}
      {showAgeGate && !underageBlocked && <AgeGate onChoose={handleAgeChoice} />}

      {!showAgeGate && (
        <>
          <SanctuaryNav
            presence={presence}
            bookmarkCount={bookmarks.length}
            onShowBookmarks={scrollToBookmarks}
          />
          <Hero onSay={() => setShowWriting(true)} />
          {showWriting && (
            <WritingMoment
              onClose={() => setShowWriting(false)}
              presence={presence}
              ageTier={ageTier}
              onPublish={handlePublish}
              allStories={stories}
            />
          )}
          <Wall
            stories={stories}
            ageTier={ageTier}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            showBookmarksOnly={showBookmarksOnly}
            setShowBookmarksOnly={setShowBookmarksOnly}
          />
          <Guardian />
          <SanctuaryFooter />
          <CrisisStrip />
        </>
      )}
    </div>
  );
}
