import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Evidence-Informed Design | RYVYNN',
  description:
    'RYVYNN is built on clinical frameworks including C-SSRS crisis detection, trauma-informed AI design, AES-256-GCM encryption, and a zero-surveillance architecture. Free crisis access. Always.',
  keywords: [
    'evidence-informed mental health app',
    'C-SSRS crisis detection',
    'trauma-informed AI',
    'zero surveillance mental health',
    'encrypted journal app',
    'anonymous mental wellness',
    'free crisis support app',
    'RYVYNN research',
    'mental health app legitimacy',
    'privacy-first wellness',
  ],
  openGraph: {
    title: 'RYVYNN — Evidence-Informed Mental Wellness Framework',
    description:
      'Built on C-SSRS, van der Kolk, Gabor Maté, and Polyvagal Theory. AES-256-GCM encrypted. Zero surveillance. Free crisis access forever.',
    url: 'https://ryvynn.live/research',
    images: [{ url: '/assets/dual-flame-logo.png', width: 512, height: 512 }],
  },
};

const frameworks = [
  {
    title: 'Columbia Suicide Severity Rating Scale (C-SSRS)',
    org: 'Columbia University Medical Center',
    desc: 'RYVYNN\'s Guardian AI uses C-SSRS-aligned language detection to identify escalating crisis signals in real time, routing users to human crisis resources (988 Lifeline) when thresholds are met — regardless of subscription tier.',
    icon: '🧠',
  },
  {
    title: 'Trauma-Informed Design',
    org: 'Bessel van der Kolk — The Body Keeps the Score',
    desc: 'Product architecture follows the principle that trauma is stored in the body and activated by surveillance environments. RYVYNN eliminates surveillance-by-design: no ad tracking, no behavioral data sold, no third-party profiling.',
    icon: '🫀',
  },
  {
    title: 'Compassionate Inquiry Framework',
    org: 'Dr. Gabor Maté',
    desc: 'Guardian AI responses avoid diagnostic labeling and interrogative prompting. Questions are exploratory, not extractive. The goal is witnessed expression — not clinical categorization.',
    icon: '💬',
  },
  {
    title: 'Polyvagal Theory',
    org: 'Dr. Stephen Porges',
    desc: 'Platform tone, pacing, and interaction design are calibrated to support ventral vagal safety states — reducing rather than amplifying physiological threat response during vulnerable disclosure moments.',
    icon: '⚡',
  },
  {
    title: 'Connection as Root of Mental Health',
    org: 'Johann Hari — Lost Connections',
    desc: 'RYVYNN\'s confession/miracle wall and community architecture are designed around the evidence that disconnection — not brain chemistry imbalance — is the primary driver of depression and anxiety.',
    icon: '🔗',
  },
  {
    title: 'Individuation & Shadow Integration',
    org: 'Carl Jung',
    desc: 'The confession-to-miracle transformation pipeline is informed by Jungian individuation: the act of giving language to suppressed experience creates distance from it, enabling meaning-making rather than rumination.',
    icon: '🌑',
  },
];

const technical = [
  {
    label: 'Data Encryption',
    value: 'AES-256-GCM',
    note: 'All journal entries and Eternity Vault messages encrypted at rest. Keys scoped per user.',
  },
  {
    label: 'Authentication',
    value: 'Supabase + Row-Level Security',
    note: 'Every database query enforces RLS policies. Users can only access their own data.',
  },
  {
    label: 'AI Provider',
    value: 'Google Gemini 2.0 Flash',
    note: 'Inference only. No user data stored with AI provider. Responses are ephemeral.',
  },
  {
    label: 'Third-Party Tracking',
    value: 'None',
    note: 'No Google Analytics. No Meta Pixel. No ad network integrations. Zero behavioral profiling.',
  },
  {
    label: 'Data Ownership',
    value: 'User-Owned',
    note: 'Users can export or permanently delete all data at any time. No retention after deletion request.',
  },
  {
    label: 'Crisis Access',
    value: 'Free Forever',
    note: 'Crisis resources, Guardian AI in crisis mode, and 988 routing are permanently unpaywall.',
  },
];

const registrations = [
  { label: 'SAM.gov', value: 'Active Federal Registration' },
  { label: 'CAGE Code', value: '0YQ06' },
  { label: 'DUNS', value: 'Verified' },
  { label: 'Legal Entity', value: 'NEXXT GEN INNOVATIONS LLC' },
  { label: 'DBA', value: 'AONIXX' },
  { label: 'Sub-Brand', value: 'RYVYNN' },
  { label: 'Domain', value: 'ryvynn.live (active, deployed)' },
  { label: 'Foundation EIN', value: 'RYVYNN Foundation — EIN Registered' },
];

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-black to-purple-950/20 pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN Dual Flame"
              width={72}
              height={72}
              priority
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Evidence-Informed Design
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            RYVYNN is not a clinical tool and does not provide therapy. It is a
            <strong className="text-cyan-400"> privacy-first AI companion</strong> built on
            peer-reviewed clinical frameworks, zero-surveillance architecture, and a permanent
            commitment to free crisis access for anyone who needs it.
          </p>
          <div className="mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 px-5 py-2 text-sm text-cyan-300">
            Built by AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC
          </div>
        </div>
      </section>

      {/* Clinical Frameworks */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-purple-400">
          Informing Frameworks
        </h2>
        <h3 className="mb-12 text-center text-3xl font-bold text-white">
          Built on Decades of Clinical Research
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-cyan-500/40 transition-colors"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h4 className="mb-1 text-base font-bold text-white">{f.title}</h4>
              <p className="mb-3 text-xs font-medium text-cyan-400">{f.org}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-purple-400">
            Technical Architecture
          </h2>
          <h3 className="mb-12 text-center text-3xl font-bold text-white">
            Privacy Is the Infrastructure
          </h3>
          <div className="space-y-4">
            {technical.map((t) => (
              <div
                key={t.label}
                className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-5"
              >
                <div className="sm:w-48 shrink-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {t.label}
                  </span>
                  <p className="mt-1 text-lg font-bold text-cyan-400">{t.value}</p>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed sm:pt-5">{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Commitment */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block rounded-2xl border border-red-500/40 bg-red-950/20 px-8 py-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Crisis Access Is <span className="text-red-400">Free Forever</span>
            </h2>
            <p className="text-gray-300 leading-relaxed">
              No paywall. No subscription. No account required. Anyone in crisis can access
              RYVYNN&apos;s Guardian AI in crisis mode and receive immediate routing to the{' '}
              <strong className="text-white">988 Suicide & Crisis Lifeline</strong> at any time,
              from any device. This policy is locked into the platform&apos;s founding charter and
              cannot be changed by pricing decisions.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/crisis"
                className="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-400 transition-colors"
              >
                Crisis Resources →
              </a>
              <a
                href="/guardian"
                className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white hover:border-white/40 transition-colors"
              >
                Talk to Guardian
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Statement */}
      <section className="border-t border-white/10 bg-gradient-to-b from-purple-950/20 to-black px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-purple-400">
            Origin
          </h2>
          <h3 className="mb-10 text-center text-3xl font-bold text-white">Why RYVYNN Exists</h3>
          <blockquote className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-8">
            <p className="text-gray-300 leading-relaxed text-lg italic">
              &ldquo;RYVYNN was built from the inside of the darkness it&apos;s designed to help
              people survive. I came from HVAC and plumbing trades. I learned to code entirely
              through AI assistance, from an Android phone, with no funding, no team, and no
              runway. Every design decision in RYVYNN is filtered through one question: would this
              have helped me when I had nothing left? If the answer is no, it doesn&apos;t ship.&rdquo;
            </p>
            <footer className="mt-6 text-sm text-purple-400 font-semibold">
              — Shawn Lutz, Founder · NEXXT GEN INNOVATIONS LLC
            </footer>
          </blockquote>
          <p className="mt-8 text-gray-400 leading-relaxed text-center">
            RYVYNN is not built from a boardroom. It is built from 2,700+ documented hours of
            sweat equity, shaped by personal survival, and governed by a founding philosophy that
            every generation of struggling people deserves access to the accumulated knowledge of
            everyone who made it through their darkness.
          </p>
        </div>
      </section>

      {/* Registrations */}
      <section className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
            Organizational Verification
          </h2>
          <h3 className="mb-10 text-center text-2xl font-bold text-white">
            Registered & Verifiable
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {registrations.map((r) => (
              <div
                key={r.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
              >
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{r.label}</p>
                <p className="text-sm font-semibold text-white">{r.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-600">
            RYVYNN is a sub-brand of AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC.
            All intellectual property owned by NEXXT GEN INNOVATIONS LLC.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-white/10 bg-black px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs text-gray-600 leading-relaxed">
            RYVYNN is not a medical device, licensed therapy service, or clinical treatment
            platform. It does not diagnose, treat, cure, or prevent any mental health condition.
            If you are experiencing a mental health emergency, call{' '}
            <strong className="text-white">988</strong> (US Suicide & Crisis Lifeline) or your
            local emergency number immediately. RYVYNN's AI features are supplemental support
            tools, not replacements for licensed mental health professionals.
          </p>
        </div>
      </section>
    </main>
  );
}
