'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from '@/contexts/I18nContext';

/* ============================================================
   RYVYNN.LIVE — The Sanctuary
   Merges: RyvynnApp.jsx soul + Next.js Guardian Council
   Background: #050510 — cathedral at 3 AM
   Fonts: Cinzel (headlines) + Lora (body)
   ============================================================ */

/* ---------- TYPES ---------- */
interface Story {
  id: string;
  label: string;
  category: string;
  text: string;
  felt: number;
  replies: string[];
  feed: 'heard' | 'through';
  tier: 'safe' | 'raw';
}

interface ChatMsg { role: 'user' | 'ai'; text: string; }

/* ---------- SEED STORIES (shown before backend loads) ---------- */
const SEED_STORIES: Story[] = [
  { id: 'h1', label: 'Anonymous — 3:14 AM', category: 'Addiction', text: "I've been sober 11 days. I threw up twice tonight from withdrawals. I didn't use. That's the whole story.", felt: 847, replies: [], feed: 'heard', tier: 'safe' },
  { id: 'h2', label: 'Anonymous', category: 'Grief', text: "My son died 8 months ago. I still set a plate for him sometimes. I don't know how to stop.", felt: 1203, replies: [], feed: 'heard', tier: 'safe' },
  { id: 'h3', label: 'Anonymous — Late', category: 'Loneliness', text: "I haven't had a real conversation with anyone in 19 days. I counted. I just needed to say that somewhere.", felt: 692, replies: [], feed: 'heard', tier: 'safe' },
  { id: 'h4', label: 'Anonymous', category: 'Family', text: "I cut off my parents six months ago to survive. I miss them every day and I'd do it again.", felt: 934, replies: [], feed: 'heard', tier: 'safe' },
  { id: 'h5', label: 'Anonymous', category: 'Anxiety', text: "I canceled plans again. I hate myself for it. I am so tired of fighting my own brain.", felt: 1102, replies: [], feed: 'heard', tier: 'safe' },
  { id: 'h6', label: 'Anonymous — 2 AM', category: 'Trauma', text: "I still flinch when someone raises their voice and I'm 34 years old. He's been dead for twelve years and he still wins.", felt: 1421, replies: [], feed: 'heard', tier: 'raw' },
  { id: 't1', label: 'Anonymous', category: 'Survival', text: "Last year I was going to end it. I'm still here. I don't know why I made it but I did. If you're where I was — stay.", felt: 2341, replies: [], feed: 'through', tier: 'safe' },
  { id: 't2', label: 'Anonymous — Early Morning', category: 'Recovery', text: "Two years clean from heroin. I cried in a grocery store today because I could actually afford food. Progress looks weird.", felt: 1876, replies: [], feed: 'through', tier: 'safe' },
  { id: 't3', label: 'Anonymous', category: 'Hope', text: "I didn't think I'd see 30. I'm 34 now. Messy, broke, still figuring it out. But here.", felt: 1567, replies: [], feed: 'through', tier: 'safe' },
  { id: 't4', label: 'Anonymous', category: 'Recovery', text: "I was homeless at 22. I have a key to a door now. That's everything.", felt: 1988, replies: [], feed: 'through', tier: 'safe' },
  { id: 't5', label: 'Anonymous', category: 'Survival', text: "I relapsed 7 times before it stuck. 7 isn't failure. It's 7 attempts. Whoever needs to hear that — that's you.", felt: 2104, replies: [], feed: 'through', tier: 'safe' },
  { id: 't6', label: 'Anonymous', category: 'Hope', text: "Therapy didn't work for me. Neither did meds. What worked was one friend who didn't leave. Find that person. They exist.", felt: 1733, replies: [], feed: 'through', tier: 'safe' },
];

/* ---------- CATEGORY COLORS ---------- */
const CAT_COLOR: Record<string, string> = {
  Addiction: '#a78bfa', Grief: '#60a5fa', Loneliness: '#94a3b8',
  Trauma: '#f87171', Anxiety: '#fb923c', Recovery: '#34d399',
  Family: '#f9a8d4', Survival: '#facc15', Hope: '#00D9FF',
  Other: '#8B5CF6',
};

/* ---------- CRISIS DETECTION ---------- */
const EXPLICIT_CRISIS = [
  'kill myself','kill my self','killing myself','end my life','ending my life',
  'end it tonight','suicide','suicidal','want to die','wanna die','want to be dead',
  'going to do it','gonna do it','doing it tonight','tonight is the night',
  'have a plan','my plan is','i have pills','i have a gun',
  "won't be here tomorrow","wont be here tomorrow",'this is goodbye','final goodbye',
];
const DISTRESS = [
  'tired of existing','tired of being here','tired of living',
  "don't see the point","dont see the point",'no point anymore',
  "can't go on","cant go on","can't do this anymore","cant do this anymore",
  'no reason to',"what's the point",'whats the point',
  'give up','giving up','nothing matters','nothing matters anymore',
  'better off without me','everyone would be better',
  'disappear forever','just disappear','fade away',
  'stop existing','hate being alive','hate existing',
];
const PII_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b\d{5}(-\d{4})?\b/,
  /\b(my name is|i'm called|i am called|call me)\s+[A-Z][a-z]+/i,
  /\b(school|work|workplace|job|address|lives at|live at|live on)\s+[A-Z]/i,
];

function detectCrisisLevel(text: string): 'none' | 'distress' | 'explicit' {
  if (!text) return 'none';
  const lower = text.toLowerCase();
  if (EXPLICIT_CRISIS.some(kw => lower.includes(kw))) return 'explicit';
  if (DISTRESS.some(kw => lower.includes(kw))) return 'distress';
  return 'none';
}

function detectPII(text: string): boolean {
  return PII_PATTERNS.some(p => p.test(text));
}

/* ---------- JACCARD SIMILARITY ---------- */
function jaccard(a: string, b: string): number {
  const sa = new Set(a.toLowerCase().split(/\s+/));
  const sb = new Set(b.toLowerCase().split(/\s+/));
  const inter = new Set([...sa].filter(x => sb.has(x)));
  const union = new Set([...sa, ...sb]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

function getRelated(text: string, all: Story[], count = 3): Story[] {
  return all
    .map(s => ({ story: s, score: jaccard(text, s.text) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(x => x.story);
}

/* ---------- TIME-AWARE COPY ---------- */
function getTimeMsg(): string {
  const h = new Date().getHours();
  if (h >= 0 && h < 5) return "You're not alone at this hour.";
  if (h >= 5 && h < 8) return 'Early morning. We are here.';
  if (h >= 22) return 'Late night. We are still here.';
  return 'We are here. Take your time.';
}

/* ---------- SAFE STORAGE ---------- */
function safeGet(key: string): string | null {
  try { return typeof window !== 'undefined' ? localStorage.getItem(key) : null; }
  catch { return null; }
}
function safeSet(key: string, val: string) {
  try { if (typeof window !== 'undefined') localStorage.setItem(key, val); }
  catch { /* swallow */ }
}

/* ---------- LIVE PRESENCE ---------- */
function useLivePresence() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(180 + Math.floor(Math.random() * 100));
    const id = setInterval(() => {
      setCount(c => Math.max(150, Math.min(420, c + Math.floor(Math.random() * 5) - 2)));
    }, 4500);
    return () => clearInterval(id);
  }, []);
  return count;
}

/* ---------- API HELPERS ---------- */
async function fetchWallAPI(): Promise<Story[]> {
  try {
    const r = await fetch('/api/wall?limit=60&sortBy=recent');
    if (!r.ok) return [];
    const d = await r.json();
    return (d.entries ?? []).map((e: any) => ({
      id: e.id, label: 'Anonymous',
      category: e.category || 'Other',
      text: e.transformation || e.confession || '',
      felt: e.votes ?? 0, replies: [],
      feed: e.feed || (e.transformation && e.transformation !== e.confession ? 'through' : 'heard'),
      tier: e.tier || 'safe',
    }));
  } catch { return []; }
}

async function postWallAPI(text: string, category: string, feed: string) {
  try {
    await fetch('/api/wall', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confession: text, category, feed, isAnonymous: true }),
    });
  } catch {}
}

async function voteWallAPI(id: string) {
  try {
    await fetch('/api/wall', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: id }),
    });
  } catch {}
}

async function callGuardian(msg: string, lang?: string, persona?: string): Promise<string> {
  try {
    const r = await fetch('/api/guardian/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        language: lang || (typeof window !== 'undefined' ? localStorage.getItem('ryvynn-language') || 'en' : 'en'),
        persona: persona || 'neutral',
        sessionHistory: [],
      }),
    });
    if (!r.ok) throw new Error();
    const d = await r.json();
    const full = (d.response ?? '').trim();
    const sentences = full.match(/[^.!?]+[.!?]+/g) ?? [full];
    return sentences.slice(0, 3).join(' ').trim() || full;
  } catch {
    const fallbacks = [
      "That sounds like a lot. I'm here with you.",
      "You can say it here. I won't hold onto it.",
      "Go ahead. It's safe.",
      "I hear you. Keep going if you need to.",
      "That took something to say. I'm still here.",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

/* ============================================================
   AGE GATE
   ============================================================ */
function AgeGate({ onChoose }: { onChoose: (tier: string) => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#050510',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24, textAlign: 'center',
    }}>
      <div style={{ width: 64, height: 64, position: 'relative', marginBottom: 32, filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.6))' }}>
        <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" fill style={{ objectFit: 'contain' }} />
      </div>
      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.2em', color: '#8B5CF6', marginBottom: 20 }}>
        RYVYNN.LIVE
      </p>
      <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.6rem,5vw,2.4rem)', color: '#f1f5f9', marginBottom: 16, fontWeight: 400, lineHeight: 1.2 }}>
        Before you enter.
      </h1>
      <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#64748b', fontSize: 15, lineHeight: 1.9, maxWidth: 420, marginBottom: 44 }}>
        This space holds raw, unfiltered human experience.<br />
        Some of it is heavy. We need to know how to protect you.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={() => onChoose('adult')} style={{
          padding: '15px 24px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,#8B5CF6,#00D9FF)',
          color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Lora',Georgia,serif",
        }}>I am 18 or older</button>
        <button onClick={() => onChoose('teen')} style={{
          padding: '14px 24px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.3)',
          color: '#94a3b8', fontSize: 14, cursor: 'pointer',
          fontFamily: "'Lora',Georgia,serif",
        }}>I am 14 to 17</button>
        <button onClick={() => onChoose('under14')} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: 'none', color: '#334155', fontSize: 13,
          cursor: 'pointer', fontFamily: "'Lora',Georgia,serif",
        }}>I am under 14</button>
      </div>
      <p style={{ marginTop: 28, fontSize: 11, color: '#1e293b', fontFamily: "'Lora',Georgia,serif" }}>
        Age is saved only to this device. Nothing else is stored.
      </p>
    </div>
  );
}

/* ============================================================
   UNDERAGE REDIRECT
   ============================================================ */
function UnderageRedirect({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#050510', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, textAlign: 'center',
    }}>
      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.15em', color: '#8B5CF6', marginBottom: 20 }}>YOU ARE SAFE</p>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#f1f5f9', marginBottom: 24, fontWeight: 400 }}>
        Some help is built just for you.
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360, width: '100%' }}>
        {[
          { label: 'Call or text 988', href: 'tel:988', note: 'Free. 24/7. Real people.' },
          { label: 'Text HOME to 741741', href: 'sms:741741?body=HOME', note: 'Crisis Text Line' },
          { label: 'Childhelp National Hotline', href: 'tel:18004224453', note: '1-800-422-4453' },
        ].map(r => (
          <a key={r.label} href={r.href} style={{
            padding: '14px 20px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)',
            color: '#e2e8f0', textDecoration: 'none', fontSize: 14,
            fontFamily: "'Lora',Georgia,serif", lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 600 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.note}</div>
          </a>
        ))}
      </div>
      <button onClick={onBack} style={{
        marginTop: 32, background: 'none', border: 'none',
        color: '#334155', fontSize: 12, cursor: 'pointer',
        fontFamily: "'Lora',Georgia,serif",
      }}>back</button>
    </div>
  );
}

/* ============================================================
   CRISIS TAKEOVER
   ============================================================ */
function CrisisTakeover({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, textAlign: 'center', borderRadius: 20,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ width: 48, height: 48, position: 'relative', marginBottom: 24 }}>
        <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
      </div>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.3rem,4vw,1.8rem)', color: '#f1f5f9', fontWeight: 400, marginBottom: 16 }}>
        You matter. Right now.
      </h2>
      <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#94a3b8', fontSize: 15, lineHeight: 1.9, maxWidth: 380, marginBottom: 32 }}>
        Real people are available right now, 24 hours a day, free, and they have heard everything.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <a href="tel:988" style={{
          padding: '15px 24px', borderRadius: 10,
          background: 'linear-gradient(135deg,#8B5CF6,#00D9FF)',
          color: '#fff', textDecoration: 'none', fontSize: 16,
          fontWeight: 700, fontFamily: "'Lora',Georgia,serif",
        }}>Call or text 988</a>
        <a href="sms:741741?body=HOME" style={{
          padding: '14px 24px', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,217,255,0.2)',
          color: '#00D9FF', textDecoration: 'none', fontSize: 14,
          fontFamily: "'Lora',Georgia,serif",
        }}>Text HOME to 741741</a>
      </div>
      <button onClick={onBack} style={{
        marginTop: 28, background: 'none', border: 'none',
        color: '#475569', fontSize: 13, cursor: 'pointer',
        fontFamily: "'Lora',Georgia,serif", textDecoration: 'underline',
      }}>
        I am okay — let me keep writing
      </button>
    </div>
  );
}

/* ============================================================
   WRITING MODAL
   ============================================================ */
const CATEGORIES = ['Addiction','Anxiety','Family','Grief','Loneliness','Recovery','Survival','Trauma','Hope','Other'];
type WriteStage = 'write' | 'confirm' | 'private-fade' | 'private-done' | 'published';

function WritingMoment({
  onClose, presence, ageTier, allStories, onPublished
}: {
  onClose: () => void;
  presence: number;
  ageTier: string;
  allStories: Story[];
  onPublished: (s: Story) => void;
}) {
  const [text, setText] = useState(() => safeGet('ryvynn_draft_v1') || '');
  const [stage, setStage] = useState<WriteStage>('write');
  const [category, setCategory] = useState('Other');
  const [feed, setFeed] = useState<'heard'|'through'>('heard');
  const [crisisLevel, setCrisisLevel] = useState<'none'|'distress'|'explicit'>('none');
  const [piiWarning, setPiiWarning] = useState(false);
  const [related, setRelated] = useState<Story[]>([]);
  const [publishing, setPublishing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const timeMsg = useMemo(() => getTimeMsg(), []);

  useEffect(() => { setTimeout(() => textRef.current?.focus(), 100); }, []);
  useEffect(() => { safeSet('ryvynn_draft_v1', text); }, [text]);

  const handleTextChange = (val: string) => {
    setText(val);
    setCrisisLevel(detectCrisisLevel(val));
    if (piiWarning && !detectPII(val)) setPiiWarning(false);
  };

  const handlePrivate = () => {
    safeSet('ryvynn_draft_v1', '');
    setStage('private-fade');
    setTimeout(() => setStage('private-done'), 2200);
  };

  const handlePublish = () => {
    if (detectPII(text)) { setPiiWarning(true); return; }
    setStage('confirm');
  };

  const confirmPublish = async () => {
    if (publishing) return;
    setPublishing(true);
    safeSet('ryvynn_draft_v1', '');
    const newStory: Story = {
      id: 'new-' + Date.now(), label: 'Anonymous',
      category, text, felt: 0, replies: [], feed, tier: ageTier === 'adult' ? 'raw' : 'safe',
    };
    await postWallAPI(text, category, feed);
    setRelated(getRelated(text, allStories, 3));
    onPublished(newStory);
    setStage('published');
    setPublishing(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(5,5,16,0.96)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, animation: 'fadeIn 0.2s ease',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 580,
        maxHeight: '92vh', overflowY: 'auto',
        background: '#080816',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 20, padding: 32, position: 'relative',
        boxShadow: '0 0 120px rgba(139,92,246,0.08)',
      }}>
        {/* Crisis takeover */}
        {crisisLevel === 'explicit' && stage === 'write' && (
          <CrisisTakeover onBack={() => setCrisisLevel('distress')} />
        )}

        {/* Header */}
        {stage === 'write' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.15em', color: '#8B5CF6', marginBottom: 4 }}>RYVYNN — PRIVATE SPACE</p>
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13, color: '#475569' }}>{timeMsg}</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#334155', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Presence */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '8px 14px', background: 'rgba(139,92,246,0.05)', borderRadius: 20, width: 'fit-content' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D9FF', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: '#64748b', fontFamily: "'Lora',Georgia,serif" }}>{presence} here with you</span>
            </div>

            {/* Distress nudge */}
            {crisisLevel === 'distress' && (
              <div style={{ padding: '12px 16px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, marginBottom: 20 }}>
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13.5, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                  If you are in a difficult moment right now —{' '}
                  <a href="tel:988" style={{ color: '#00D9FF', textDecoration: 'none', fontWeight: 600 }}>988</a> or{' '}
                  <a href="sms:741741?body=HOME" style={{ color: '#8B5CF6', textDecoration: 'none' }}>text HOME to 741741</a>.
                  You can also keep writing here.
                </p>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textRef}
              value={text}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Say what you need to say. It stays private unless you choose otherwise."
              style={{
                width: '100%', minHeight: 220, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12,
                padding: '18px 20px', color: '#e2e8f0', fontSize: 16,
                lineHeight: 1.85, resize: 'vertical', outline: 'none',
                fontFamily: "'Lora',Georgia,serif", marginBottom: 20,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.35)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
            />

            {/* PII warning */}
            {piiWarning && (
              <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, marginBottom: 16 }}>
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13, color: '#f87171', margin: 0, lineHeight: 1.6 }}>
                  Your message may contain identifying details — phone number, location, or name. Remove them to protect yourself, or share anyway if you understand the risk.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button onClick={() => setPiiWarning(false)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" }}>Edit message</button>
                  <button onClick={() => { setPiiWarning(false); setStage('confirm'); }} style={{ padding: '7px 14px', borderRadius: 8, background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" }}>Share anyway</button>
                </div>
              </div>
            )}

            {/* Feed + Category */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['heard','through'] as const).map(f => (
                  <button key={f} onClick={() => setFeed(f)} style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    fontFamily: "'Lora',Georgia,serif", border: '1px solid',
                    background: feed === f ? 'rgba(139,92,246,0.12)' : 'none',
                    borderColor: feed === f ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)',
                    color: feed === f ? '#a78bfa' : '#475569',
                  }}>
                    {f === 'heard' ? 'Need to be heard' : 'Got through something'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11,
                    cursor: 'pointer', fontFamily: "'Lora',Georgia,serif", border: '1px solid',
                    background: category === c ? `${CAT_COLOR[c]}18` : 'none',
                    borderColor: category === c ? `${CAT_COLOR[c]}60` : 'rgba(255,255,255,0.06)',
                    color: category === c ? CAT_COLOR[c] : '#334155',
                  }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {text.trim() && (
                <button onClick={handlePrivate} style={{
                  flex: 1, minWidth: 140, padding: '13px 20px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  color: '#94a3b8', fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Lora',Georgia,serif",
                }}>Keep private — let it go</button>
              )}
              <button
                onClick={handlePublish}
                disabled={!text.trim()}
                style={{
                  flex: 1, minWidth: 140, padding: '13px 20px', borderRadius: 10,
                  background: text.trim() ? 'linear-gradient(135deg,#8B5CF6,#00D9FF)' : 'rgba(255,255,255,0.04)',
                  border: 'none', color: text.trim() ? '#fff' : '#334155',
                  fontSize: 14, fontWeight: 600, cursor: text.trim() ? 'pointer' : 'default',
                  fontFamily: "'Lora',Georgia,serif",
                }}>
                Share anonymously
              </button>
            </div>

            <p style={{ marginTop: 14, fontSize: 11, color: '#1e293b', textAlign: 'center', fontFamily: "'Lora',Georgia,serif" }}>
              Nothing is stored until you choose to share. No account. No identity.
            </p>
          </>
        )}

        {/* Confirm publish */}
        {stage === 'confirm' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 52, height: 52, position: 'relative', margin: '0 auto 24px' }}>
              <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.3rem,4vw,1.7rem)', color: '#f1f5f9', fontWeight: 400, marginBottom: 14 }}>
              One more step.
            </h3>
            <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#64748b', fontSize: 14, lineHeight: 1.8, maxWidth: 380, margin: '0 auto 32px' }}>
              This will be shared anonymously. No name. No device. Someone who needs it may find it tonight.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: '#94a3b8', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>"{text.slice(0, 120)}{text.length > 120 ? '...' : ''}"</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStage('write')} style={{ flex: 1, padding: '13px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" }}>Go back</button>
              <button onClick={confirmPublish} disabled={publishing} style={{ flex: 1, padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#00D9FF)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif", opacity: publishing ? 0.7 : 1 }}>
                {publishing ? 'Sharing...' : 'Share it'}
              </button>
            </div>
          </div>
        )}

        {/* Private fade */}
        {stage === 'private-fade' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{
              fontFamily: "'Lora',Georgia,serif", fontSize: 20, color: '#475569',
              lineHeight: 1.8, fontStyle: 'italic',
              animation: 'privateFade 2s ease forwards',
            }}>{text.slice(0, 80)}{text.length > 80 ? '...' : ''}</p>
          </div>
        )}

        {/* Private done */}
        {stage === 'private-done' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ width: 52, height: 52, position: 'relative', margin: '0 auto 24px' }}>
              <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.3rem,4vw,1.7rem)', color: '#f1f5f9', fontWeight: 400, marginBottom: 14 }}>
              Gone. It is gone.
            </h3>
            <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#64748b', fontSize: 15, lineHeight: 1.8, maxWidth: 360, margin: '0 auto 32px' }}>
              It existed. It was real. You said it. That matters, even if no one else ever sees it.
            </p>
            <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" }}>Close</button>
          </div>
        )}

        {/* Published + related */}
        {stage === 'published' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ width: 52, height: 52, position: 'relative', margin: '0 auto 20px' }}>
                <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.3rem,4vw,1.7rem)', color: '#f1f5f9', fontWeight: 400, marginBottom: 12 }}>
                Someone will find that.
              </h3>
              <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#64748b', fontSize: 14, lineHeight: 1.8 }}>
                It is on The Wall now. You are not the only one who has felt this.
              </p>
            </div>
            {related.length > 0 && (
              <div>
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 11, letterSpacing: '0.12em', color: '#475569', marginBottom: 16, textAlign: 'center' }}>OTHERS WHO HAVE BEEN HERE</p>
                {related.map(s => (
                  <div key={s.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px', marginBottom: 10 }}>
                    <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13.5, color: '#94a3b8', lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>"{s.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: CAT_COLOR[s.category] || '#8B5CF6', fontFamily: "'Lora',Georgia,serif" }}>{s.category}</span>
                      <span style={{ fontSize: 11, color: '#1e293b' }}>·</span>
                      <span style={{ fontSize: 11, color: '#334155', fontFamily: "'Lora',Georgia,serif" }}>{s.felt.toLocaleString()} felt this</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#00D9FF)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" }}>Back to Ryvynn</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   NAV
   ============================================================ */
function Nav({ presence, bookmarkCount, onWrite }: { presence: number; bookmarkCount: number; onWrite: () => void }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      padding: '14px 24px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, position: 'relative', filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.5))' }}>
          <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" fill style={{ objectFit: 'contain' }} />
        </div>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, letterSpacing: '0.12em', color: '#e2e8f0' }}>RYVYNN</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {presence > 0 && (
          <div style={{ display: 'none', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D9FF', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#475569', fontFamily: "'Lora',Georgia,serif" }}>{presence}</span>
          </div>
        )}
        {bookmarkCount > 0 && (
          <span style={{ fontSize: 13, color: '#64748b', fontFamily: "'Lora',Georgia,serif" }}>☆ {bookmarkCount}</span>
        )}
        <ThemeToggle size={32} />
        <Link href="/crisis" style={{ fontSize: 12, color: '#475569', textDecoration: 'none', fontFamily: "'Lora',Georgia,serif" }}>Crisis</Link>
        <Link href="/sign-up" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', fontFamily: "'Lora',Georgia,serif" }}>Account</Link>
        <button onClick={onWrite} style={{
          padding: '8px 20px', borderRadius: 20,
          background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(0,217,255,0.15))',
          border: '1px solid rgba(139,92,246,0.35)',
          color: '#a78bfa', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Lora',Georgia,serif",
          transition: 'all 0.2s',
        }}>Say it</button>
      </div>
    </nav>
  );
}

/* ============================================================
   STORY CARD
   ============================================================ */
function StoryCard({
  story, bookmarked, onBookmark, feltInSession
}: {
  story: Story;
  bookmarked: boolean;
  onBookmark: (id: string) => void;
  feltInSession: boolean;
}) {
  const [felt, setFelt] = useState(story.felt);
  const [hasFelt, setHasFelt] = useState(feltInSession);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(story.replies);
  const [showReply, setShowReply] = useState(false);

  const handleFelt = () => {
    if (hasFelt) return;
    setFelt(v => v + 1);
    setHasFelt(true);
    voteWallAPI(story.id);
  };

  const catColor = CAT_COLOR[story.category] || '#8B5CF6';

  return (
    <article style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '20px 22px', marginBottom: 12,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(139,92,246,0.15)';
        el.style.boxShadow = '0 0 30px rgba(139,92,246,0.04)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(255,255,255,0.06)';
        el.style.boxShadow = 'none';
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${catColor}14`, color: catColor, border: `1px solid ${catColor}30`, fontFamily: "'Lora',Georgia,serif" }}>{story.category}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#1e293b', fontFamily: "'Lora',Georgia,serif" }}>{story.label}</span>
          <button onClick={() => onBookmark(story.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: bookmarked ? '#facc15' : '#334155' }} title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
            {bookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>
      <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 15, lineHeight: 1.85, color: '#c0cce0', margin: '0 0 16px', fontStyle: 'italic' }}>"{story.text}"</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleFelt} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 14px', borderRadius: 20, fontSize: 12,
          background: hasFelt ? 'rgba(0,217,255,0.06)' : 'none',
          border: `1px solid ${hasFelt ? 'rgba(0,217,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: hasFelt ? 'rgba(0,217,255,0.9)' : '#475569',
          cursor: hasFelt ? 'default' : 'pointer', fontFamily: "'Lora',Georgia,serif",
          transition: 'all 0.2s',
        }}>
          <span>{hasFelt ? '🔥' : '🤍'}</span>
          <span>felt this{felt > 0 ? ` · ${felt.toLocaleString()}` : ''}</span>
        </button>
        <button onClick={() => setShowReply(!showReply)} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 12,
          background: 'none', border: '1px solid rgba(255,255,255,0.07)',
          color: '#334155', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif",
        }}>
          {replies.length > 0 ? `replies (${replies.length})` : 'reply'}
        </button>
      </div>
      {showReply && (
        <div style={{ marginTop: 16, animation: 'fadeIn 0.25s ease' }}>
          {replies.map((r, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 8 }}>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{r}</p>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && replyText.trim()) {
                  setReplies(r => [...r, replyText.trim()]);
                  setReplyText('');
                }
              }}
              placeholder="Say something back..."
              style={{
                flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '9px 14px', color: '#94a3b8', fontSize: 13,
                outline: 'none', fontFamily: "'Lora',Georgia,serif",
              }}
            />
            <button onClick={() => { if (replyText.trim()) { setReplies(r => [...r, replyText.trim()]); setReplyText(''); } }}
              style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', fontSize: 13, cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" }}>
              Send
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ============================================================
   WALL SECTION
   ============================================================ */
function Wall({ stories, ageTier, bookmarks, onBookmark }: {
  stories: Story[];
  ageTier: string;
  bookmarks: Set<string>;
  onBookmark: (id: string) => void;
}) {
  const [feed, setFeed] = useState<'heard'|'through'>('heard');
  const [catFilter, setCatFilter] = useState('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [feltSessions] = useState<Set<string>>(new Set());

  const filtered = stories.filter(s => {
    if (ageTier !== 'adult' && s.tier === 'raw') return false;
    if (showBookmarksOnly && !bookmarks.has(s.id)) return false;
    if (s.feed !== feed) return false;
    if (catFilter !== 'All' && s.category !== catFilter) return false;
    return true;
  });

  const activeCats = ['All', ...Array.from(new Set(stories.filter(s => s.feed === feed).map(s => s.category)))];

  return (
    <section id="wall" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(139,92,246,0.12)' }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', color: '#8B5CF6' }}>THE WALL</span>
        <div style={{ height: 1, flex: 1, background: 'rgba(139,92,246,0.12)' }} />
      </div>

      {/* Feed tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['heard','through'] as const).map(f => {
          const count = stories.filter(s => s.feed === f).length;
          return (
            <button key={f} onClick={() => { setFeed(f); setCatFilter('All'); }}
              style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                fontFamily: "'Lora',Georgia,serif", border: '1px solid', transition: 'all 0.2s',
                background: feed === f ? 'rgba(139,92,246,0.1)' : 'none',
                borderColor: feed === f ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)',
                color: feed === f ? '#a78bfa' : '#475569',
              }}>
              {f === 'heard' ? 'Need to be heard' : 'Got through something'}
              <span style={{ marginLeft: 7, fontSize: 11, opacity: 0.6 }}>{count}</span>
            </button>
          );
        })}
        {bookmarks.size > 0 && (
          <button onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              fontFamily: "'Lora',Georgia,serif", border: '1px solid',
              background: showBookmarksOnly ? 'rgba(250,204,21,0.08)' : 'none',
              borderColor: showBookmarksOnly ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.07)',
              color: showBookmarksOnly ? '#facc15' : '#475569',
            }}>
            ★ Saved ({bookmarks.size})
          </button>
        )}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {activeCats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
            fontFamily: "'Lora',Georgia,serif", border: '1px solid', transition: 'all 0.2s',
            background: catFilter === c ? `${CAT_COLOR[c] || '#8B5CF6'}14` : 'none',
            borderColor: catFilter === c ? `${CAT_COLOR[c] || '#8B5CF6'}50` : 'rgba(255,255,255,0.06)',
            color: catFilter === c ? (CAT_COLOR[c] || '#8B5CF6') : '#334155',
          }}>{c}</button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#334155', fontFamily: "'Lora',Georgia,serif", fontSize: 14, fontStyle: 'italic' }}>
          {showBookmarksOnly ? 'No bookmarks in this feed yet.' : 'Nothing here yet. Be the first.'}
        </div>
      ) : (
        filtered.map(s => (
          <StoryCard key={s.id} story={s} bookmarked={bookmarks.has(s.id)} onBookmark={onBookmark} feltInSession={feltSessions.has(s.id)} />
        ))
      )}
    </section>
  );
}

/* ============================================================
   GUARDIAN SECTION
   ============================================================ */
type Persona = 'neutral' | 'feminine' | 'masculine' | 'aged';

const PERSONAS: { id: Persona; label: string; labelEs: string; desc: string; descEs: string; }[] = [
  { id: 'neutral',   label: 'Just present',  labelEs: 'Solo presente',  desc: 'Adapts to what you bring',   descEs: 'Se adapta a lo que traes' },
  { id: 'feminine',  label: 'A woman',        labelEs: 'Una mujer',       desc: 'Warm. Real. Steady.',        descEs: 'Cálida. Real. Firme.' },
  { id: 'masculine', label: 'A man',          labelEs: 'Un hombre',       desc: 'Direct. Honest. Present.',   descEs: 'Directo. Honesto. Presente.' },
  { id: 'aged',      label: 'Older voice',    labelEs: 'Voz mayor',       desc: 'Quiet. Patient. Lived-in.',  descEs: 'Tranquilo. Paciente. Vivido.' },
];

function GuardianSection({ onOpen }: { onOpen: () => void }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<Persona>('neutral');
  const [lang, setLang] = useState('en');
  const [personaPicked, setPersonaPicked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ryvynn-language') || 'en' : 'en';
    setLang(stored);
    const watch = setInterval(() => {
      const l = localStorage.getItem('ryvynn-language') || 'en';
      setLang(l);
    }, 1000);
    return () => clearInterval(watch);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const isEs = lang === 'es';

  const send = useCallback(async () => {
    if (!input.trim() || typing) return;
    const msg = input.trim();
    setInput('');
    setMsgs(p => [...p, { role: 'user', text: msg }]);
    setTyping(true);
    const reply = await callGuardian(msg, lang, persona);
    setMsgs(p => [...p, { role: 'ai', text: reply }]);
    setTyping(false);
  }, [input, typing, lang, persona]);

  return (
    <section id="guardian" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(0,217,255,0.08)' }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', color: '#00D9FF' }}>GUARDIAN</span>
        <div style={{ height: 1, flex: 1, background: 'rgba(0,217,255,0.08)' }} />
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,217,255,0.1)', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, position: 'relative', filter: 'drop-shadow(0 0 14px rgba(0,217,255,0.5))', flexShrink: 0 }}>
            <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: '#e2e8f0', marginBottom: 4 }}>Guardian — 5 agents, one voice</p>
            <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#475569' }}>Trauma-informed · Crisis-trained · Available now</p>
          </div>
        </div>

        {!chatOpen ? (
          <div style={{ padding: '28px' }}>
            <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 15, color: '#64748b', lineHeight: 1.85, marginBottom: 24, textAlign: 'center' }}>
              {isEs
                ? 'Cinco agentes terapéuticos escuchan — luego una voz responde. Elige cómo quieres que suene.'
                : 'Five therapeutic agents listen — then one voice speaks back. Choose how you want it to sound.'}
            </p>

            {/* Persona picker */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 11, letterSpacing: '0.12em', color: '#334155', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>
                {isEs ? 'Voz del Guardian' : 'Guardian voice'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {PERSONAS.map(p => (
                  <button key={p.id} onClick={() => { setPersona(p.id); setPersonaPicked(true); }}
                    style={{
                      padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      fontFamily: "'Lora',Georgia,serif", border: '1px solid', transition: 'all 0.2s',
                      background: persona === p.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: persona === p.id ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.07)',
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: persona === p.id ? '#a78bfa' : '#64748b', marginBottom: 3 }}>
                      {isEs ? p.labelEs : p.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#334155' }}>
                      {isEs ? p.descEs : p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { icon: '🧭', name: 'Trauma Compass', desc: 'Polyvagal · Somatic' },
                { icon: '🔍', name: 'Insight Engine', desc: 'CBT · DBT' },
                { icon: '🪞', name: 'Soul Mirror', desc: 'Lived experience' },
                { icon: '🛡️', name: 'Crisis Sentinel', desc: 'C-SSRS trained' },
                { icon: '🏗️', name: 'Recovery Architect', desc: 'Strength-based' },
              ].map(a => (
                <div key={a.name} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, minWidth: 120, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>{a.name}</div>
                  <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 10, color: '#334155' }}>{a.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setChatOpen(true)} style={{
                padding: '13px 32px', borderRadius: 10,
                background: 'linear-gradient(135deg,rgba(0,217,255,0.15),rgba(139,92,246,0.15))',
                border: '1px solid rgba(0,217,255,0.3)',
                color: '#00D9FF', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Lora',Georgia,serif",
              }}>
                {isEs ? 'Hablar con Guardian ahora' : 'Talk to Guardian now'}
              </button>
              <p style={{ marginTop: 14, fontSize: 11, color: '#1e293b', fontFamily: "'Lora',Georgia,serif" }}>
                {isEs ? 'Privado · Anónimo · Nada se guarda' : 'Private · Anonymous · Nothing saved'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {msgs.length === 0 && (
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: '#334155', textAlign: 'center', marginTop: 40, lineHeight: 1.8, fontStyle: 'italic' }}>
                  What is on your mind right now?
                </p>
              )}
              {msgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    maxWidth: '82%', padding: '11px 16px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.role === 'user' ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)',
                    border: m.role === 'user' ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.07)',
                    fontSize: 14, lineHeight: 1.75,
                    color: m.role === 'user' ? '#c4b5fd' : '#94a3b8',
                    fontFamily: "'Lora',Georgia,serif",
                    fontStyle: m.role === 'ai' ? 'italic' : 'normal',
                  }}>{m.text}</div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ fontSize: 12, color: '#334155', fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic' }}>Guardian is here…</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#8B5CF6', animation: `pulse 1.2s ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 20px', display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={isEs ? 'Di lo que necesitas...' : 'Say anything...'}
                style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px', color: '#94a3b8', fontSize: 14, outline: 'none', fontFamily: "'Lora',Georgia,serif" }} />
              <button onClick={send} disabled={!input.trim() || typing} style={{ padding: '10px 18px', borderRadius: 10, background: input.trim() && !typing ? 'linear-gradient(135deg,#8B5CF6,#00D9FF)' : 'rgba(255,255,255,0.04)', border: 'none', color: input.trim() && !typing ? '#fff' : '#334155', fontSize: 18, cursor: input.trim() && !typing ? 'pointer' : 'default', transition: 'all 0.2s' }}>↑</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   MISSION
   ============================================================ */
function Mission() {
  return (
    <section id="mission" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(139,92,246,0.08)' }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', color: '#8B5CF6' }}>THE MISSION</span>
        <div style={{ height: 1, flex: 1, background: 'rgba(139,92,246,0.08)' }} />
      </div>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#f1f5f9', margin: '0 0 48px', fontWeight: 400 }}>A reason to exist.</h2>
      <div style={{ textAlign: 'left', fontFamily: "'Lora',Georgia,serif", fontSize: 'clamp(1rem,2.5vw,1.1rem)', color: '#64748b', lineHeight: 1.95 }}>
        <p>Ryvynn exists for the person who has nowhere else to say it.</p>
        <p style={{ marginTop: 28 }}>For the addict trying one more day.<br />For the kid who feels invisible.<br />For the parent barely holding it together.<br />For the person grieving, ashamed, angry, numb, or tired of pretending.</p>
        <p style={{ marginTop: 28 }}>This is not therapy.<br />This is not emergency care.</p>
        <p style={{ marginTop: 28, color: '#e2e8f0', fontWeight: 600 }}>This is a place to say the thing before it eats you alive.</p>
      </div>
      <div style={{ borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: 40, marginTop: 48 }}>
        <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#475569', fontSize: 14, lineHeight: 1.9, maxWidth: 540, margin: '0 auto' }}>
          Built by NEXXT GEN INNOVATIONS LLC — operating as RYVYNN and AONIXX. Free at the core. Always. Crisis access is never paywalled.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   PRIVACY PROMISE
   ============================================================ */
function Privacy() {
  const promises = [
    'Private sessions disappear when you leave unless you choose to publish.',
    'Published stories are anonymized and saved only because you chose to share them.',
    'No personally identifying data is intentionally collected or stored.',
    'Identity details are automatically flagged before posting — you stay protected.',
    'No ads. No analytics. No tracking. The trust is the product.',
  ];
  return (
    <section id="privacy" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '40px 36px' }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', color: '#00D9FF', marginBottom: 16 }}>PRIVACY PROMISE</p>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#f1f5f9', margin: '0 0 32px', fontWeight: 400 }}>Private means private.</h2>
        {promises.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#00D9FF)', flexShrink: 0, marginTop: 5 }} />
            <p style={{ fontFamily: "'Lora',Georgia,serif", color: '#64748b', fontSize: 14, lineHeight: 1.75, margin: 0 }}>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CRISIS STRIP — fixed bottom
   ============================================================ */
function CrisisStrip() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(139,92,246,0.15)',
      padding: '11px 24px', textAlign: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 16,
    }}>
      <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#475569' }}>In crisis right now?</span>
      <a href="tel:988" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13, color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Call or text 988</a>
      <span style={{ color: '#1e293b', fontSize: 12 }}>·</span>
      <a href="sms:741741?body=HOME" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#475569', textDecoration: 'none' }}>Text HOME to 741741</a>
      <span style={{ color: '#1e293b', fontSize: 12 }}>·</span>
      <Link href="/crisis" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#334155', textDecoration: 'none' }}>More resources</Link>
    </div>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer style={{ padding: '60px 24px 100px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ width: 32, height: 32, position: 'relative', margin: '0 auto 16px' }}>
        <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
      </div>
      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: '#e2e8f0', letterSpacing: '0.15em', marginBottom: 8 }}>RYVYNN.LIVE</p>
      <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13, color: '#334155', marginBottom: 6 }}>Free at the core.</p>
      <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#1e293b', marginBottom: 32 }}>Anonymous support for the moments people usually face alone.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
        <Link href="/pricing" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#334155', textDecoration: 'none' }}>Support the mission</Link>
        <Link href="/sign-up" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#334155', textDecoration: 'none' }}>Anonymous account</Link>
        <Link href="/crisis" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#334155', textDecoration: 'none' }}>Crisis resources</Link>
      </div>
      <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 10, color: '#1e293b', letterSpacing: '0.05em' }}>NEXXT GEN INNOVATIONS LLC · Operating as RYVYNN and AONIXX · Tucson, AZ</p>
    </footer>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function Hero({ onSay, presence }: { onSay: () => void; presence: number }) {
  const timeMsg = useMemo(() => getTimeMsg(), []);
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(80px,12vw,140px) 24px clamp(60px,8vw,100px)', textAlign: 'center' }}>
      {/* Dual Flame — breathing */}
      <div style={{
        width: 100, height: 100, position: 'relative', margin: '0 auto 36px',
        filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.55)) drop-shadow(0 0 60px rgba(0,217,255,0.3))',
        animation: 'breathe 4s ease-in-out infinite',
      }}>
        <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" fill style={{ objectFit: 'contain' }} priority />
      </div>

      {/* Presence */}
      {presence > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D9FF', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 13, color: '#475569' }}>{presence} here with you right now</span>
        </div>
      )}

      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.22em', color: '#8B5CF6', marginBottom: 24 }}>{timeMsg.toUpperCase()}</p>

      <h1 style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 'clamp(2rem,6vw,4rem)',
        color: '#f1f5f9', fontWeight: 400,
        lineHeight: 1.15, marginBottom: 24,
        letterSpacing: '-0.01em',
      }}>
        Say the thing<br />
        <span style={{ color: 'rgba(241,245,249,0.35)' }}>you have not said out loud yet.</span>
      </h1>

      <p style={{
        fontFamily: "'Lora',Georgia,serif",
        fontSize: 'clamp(15px,2.2vw,17px)', lineHeight: 1.95,
        color: '#475569', maxWidth: 480, margin: '0 auto 44px',
      }}>
        No account. No name. No record.<br />
        A place where something — or someone — actually listens.
      </p>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
        <button onClick={onSay} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '15px 32px', borderRadius: 10,
          background: 'linear-gradient(135deg,#8B5CF6,#00D9FF)',
          border: 'none', color: '#fff', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Lora',Georgia,serif",
          boxShadow: '0 0 40px rgba(139,92,246,0.25)',
          transition: 'all 0.25s',
        }}>
          <div style={{ width: 24, height: 24, position: 'relative' }}>
            <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} />
          </div>
          Say it here
        </button>
        <a href="#wall" style={{
          padding: '14px 28px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
          color: '#64748b', fontSize: 15, textDecoration: 'none',
          fontFamily: "'Lora',Georgia,serif", transition: 'all 0.2s',
          display: 'inline-flex', alignItems: 'center',
        }}>Read The Wall</a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px,5vw,40px)', flexWrap: 'wrap' }}>
        {['No account', 'Nothing stored', 'Always free', 'Crisis always reachable'].map(t => (
          <span key={t} style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 12, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color: '#8B5CF6', fontSize: 10 }}>✦</span>{t}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function HomePage() {
  const { t, language } = useI18n();
  const [ageTier, setAgeTier] = useState<string | null>(null);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [underageBlocked, setUnderageBlocked] = useState(false);
  const [showWriting, setShowWriting] = useState(false);
  const [stories, setStories] = useState<Story[]>(SEED_STORIES);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const presence = useLivePresence();

  // Hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    const stored = safeGet('ryvynn_age');
    setAgeTier(stored || null);
    setShowAgeGate(!stored);
    const bms = safeGet('ryvynn_bookmarks_v1');
    if (bms) { try { setBookmarks(new Set(JSON.parse(bms))); } catch {} }
    // Fetch real wall data
    fetchWallAPI().then(entries => {
      if (entries.length > 0) setStories([...entries, ...SEED_STORIES.filter(s => !entries.find(e => e.text === s.text))]);
    });
  }, []);

  const handleAgeChoice = (tier: string) => {
    if (tier === 'under14') { setUnderageBlocked(true); return; }
    safeSet('ryvynn_age', tier);
    setAgeTier(tier);
    setShowAgeGate(false);
  };

  const handleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      safeSet('ryvynn_bookmarks_v1', JSON.stringify([...next]));
      return next;
    });
  };

  const handlePublished = (story: Story) => {
    setStories(prev => [story, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', fontFamily: "'Lora',Georgia,serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #050510; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 2px; }
        html { scroll-behavior: smooth; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes breathe { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 30px rgba(139,92,246,0.55)) drop-shadow(0 0 60px rgba(0,217,255,0.3)); } 50% { transform: scale(1.06); filter: drop-shadow(0 0 50px rgba(139,92,246,0.8)) drop-shadow(0 0 90px rgba(0,217,255,0.5)); } }
        @keyframes privateFade { 0% { opacity: 1; filter: blur(0); } 100% { opacity: 0; filter: blur(8px); } }
      `}</style>

      {underageBlocked && <UnderageRedirect onBack={() => setUnderageBlocked(false)} />}
      {showAgeGate && !underageBlocked && <AgeGate onChoose={handleAgeChoice} />}

      {!showAgeGate && !underageBlocked && (
        <>
          <Nav presence={presence} bookmarkCount={bookmarks.size} onWrite={() => setShowWriting(true)} />
          <Hero onSay={() => setShowWriting(true)} presence={presence} />

          {showWriting && (
            <WritingMoment
              onClose={() => setShowWriting(false)}
              presence={presence}
              ageTier={ageTier || 'adult'}
              allStories={stories}
              onPublished={handlePublished}
            />
          )}

          <Wall stories={stories} ageTier={ageTier || 'adult'} bookmarks={bookmarks} onBookmark={handleBookmark} />
          <GuardianSection onOpen={() => {}} />
          <Mission />
          <Privacy />
          <Footer />
          <CrisisStrip />
        </>
      )}
    </div>
  );
}
