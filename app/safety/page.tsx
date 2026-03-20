'use client'

import Link from 'next/link'

const shields = [
  {
    icon: '🔐',
    title: 'Zero-Knowledge Architecture',
    body: 'Your raw confessions are never stored. Before any data touches our servers, it is transformed into metaphor using AES-256-GCM encryption. The original words cease to exist.',
  },
  {
    icon: '🚫',
    title: 'Zero Surveillance — Always',
    body: 'We do not sell your data. We do not share it with advertisers. We do not build behavioral profiles. We do not employ trackers. What you share here lives and dies here.',
  },
  {
    icon: '👤',
    title: 'Anonymous by Default',
    body: 'No real name required. No photo. No social login. You enter as a soul and leave as a soul. Your identity is yours alone.',
  },
  {
    icon: '🛡️',
    title: 'Row-Level Security (RLS)',
    body: 'Our Supabase database enforces strict Row-Level Security. Your data is cryptographically isolated — even database administrators cannot cross-access user records.',
  },
  {
    icon: '🚨',
    title: 'Crisis Detection & Intervention',
    body: 'Our AI monitors every interaction for signs of crisis. When detected, it immediately surfaces 988 Suicide & Crisis Lifeline and Crisis Text Line resources — no delay, no friction.',
  },
  {
    icon: '⏱️',
    title: 'Automatic Data Expiry',
    body: 'All session data has a strict TTL. Nothing lingers. No conversation logs are retained beyond the session. Our architecture is designed to forget.',
  },
]

const certifications = [
  { label: 'Registered Business (LLC)', detail: 'Nexxt Gen Innovations LLC' },
  { label: 'EIN', detail: '93-4340064' },
  { label: 'SAM.gov Registered', detail: 'UEI: D3LQANCP1LEG' },
  { label: 'CAGE Code', detail: 'HY002' },
  { label: 'Encryption Standard', detail: 'AES-256-GCM' },
  { label: 'Crisis Routing', detail: '988 Lifeline + Crisis Text Line' },
]

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-6">🔥</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-400 to-yellow-300 bg-clip-text text-transparent">
            Safety & Trust
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed">
            RYVYNN was built for the 73% of people who avoid therapy because of
            stigma, cost, and the fear that their darkest thoughts will be used
            against them. Your privacy is not a feature — it is the foundation.
          </p>
        </div>
      </section>

      {/* Shields Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shields.map((s) => (
            <div
              key={s.title}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 transition-colors"
            >
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-3">{s.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Crisis Banner */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-red-900/40 to-zinc-900 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            If you are in crisis right now
          </h2>
          <p className="text-zinc-300 mb-6">
            You are not alone. Real humans are available 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:988"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
            >
              Call 988 — Suicide & Crisis Lifeline
            </a>
            <a
              href="sms:741741"
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-xl transition-colors"
            >
              Text HOME to 741741
            </a>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">
            Business & Compliance Credentials
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {certifications.map((c) => (
              <div key={c.label} className="flex justify-between items-center px-6 py-4">
                <span className="text-zinc-400 text-sm">{c.label}</span>
                <span className="text-white text-sm font-mono">{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-zinc-400 mb-8">
            Questions about our privacy architecture, data practices, or security?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:ryvynn@zohomail.com"
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              Contact Us
            </a>
            <Link
              href="/pricing"
              className="px-6 py-3 border border-zinc-700 hover:border-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
