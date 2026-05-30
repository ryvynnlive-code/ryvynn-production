import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact RYVYNN',
  description: 'Reach out to RYVYNN — anonymous support, partnerships, press, or feedback.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <img
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN"
              className="w-14 h-14 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Contact</h1>
          <p className="text-gray-500 text-sm mt-1">We read every message.</p>
        </div>

        {/* Crisis first */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5 mb-8">
          <p className="text-red-300 font-semibold text-sm mb-1">⚠ In crisis right now?</p>
          <p className="text-gray-400 text-sm mb-3">
            Don't email. Go to our crisis support — it's instant and free.
          </p>
          <Link
            href="/crisis"
            className="inline-block text-sm font-medium text-white bg-red-800/60 border border-red-500/40 rounded-lg px-4 py-2 hover:bg-red-700/60 transition-colors"
          >
            Crisis Support →
          </Link>
        </div>

        {/* Contact options */}
        <div className="space-y-4">
          {[
            {
              label: 'General / Feedback',
              email: 'hello@ryvynn.live',
              desc: 'Bug reports, feature ideas, general questions.',
            },
            {
              label: 'Partnerships & Press',
              email: 'press@ryvynn.live',
              desc: 'Media inquiries, grant partnerships, collaboration.',
            },
            {
              label: 'Legal & Privacy',
              email: 'legal@ryvynn.live',
              desc: 'Privacy requests, DMCA, compliance questions.',
            },
          ].map(({ label, email, desc }) => (
            <div key={email} className="border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <p className="text-white font-medium text-sm mb-1">{label}</p>
              <a
                href={`mailto:${email}`}
                className="text-ryvynn-cyan text-sm hover:underline"
              >
                {email}
              </a>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Anonymous note */}
        <div className="mt-8 bg-ryvynn-cyan/5 border border-ryvynn-cyan/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">
            <span className="text-ryvynn-cyan font-medium">Note:</span> You never need to give your real name.
            Anonymous feedback is welcome — we'll still read it and it still matters.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to RYVYNN
          </Link>
        </div>

      </div>
    </main>
  );
}
