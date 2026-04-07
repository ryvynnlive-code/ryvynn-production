'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ───────────────────────────────────────────────────────────────────
interface WallEntry {
  id: string;
  confession: string;
  transformation: string;
  votes: number;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

// ─── Guardian API ─────────────────────────────────────────────────────────────
async function getGuardianResponse(msg: string): Promise<string | null> {
  try {
    const res = await fetch('/api/guardian/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error('err');
    const data = await res.json();
    return data.response ?? null;
  } catch {
    return null;
  }
}

// ─── Wall API ─────────────────────────────────────────────────────────────────
async function fetchWallEntries(limit = 10): Promise<WallEntry[]> {
  try {
    const res = await fetch(`/api/wall?limit=${limit}&sortBy=recent`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries ?? [];
  } catch {
    return [];
  }
}

async function postToWall(text: string): Promise<{ success: boolean; blocked?: boolean }> {
  try {
    const res = await fetch('/api/wall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confession: text, isAnonymous: true }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

async function voteWallEntry(entryId: string): Promise<void> {
  try {
    await fetch('/api/wall', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId }),
    });
  } catch {}
}

// ─── LOGO COMPONENT ───────────────────────────────────────────────────────────
function FlameImage({
  size = 48,
  glow = true,
  pulse = false,
}: {
  size?: number;
  glow?: boolean;
  pulse?: boolean;
}) {
  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      filter: glow
        ? 'drop-shadow(0 0 10px rgba(0,201,232,0.45)) drop-shadow(0 0 20px rgba(124,92,191,0.3))'
        : 'none',
      animation: pulse ? 'breathe 3.5s ease-in-out infinite' : 'none',
      flexShrink: 0,
    }}>
      <Image
        src="/assets/dual-flame-logo.png"
        alt="RYVYNN Dual Flame"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
}

// ─── LIVE FEED CARD ───────────────────────────────────────────────────────────
function FeedCard({ text, isNew }: { text: string; isNew: boolean }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(0,201,232,0.1)',
      borderRadius: 12,
      padding: '13px 16px',
      marginBottom: 8,
      animation: isNew ? 'slideIn .5s ease forwards' : 'none',
    }}>
      <p style={{
        margin: 0,
        fontSize: 13.5,
        lineHeight: 1.65,
        color: 'rgba(216,224,238,0.72)',
        fontStyle: 'italic',
        fontFamily: "'Lora', Georgia, serif",
      }}>
        "{text}"
      </p>
    </div>
  );
}

// ─── WALL CARD ────────────────────────────────────────────────────────────────
function WallCard({
  entry,
  onVote,
}: {
  entry: WallEntry;
  onVote: (id: string) => void;
}) {
  const [reflected, setReflected]       = useState(false);
  const [reflectedText, setReflectedText] = useState('');
  const [reflecting, setReflecting]     = useState(false);
  const [feltVoted, setFeltVoted]       = useState(false);
  const [localVotes, setLocalVotes]     = useState(entry.votes);

  const handleReflect = async () => {
    setReflecting(true);
    const res = await getGuardianResponse(
      `In 1-2 warm, human sentences respond to what this person shared. Don't give advice. Don't ask questions. Just acknowledge: "${entry.confession}"`
    );
    setReflectedText(
      res ?? "What you're carrying is real. You're not alone in it."
    );
    setReflected(true);
    setReflecting(false);
  };

  const handleFeltThis = () => {
    if (feltVoted) return;
    setFeltVoted(true);
    setLocalVotes(v => v + 1);
    onVote(entry.id);
  };

  const text = entry.transformation || entry.confession;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 12,
        transition: 'border-color .25s ease',
      }}
      onMouseEnter={e =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          'rgba(0,201,232,0.18)')
      }
      onMouseLeave={e =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          'rgba(255,255,255,0.07)')
      }
    >
      <p style={{
        margin: '0 0 14px 0',
        fontSize: 14,
        lineHeight: 1.8,
        color: 'rgba(216,224,238,0.82)',
        fontFamily: "'Lora', Georgia, serif",
      }}>
        {text}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleFeltThis}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none',
            border: `1px solid ${feltVoted ? 'rgba(0,201,232,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 20,
            padding: '5px 12px',
            color: feltVoted ? 'rgba(0,201,232,0.9)' : 'rgba(255,255,255,0.35)',
            fontSize: 12,
            cursor: feltVoted ? 'default' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all .2s ease',
          }}
        >
          <span style={{ fontSize: 13 }}>{feltVoted ? '🔥' : '🤍'}</span>
          <span>felt this{localVotes > 0 ? ` · ${localVotes}` : ''}</span>
        </button>

        {!reflected && !reflecting && (
          <button
            onClick={handleReflect}
            style={{
              background: 'none',
              border: '1px solid rgba(124,92,191,0.25)',
              borderRadius: 20,
              padding: '5px 12px',
              color: 'rgba(124,92,191,0.7)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all .2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget).style.borderColor = 'rgba(124,92,191,0.55)';
              (e.currentTarget).style.color = 'rgba(124,92,191,1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget).style.borderColor = 'rgba(124,92,191,0.25)';
              (e.currentTarget).style.color = 'rgba(124,92,191,0.7)';
            }}
          >
            Let RYVYNN reflect this
          </button>
        )}

        {reflecting && (
          <span style={{
            fontSize: 12,
            color: 'rgba(0,201,232,0.5)',
            fontStyle: 'italic',
          }}>
            Ryvynn is here…
          </span>
        )}
      </div>

      {reflected && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          background: 'rgba(0,201,232,0.05)',
          border: '1px solid rgba(0,201,232,0.12)',
          borderRadius: 10,
          animation: 'fi .5s ease forwards',
        }}>
          <p style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.7,
            color: 'rgba(0,201,232,0.85)',
            fontStyle: 'italic',
            fontFamily: "'Lora', Georgia, serif",
          }}>
            {reflectedText}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── CHAT OVERLAY ─────────────────────────────────────────────────────────────
function ChatOverlay({
  onShare,
  onClose,
}: {
  onShare: (text: string) => Promise<void>;
  onClose: () => void;
}) {
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [input, setInput]                   = useState('');
  const [typing, setTyping]                 = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [lastUserMsg, setLastUserMsg]       = useState('');
  const [sharing, setSharing]               = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = useCallback(async () => {
    if (!input.trim() || typing) return;
    const msg = input.trim();
    setLastUserMsg(msg);
    setInput('');
    setShowSharePrompt(false);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);

    const res = await getGuardianResponse(msg);
    const reply = res ?? "I'm right here. Take a breath. What's going on?";
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setTyping(false);
    setShowSharePrompt(true);
  }, [input, typing]);

  const handleShare = async () => {
    setSharing(true);
    await onShare(lastUserMsg);
    setSharing(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fi .25s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 540,
        height: '84vh', maxHeight: 660,
        background: '#07080f',
        border: '1px solid rgba(0,201,232,0.2)',
        borderRadius: 20,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 0 100px rgba(0,201,232,0.06)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlameImage size={36} glow pulse />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#d8e0ee' }}>
                Guardian
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(0,201,232,0.6)' }}>
                Anonymous · Nothing saved · Safe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              fontSize: 24, lineHeight: 1, padding: 4, fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.length === 0 && (
            <div style={{
              margin: 'auto', textAlign: 'center', padding: 24,
            }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <FlameImage size={52} glow pulse />
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.3)', fontSize: 14,
                lineHeight: 1.8, fontStyle: 'italic',
                fontFamily: "'Lora', Georgia, serif",
              }}>
                You don't have to explain yourself.<br />
                Just say what's there.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fi .4s ease',
              }}
            >
              {m.role === 'ai' && (
                <div style={{ marginRight: 8, marginTop: 2, flexShrink: 0 }}>
                  <FlameImage size={20} glow={false} />
                </div>
              )}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius:
                  m.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                background:
                  m.role === 'user'
                    ? 'rgba(0,201,232,0.1)'
                    : 'rgba(255,255,255,0.05)',
                border:
                  m.role === 'user'
                    ? '1px solid rgba(0,201,232,0.2)'
                    : '1px solid rgba(255,255,255,0.07)',
                fontSize: 14,
                lineHeight: 1.65,
                color: m.role === 'user' ? 'rgba(216,224,238,0.92)' : 'rgba(216,224,238,0.8)',
                fontFamily: m.role === 'ai' ? "'Lora', Georgia, serif" : 'inherit',
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'fi .3s ease',
            }}>
              <FlameImage size={20} glow={false} />
              <div style={{
                padding: '10px 16px',
                borderRadius: '14px 14px 14px 4px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                fontSize: 13,
                color: 'rgba(0,201,232,0.6)',
                fontStyle: 'italic',
              }}>
                Ryvynn is here…
              </div>
            </div>
          )}

          {/* Share prompt */}
          {showSharePrompt && !typing && messages.length >= 2 && (
            <div style={{
              background: 'rgba(124,92,191,0.07)',
              border: '1px solid rgba(124,92,191,0.18)',
              borderRadius: 14,
              padding: '16px 18px',
              textAlign: 'center',
              animation: 'fi .6s ease forwards',
            }}>
              <p style={{
                margin: '0 0 14px 0', fontSize: 13,
                color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
              }}>
                Share this so someone else knows they're not alone?
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  style={{
                    padding: '8px 18px', borderRadius: 20,
                    border: '1px solid rgba(0,201,232,0.35)',
                    background: 'rgba(0,201,232,0.08)',
                    color: 'rgba(0,201,232,0.9)',
                    fontSize: 12.5, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all .2s ease',
                    opacity: sharing ? 0.6 : 1,
                  }}
                >
                  {sharing ? 'Sharing…' : 'Share anonymously'}
                </button>
                <button
                  onClick={() => setShowSharePrompt(false)}
                  style={{
                    padding: '8px 18px', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Keep private
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: 10, alignItems: 'flex-end',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Say anything. You're safe here."
            rows={2}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12,
              padding: '10px 13px',
              color: '#d8e0ee',
              fontSize: 14, resize: 'none', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.55,
              transition: 'border-color .2s ease',
            }}
            onFocus={e =>
              ((e.target as HTMLElement).style.borderColor =
                'rgba(0,201,232,0.3)')
            }
            onBlur={e =>
              ((e.target as HTMLElement).style.borderColor =
                'rgba(255,255,255,0.09)')
            }
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            style={{
              width: 40, height: 40,
              borderRadius: 12,
              background:
                input.trim() && !typing
                  ? 'linear-gradient(135deg,rgba(0,201,232,0.25),rgba(124,92,191,0.25))'
                  : 'rgba(255,255,255,0.04)',
              border: `1px solid ${input.trim() && !typing ? 'rgba(0,201,232,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color:
                input.trim() && !typing
                  ? 'rgba(0,201,232,0.9)'
                  : 'rgba(255,255,255,0.2)',
              fontSize: 18, cursor: input.trim() && !typing ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all .2s ease',
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { language } = useI18n();

  // Feed state
  const [feedItems, setFeedItems]   = useState<WallEntry[]>([]);
  const [newFeedIds, setNewFeedIds] = useState<string[]>([]);

  // Wall state
  const [wallEntries, setWallEntries] = useState<WallEntry[]>([]);
  const [wallTab, setWallTab]         = useState<'heard' | 'through'>('heard');
  const [wallLoading, setWallLoading] = useState(true);
  const [wallCount, setWallCount]     = useState<number | null>(null);

  // UI state
  const [chatOpen, setChatOpen]       = useState(false);
  const [showFloat, setShowFloat]     = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Seed fallback entries while real data loads
  const SEED_FEED = [
    "I feel like I'm falling apart and nobody around me knows.",
    "I made it through today. That's enough.",
    "I don't think anyone would understand this even if I tried.",
    "Three years sober. Nobody in my life knows what that cost me.",
    "I smiled at work all day and cried the entire drive home.",
    "I finally said no to something that was destroying me. First time ever.",
    "I carry something I've never said out loud to anyone. Not once.",
  ];

  // Load wall entries
  useEffect(() => {
    setWallLoading(true);
    fetchWallEntries(20).then(entries => {
      setWallEntries(entries);
      setWallCount(entries.length);

      // Seed live feed from real entries
      if (entries.length > 0) {
        setFeedItems(entries.slice(0, 5));
      }
      setWallLoading(false);
    });
  }, []);

  // Rotate live feed every 5s
  useEffect(() => {
    const allTexts = wallEntries.length > 0
      ? wallEntries.map(e => e.confession || e.transformation)
      : SEED_FEED;

    if (allTexts.length === 0) return;

    const interval = setInterval(() => {
      const randomText = allTexts[Math.floor(Math.random() * allTexts.length)];
      const tempId = `feed-${Date.now()}`;
      const newItem: WallEntry = {
        id: tempId,
        confession: randomText,
        transformation: randomText,
        votes: 0,
        created_at: new Date().toISOString(),
      };
      setNewFeedIds(prev => [...prev, tempId]);
      setFeedItems(prev => [newItem, ...prev.slice(0, 4)]);
      setTimeout(() => setNewFeedIds(prev => prev.filter(id => id !== tempId)), 800);
    }, 5000);

    return () => clearInterval(interval);
  }, [wallEntries]);

  // Float CTA + onboarding
  useEffect(() => {
    const t = setTimeout(() => setShowFloat(true), 9000);
    const seen = localStorage.getItem('ryvynn-onboarded');
    if (!seen) setShowOnboarding(true);
    return () => clearTimeout(t);
  }, []);

  const handleShare = useCallback(async (text: string) => {
    const result = await postToWall(text);
    if (result.success && !result.blocked) {
      const newEntry: WallEntry = {
        id: `new-${Date.now()}`,
        confession: text,
        transformation: text,
        votes: 0,
        created_at: new Date().toISOString(),
      };
      setWallEntries(prev => [newEntry, ...prev]);
      setFeedItems(prev => [newEntry, ...prev.slice(0, 4)]);
    }
    setChatOpen(false);
  }, []);

  const handleVote = useCallback((entryId: string) => {
    voteWallEntry(entryId);
  }, []);

  // Wall tab filtering — simple heuristic:
  // entries with hope/survival keywords → "through" | rest → "heard"
  const THROUGH_KEYWORDS = /\b(sober|got through|made it|better|survived|finally|recovery|healed|grateful|proud|won|strength|hope)\b/i;
  const filteredWall = wallEntries.filter(e => {
    const text = (e.confession || e.transformation || '').toLowerCase();
    return wallTab === 'through'
      ? THROUGH_KEYWORDS.test(text)
      : !THROUGH_KEYWORDS.test(text);
  });

  return (
    <main
      className="min-h-screen bg-[#07080f] text-[#d8e0ee]"
      style={{ fontFamily: "'Inter',system-ui,sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        :root {
          --cyan: #00C9E8;
          --purple: #7C5CBF;
          --dim: #636e84;
          --dimmer: #3a4352;
          --card: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --border-cyan: rgba(0,201,232,0.22);
        }

        * { box-sizing: border-box; }

        @keyframes fi {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes gradShift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,201,232,0.4); }
          60%     { box-shadow: 0 0 0 10px rgba(0,201,232,0); }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,201,232,0.18); border-radius: 2px; }

        ::placeholder { color: rgba(255,255,255,0.25); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,201,232,0.1); border: 1.5px solid var(--cyan);
          border-radius: 99px; padding: 13px 28px;
          color: var(--cyan); font-size: 15px; font-weight: 500;
          cursor: pointer; text-decoration: none; font-family: inherit;
          transition: all .2s ease;
          box-shadow: 0 0 20px rgba(0,201,232,0.08);
        }
        .btn-primary:hover {
          background: rgba(0,201,232,0.18);
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(0,201,232,0.16);
        }
        .btn-ghost {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 99px; padding: 11px 22px;
          color: var(--dim); font-size: 14px; cursor: pointer;
          font-family: inherit; transition: all .2s ease; text-decoration: none;
          display: inline-block;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #d8e0ee; }
      `}</style>

      {/* ── CHAT OVERLAY ─────────────────────────────────────────────── */}
      {chatOpen && (
        <ChatOverlay
          onShare={handleShare}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* ── ONBOARDING OVERLAY ──────────────────────────────────────── */}
      {showOnboarding && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 900,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fi .3s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: 400,
            background: '#0a0c14',
            border: '1px solid rgba(0,201,232,0.18)',
            borderRadius: 20, padding: '36px 28px',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <FlameImage size={72} glow pulse />
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 500, marginBottom: 10,
              fontFamily: "'Lora', Georgia, serif",
            }}>
              What brings you here?
            </h2>
            <p style={{
              fontSize: 14, color: 'var(--dim)',
              lineHeight: 1.7, marginBottom: 28,
            }}>
              No wrong answer. Nothing saved.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                {
                  label: 'Get it out',
                  sub: 'Talk to Guardian. Private. Anonymous. Nothing saved.',
                  color: 'rgba(0,201,232,.12)',
                  border: 'rgba(0,201,232,.3)',
                  text: '#00C9E8',
                  action: () => {
                    localStorage.setItem('ryvynn-onboarded', '1');
                    setShowOnboarding(false);
                    setChatOpen(true);
                  },
                },
                {
                  label: 'Be heard',
                  sub: 'Leave something on the wall. Or read what others left.',
                  color: 'rgba(124,92,191,.1)',
                  border: 'rgba(124,92,191,.28)',
                  text: '#7C5CBF',
                  action: () => {
                    localStorage.setItem('ryvynn-onboarded', '1');
                    setShowOnboarding(false);
                    document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' });
                  },
                },
                {
                  label: 'Just read',
                  sub: "See what others are carrying. No pressure.",
                  color: 'rgba(255,255,255,.03)',
                  border: 'rgba(255,255,255,.1)',
                  text: '#d8e0ee',
                  action: () => {
                    localStorage.setItem('ryvynn-onboarded', '1');
                    setShowOnboarding(false);
                    document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' });
                  },
                },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  style={{
                    display: 'block', width: '100%',
                    padding: '16px 20px', textAlign: 'left',
                    background: opt.color,
                    border: `1.5px solid ${opt.border}`,
                    borderRadius: 14,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all .15s ease',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.transform = 'none')
                  }
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: opt.text, marginBottom: 4 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--dim)' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                localStorage.setItem('ryvynn-onboarded', '1');
                setShowOnboarding(false);
              }}
              style={{
                marginTop: 20, background: 'none', border: 'none',
                color: 'var(--dimmer)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Skip — just show me the site
            </button>
          </div>
        </div>
      )}

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '12px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(7,8,15,0.85)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FlameImage size={36} glow />
          <span style={{
            fontSize: 18, fontWeight: 600, letterSpacing: '0.06em',
            background: 'linear-gradient(135deg, #00C9E8 0%, #7C5CBF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            RYVYNN
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/wall" style={{
            color: 'var(--dim)', fontSize: 13, textDecoration: 'none',
            transition: 'color .15s',
          }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = '#00C9E8')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--dim)')}
          >
            The Wall
          </Link>
          <button
            onClick={() => setChatOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            Start talking
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 48,
        maxWidth: 1160,
        margin: '0 auto',
        padding: '120px 40px 80px',
        alignItems: 'center',
      }}>
        {/* LEFT — Text */}
        <div style={{ animation: 'fi .8s ease forwards' }}>
          {/* Active badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            background: 'rgba(0,201,232,0.07)',
            border: '1px solid rgba(0,201,232,0.14)',
            borderRadius: 20, marginBottom: 28,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#00C9E8',
              animation: 'pulse-dot 2s infinite',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 11.5, color: 'rgba(0,201,232,0.8)', letterSpacing: '0.06em' }}>
              {wallCount ? `${wallCount} voices on the wall` : 'PEOPLE ARE HERE RIGHT NOW'}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(34px,4.5vw,54px)',
            lineHeight: 1.18, fontWeight: 300,
            fontFamily: "'Lora', Georgia, serif",
            marginBottom: 22, letterSpacing: '-0.01em',
          }}>
            Say it.{' '}
            <em style={{
              background: 'linear-gradient(135deg, #00C9E8 0%, #7C5CBF 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradShift 5s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontStyle: 'italic',
            }}>
              You don't have to hold it in anymore.
            </em>
          </h1>

          <p style={{
            fontSize: 16.5, lineHeight: 1.8,
            color: 'var(--dim)',
            marginBottom: 36, maxWidth: 430, fontWeight: 300,
          }}>
            Anonymous. No tracking. No judgment.
            Just somewhere to finally be heard.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setChatOpen(true)}
              className="btn-primary"
            >
              <FlameImage size={18} glow={false} />
              Start talking
            </button>
            <button
              onClick={() =>
                document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="btn-ghost"
            >
              Read what others are sharing
            </button>
          </div>

          {/* Trust micro-badges */}
          <div style={{
            display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap',
          }}>
            {['No accounts', 'No tracking', 'Leave anytime'].map(badge => (
              <div key={badge} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: 'var(--dimmer)',
              }}>
                <span style={{ color: 'rgba(0,201,232,0.55)' }}>✓</span>
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Live feed */}
        <div style={{ animation: 'fi 1s ease .15s both' }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 20,
            position: 'relative',
          }}>
            {/* Glow bg */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0,201,232,0.04) 0%, transparent 65%)',
              borderRadius: 20, pointerEvents: 'none',
            }} />

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 16, paddingBottom: 14,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#00C9E8', display: 'inline-block',
                animation: 'pulse-dot 2s infinite',
              }} />
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                People are speaking right now
              </span>
            </div>

            <div style={{ maxHeight: 380, overflow: 'hidden' }}>
              {feedItems.length > 0 ? (
                feedItems.map(item => (
                  <FeedCard
                    key={item.id}
                    text={item.confession || item.transformation}
                    isNew={newFeedIds.includes(item.id)}
                  />
                ))
              ) : (
                SEED_FEED.slice(0, 5).map((text, i) => (
                  <FeedCard key={i} text={text} isNew={false} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── EMOTIONAL BRIDGE ─────────────────────────────────────────── */}
      <section style={{
        maxWidth: 660,
        margin: '0 auto',
        padding: '40px 32px 80px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 'clamp(20px,2.8vw,28px)',
          lineHeight: 1.65, fontWeight: 400, fontStyle: 'italic',
          color: 'rgba(216,224,238,0.5)',
        }}>
          Most people never say what they're really going through.
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #00C9E8, #7C5CBF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            This is where they finally do.
          </span>
        </p>
      </section>

      {/* ── THE WALL ─────────────────────────────────────────────────── */}
      <section
        id="wall"
        style={{ maxWidth: 760, margin: '0 auto', padding: '20px 32px 100px' }}
      >
        {/* Wall header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'flex', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <FlameImage size={56} glow pulse />
          </div>
          <h2 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 400, marginBottom: 8,
          }}>
            The Wall
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--dim)', letterSpacing: '0.04em' }}>
            Anonymous. Unfiltered. Real.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14, padding: 4, marginBottom: 24,
        }}>
          {[
            { id: 'heard', label: 'Need to be heard' },
            { id: 'through', label: 'Got through something' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setWallTab(tab.id as 'heard' | 'through')}
              style={{
                flex: 1, padding: '11px 16px', borderRadius: 11,
                border: 'none',
                background: wallTab === tab.id
                  ? 'rgba(0,201,232,0.1)' : 'none',
                color: wallTab === tab.id
                  ? 'rgba(0,201,232,0.9)' : 'var(--dim)',
                fontSize: 13.5,
                fontWeight: wallTab === tab.id ? 500 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .2s ease',
                borderBottom: wallTab === tab.id
                  ? '1px solid rgba(0,201,232,0.28)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wall entries */}
        {wallLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <FlameImage size={32} glow pulse />
            </div>
            <p style={{ color: 'var(--dimmer)', fontSize: 13, fontStyle: 'italic' }}>
              Loading voices…
            </p>
          </div>
        ) : filteredWall.length > 0 ? (
          filteredWall.map(entry => (
            <WallCard key={entry.id} entry={entry} onVote={handleVote} />
          ))
        ) : (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
          }}>
            <p style={{ color: 'var(--dim)', fontSize: 14, lineHeight: 1.7 }}>
              Nothing here yet.
              <br />
              <span style={{ color: 'var(--dimmer)' }}>
                Be the first to leave something.
              </span>
            </p>
          </div>
        )}

        {/* CTA block */}
        <div style={{
          marginTop: 36, textAlign: 'center', padding: 28,
          background: 'rgba(124,92,191,0.05)',
          border: '1px solid rgba(124,92,191,0.14)',
          borderRadius: 16,
        }}>
          <p style={{
            fontSize: 14, color: 'var(--dim)',
            marginBottom: 18, lineHeight: 1.65,
          }}>
            Your story belongs here too.
          </p>
          <button
            onClick={() => setChatOpen(true)}
            style={{
              padding: '11px 26px', borderRadius: 24,
              background: 'rgba(124,92,191,0.12)',
              border: '1px solid rgba(124,92,191,0.32)',
              color: '#7C5CBF', fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              transition: 'all .2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,191,0.22)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,191,0.55)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,191,0.12)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,191,0.32)';
            }}
          >
            Add your voice →
          </button>
        </div>
      </section>

      {/* ── TRUST + PRICING ──────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        maxWidth: 880, margin: '0 auto', padding: '64px 32px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
      }}>
        <div>
          <h3 style={{
            fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--dimmer)', marginBottom: 22, fontWeight: 500,
          }}>
            Why this is safe
          </h3>
          {[
            'No accounts required',
            'No tracking, ever',
            'No data selling',
            'Leave anytime — no trace',
          ].map(item => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 13, fontSize: 14, color: 'var(--dim)',
            }}>
              <span style={{ color: 'rgba(0,201,232,0.55)', flexShrink: 0 }}>✓</span>
              {item}
            </div>
          ))}
        </div>

        <div>
          <h3 style={{
            fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--dimmer)', marginBottom: 22, fontWeight: 500,
          }}>
            Access
          </h3>
          <p style={{
            fontSize: 22, fontWeight: 300, marginBottom: 8,
            color: 'rgba(216,224,238,0.88)',
          }}>
            Free to use. Always.
          </p>
          <p style={{
            fontSize: 13.5, color: 'var(--dim)',
            lineHeight: 1.75, marginBottom: 22,
          }}>
            Upgrade for deeper support — crisis access,
            soul tokens, Digital Eternity.
          </p>
          <Link href="/pricing" className="btn-ghost" style={{ fontSize: 13 }}>
            See what's included →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '26px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        maxWidth: 1160, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FlameImage size={24} glow={false} />
          <span style={{ fontSize: 11.5, color: 'var(--dimmer)', letterSpacing: '0.05em' }}>
            RYVYNN · AONIXX · NEXXT GEN INNOVATIONS LLC
          </span>
        </div>
        <span style={{
          fontSize: 12, color: 'var(--dimmer)',
          fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic',
        }}>
          From our darkest hours to our brightest days.
        </span>
      </footer>

      {/* ── FLOAT CTA ────────────────────────────────────────────────── */}
      {showFloat && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 30,
          animation: 'fi .4s ease forwards',
        }}>
          <button
            onClick={() => setChatOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(7,8,15,0.96)',
              border: '1.5px solid rgba(0,201,232,0.4)',
              borderRadius: 99, padding: '11px 20px',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 0 24px rgba(0,201,232,0.14)',
              backdropFilter: 'blur(20px)',
              transition: 'all .2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,201,232,0.7)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 36px rgba(0,201,232,0.22)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,201,232,0.4)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(0,201,232,0.14)';
            }}
          >
            <FlameImage size={18} glow={false} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#00C9E8' }}>
              Talk now — nothing saved
            </span>
          </button>
        </div>
      )}
    </main>
  );
}
