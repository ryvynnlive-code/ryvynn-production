'use client'

import Link from 'next/link'

const stats = [
  { value: '73%', label: 'of people avoid therapy due to stigma, cost, or privacy fear' },
  { value: '$280B', label: 'global mental health market (2024)' },
  { value: '2,800+', label: 'development hours invested by solo founder' },
  { value: '8.1.0', label: 'current platform version — production live' },
  { value: '$500K+', label: 'sweat equity invested to date' },
  { value: '$1.275M', label: 'grant pipeline across NIH, NSF, SAMHSA' },
]

const facts = [
  'RYVYNN is a privacy-first AI mental wellness platform — the "anti-surveillance" alternative to BetterHelp.',
  'Zero data retention architecture: raw confessions are transformed into metaphors via AES-256-GCM encryption before any storage.',
  'Crisis detection routes users to 988 Suicide & Crisis Lifeline and Crisis Text Line automatically — no delay.',
  'SAM.gov registered (UEI: D3LQANCP1LEG) | CAGE: HY002 | EIN: 93-4340064.',
  'Pursuing $500K seed round at $3.5M SAFE cap with 20% discount.',
  'Tesla 3-6-9 numerology pricing: Free → $3.69 → $12.12 → $36.90 → $369/yr → $936 therapist license.',
  'Soul Token economy funds real-world charitable crisis intervention.',
  'Built on Next.js 15, Supabase + RLS, Stripe, Anthropic Claude API.',
]

const brand = [
  { label: 'Platform Name', value: 'RYVYNN' },
  { label: 'Legal Entity', value: 'Nexxt Gen Innovations LLC' },
  { label: 'Mission', value: 'From Our Darkest Hours to Our Brightest Days' },
  { label: 'Founded', value: '2024' },
  { label: 'Headquarters', value: 'Arizona, USA' },
  { label: 'Press Contact', value: 'ryvynn@zohomail.com' },
  { label: 'Investor Contact', value: 'ryvynn@zohomail.com' },
  { label: 'Website', value: 'ryvynn.live' },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/30 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
            📰 Press & Media
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-400 to-yellow-300 bg-clip-text text-transparent">
            RYVYNN Newsroom
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed">
            Resources for journalists, investors, and media covering AI, mental
            health, and privacy technology.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.value}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center hover:border-violet-500/30 transition-colors"
            >
              <div className="text-3xl font-bold text-violet-400 mb-2">{s.value}</div>
              <div className="text-zinc-400 text-sm leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fast Facts */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Fast Facts</h2>
          <div className="space-y-4">
            {facts.map((f, i) => (
              <div key={i} className="flex gap-4 items-start bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <span className="text-violet-400 font-mono text-sm font-bold mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-zinc-300 text-sm leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Info */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Company Information</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {brand.map((b) => (
              <div key={b.label} className="flex justify-between items-center px-6 py-4">
                <span className="text-zinc-400 text-sm">{b.label}</span>
                <span className="text-white text-sm font-mono">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                🔥
              </div>
              <h3 className="text-white font-semibold mb-2">Dual Flame Logo</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Cyan-to-violet gradient flame on black background. Sacred symbol of rising from darkness.
              </p>
              <p className="text-zinc-500 text-xs">Contact press@ryvynn.live for high-res assets</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-cyan-400" />
                <div className="w-8 h-8 rounded-full bg-violet-500" />
                <div className="w-8 h-8 rounded-full bg-yellow-400" />
                <div className="w-8 h-8 rounded-full bg-black border border-zinc-700" />
              </div>
              <h3 className="text-white font-semibold mb-2">Brand Palette</h3>
              <p className="text-zinc-400 text-sm">
                Cosmic-dark base with violet-to-gold gradients and ember-glow accents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Boilerplate */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">About RYVYNN — Standard Boilerplate</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            RYVYNN is a privacy-first AI mental wellness platform built for the 73% of
            people who avoid traditional therapy due to stigma, cost, and surveillance
            concerns. Operating under Nexxt Gen Innovations LLC (EIN: 93-4340064),
            RYVYNN offers anonymous confession transformation, AI guardian coaching, crisis
            intervention routing, Soul Token gamification, and encrypted digital legacy
            messaging — all on a zero-data-retention architecture. The platform targets
            the $280B global mental health market and is pursuing a $500K seed round
            alongside a $1.275M federal grant pipeline spanning NIH SBIR, NSF PDaSP, and
            SAMHSA. Founded by a solo founder who has invested 2,800+ development hours
            and $500K+ in sweat equity. Mission: From Our Darkest Hours to Our Brightest Days.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Media & Press Inquiries</h2>
          <p className="text-zinc-400 mb-8">
            For interviews, embargoed briefings, press access, or investor inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:ryvynn@zohomail.com"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Contact Press Team
            </a>
            <Link
              href="/"
              className="px-8 py-4 border border-zinc-700 hover:border-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              Visit Platform
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
