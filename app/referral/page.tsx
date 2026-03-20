'use client'

import { useState } from 'react'
import Link from 'next/link'

const tiers = [
  {
    souls: '1–3 souls',
    reward: '🔥 Flame Bearer',
    tokens: '+9 Soul Tokens',
    perks: 'Bonus healing prompts unlocked',
    color: 'from-cyan-500/20 to-zinc-900',
    border: 'border-cyan-500/30',
  },
  {
    souls: '4–9 souls',
    reward: '✨ Light Keeper',
    tokens: '+36 Soul Tokens',
    perks: '1 month premium access',
    color: 'from-violet-500/20 to-zinc-900',
    border: 'border-violet-500/40',
    featured: true,
  },
  {
    souls: '10+ souls',
    reward: '🌟 Sacred Guardian',
    tokens: '+369 Soul Tokens + Lifetime Badge',
    perks: '3 months premium + guardian title',
    color: 'from-yellow-500/20 to-zinc-900',
    border: 'border-yellow-500/30',
  },
]

const steps = [
  {
    number: '01',
    title: 'Share your link',
    body: 'Copy your unique referral link and send it to anyone who needs a safe space to heal.',
  },
  {
    number: '02',
    title: 'They join anonymously',
    body: 'Your referral signs up — no name, no surveillance, no judgment. Privacy preserved.',
  },
  {
    number: '03',
    title: 'You both receive Soul Tokens',
    body: 'When your referral completes their first session, tokens flow to both of you automatically.',
  },
  {
    number: '04',
    title: 'Tokens fuel the mission',
    body: 'Soul Tokens unlock premium features and fund real-world charitable crisis intervention.',
  },
]

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const referralLink = 'https://ryvynn.live?ref=soul'

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-6">🔥🔥</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-400 to-yellow-300 bg-clip-text text-transparent">
            Spread the Flame
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed mb-10">
            73% of people who need help never seek it. You can change that for
            someone in your life — anonymously, privately, and without stigma.
            Every soul you invite earns you both Soul Tokens and access to deeper healing.
          </p>

          {/* Referral Link Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg mx-auto">
            <p className="text-zinc-400 text-sm mb-3">Your referral link</p>
            <div className="flex gap-3 items-center">
              <code className="flex-1 text-sm text-violet-300 bg-zinc-800 px-4 py-3 rounded-xl truncate">
                {referralLink}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Sign in to get your personalized referral code and track your tokens.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s) => (
              <div
                key={s.number}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/30 transition-colors"
              >
                <div className="text-violet-400 font-mono text-sm font-bold mb-3">
                  {s.number}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-12">
            Referral Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.reward}
                className={`bg-gradient-to-b ${t.color} border ${t.border} rounded-2xl p-6 relative ${t.featured ? 'ring-1 ring-violet-500/50' : ''}`}
              >
                {t.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-xl mb-2">{t.reward}</div>
                <div className="text-zinc-400 text-sm mb-4">{t.souls} referred</div>
                <div className="text-white font-semibold mb-2">{t.tokens}</div>
                <div className="text-zinc-300 text-sm">{t.perks}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Tie-In */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-violet-900/30 to-zinc-900 border border-violet-500/20 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-4">🌍</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Every referral funds real-world impact
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            A portion of every premium upgrade triggered by a referral is
            directed to crisis intervention organizations. When you bring someone
            to RYVYNN, you're not just helping them — you're helping fund the
            entire ecosystem of healing.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wall"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Start Your Journey
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 border border-zinc-700 hover:border-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
