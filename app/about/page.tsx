import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About RYVYNN — Privacy-First Mental Wellness',
  description: 'RYVYNN is a privacy-first mental wellness platform built for crisis, recovery, and anyone who needs space to breathe — anonymously.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/">
            <img
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN"
              className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_24px_rgba(0,217,255,0.6)]"
            />
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            RYVYNN
          </h1>
          <p className="text-gray-500 text-sm mt-1 tracking-wider uppercase">
            Privacy-First Mental Wellness
          </p>
        </div>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">The Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            RYVYNN exists for the people who need space to be honest — without fear, without judgment,
            without their name attached to it.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            We built this for crisis. For recovery. For the 3 AM moments when you need to say something
            real to someone — or something — that will just listen.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Crisis access is free. Forever. That's not a marketing promise — it's the foundation.
          </p>
        </section>

        {/* Values */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">What We Believe</h2>
          <div className="space-y-4">
            {[
              ['No real name required — ever', 'Your account has no identity attached. Just an email to keep it yours.'],
              ['Free crisis access, permanently', 'If you're in crisis, you should never hit a paywall.'],
              ['Your words are yours', 'Journals are encrypted. Confessions are anonymous. The Wall holds your story, not your name.'],
              ['Built different', 'One founder. Two years. Zero VC pressure. Built on Android from Tucson, AZ — for the people the industry ignores.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-ryvynn-cyan mt-0.5">◈</span>
                  <div>
                    <p className="text-white font-medium text-sm">{title}</p>
                    <p className="text-gray-400 text-sm mt-1">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Origin */}
        <section className="mb-10 bg-ryvynn-cyan/5 border border-ryvynn-cyan/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">The Origin</h2>
          <p className="text-gray-300 leading-relaxed mb-3">
            RYVYNN was built by a former HVAC technician who pivoted into tech at 34 — no CS degree,
            no investor backing, no team. Just a mission and a phone.
          </p>
          <p className="text-gray-300 leading-relaxed">
            2,700+ hours of development. Federal registrations. A full production stack. All built
            because mental health support for underserved populations shouldn't require a credit card
            or a real name.
          </p>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-center text-black"
            style={{ background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)' }}
          >
            Enter the Sanctuary
          </Link>
          <Link
            href="/crisis"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-center border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
          >
            Crisis Support →
          </Link>
        </div>

        {/* Legal */}
        <p className="text-center text-gray-700 text-xs mt-10">
          NEXXT GEN INNOVATIONS LLC, operating as AONIXX and RYVYNN · Tucson, AZ
        </p>

      </div>
    </main>
  );
}
