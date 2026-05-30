import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RYVYNN — Links',
  description: 'Every RYVYNN link in one place. Privacy-first mental wellness platform.',
};

const LINKS_DATA = [
  {
    category: 'Start Here',
    items: [
      { label: 'Enter the Sanctuary', href: '/', desc: 'Anonymous space. Free. No account needed.', accent: '#00D9FF' },
      { label: 'Crisis Support', href: '/crisis', desc: 'Free forever. Guardian AI + 988 hotline.', accent: '#f87171' },
      { label: 'The Confession Wall', href: '/wall', desc: 'Say the thing you can never say. Anonymous.', accent: '#8B5CF6' },
    ],
  },
  {
    category: 'Features',
    items: [
      { label: 'Dark Journal', href: '/journal', desc: 'Encrypted. No one reads it but you.', accent: '#60a5fa' },
      { label: 'Eternity Vault', href: '/eternity', desc: 'Words that outlast you. Sacred and private.', accent: '#facc15' },
      { label: 'Sanctuary', href: '/sanctuary', desc: 'Stories from people who made it through.', accent: '#34d399' },
      { label: 'Guardian (AI)', href: '/guardian', desc: 'Crisis-trained AI. Present at 3 AM.', accent: '#a78bfa' },
    ],
  },
  {
    category: 'Premium',
    items: [
      { label: 'Pricing', href: '/pricing', desc: 'Soul Tokens start at $12.12/mo. Crisis always free.', accent: '#00D9FF' },
    ],
  },
  {
    category: 'Company',
    items: [
      { label: 'About', href: '/about', desc: 'The mission. The origin. Why we exist.', accent: '#94a3b8' },
      { label: 'Contact', href: '/contact', desc: 'hello@ryvynn.live', accent: '#94a3b8' },
      { label: 'Privacy Policy', href: '/compliance', desc: 'Zero surveillance. Your data stays yours.', accent: '#94a3b8' },
    ],
  },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <img
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN"
              className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_28px_rgba(0,217,255,0.7)]"
            />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            RYVYNN
          </h1>
          <p className="text-gray-500 text-sm mt-1">Privacy-first mental wellness · Free forever for crisis</p>
        </div>

        {/* Link groups */}
        <div className="space-y-7">
          {LINKS_DATA.map(({ category, items }) => (
            <div key={category}>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">{category}</p>
              <div className="space-y-2">
                {items.map(({ label, href, desc, accent }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-gray-900/40 hover:bg-gray-900/70 transition-all group"
                  >
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-white"
                         style={{ color: accent }}
                      >
                        {label}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                    <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 text-xs">
            NEXXT GEN INNOVATIONS LLC · RYVYNN · Tucson, AZ
          </p>
          <p className="text-gray-700 text-xs mt-1">
            ryvynn.live · hello@ryvynn.live
          </p>
        </div>

      </div>
    </main>
  );
}
