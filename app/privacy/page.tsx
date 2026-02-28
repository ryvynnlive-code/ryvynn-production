import Link from 'next/link';
import { Flame, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-10 transition-colors">
          ← Back to RYVYNN
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-7 w-7 text-fuchsia-500" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
          <p className="text-zinc-300 text-base">RYVYNN is built on one principle: <strong className="text-white">your pain is yours, not ours</strong>.</p>
          <section>
            <h2 className="text-white font-semibold mb-2">What We Collect</h2>
            <p>Confession text is processed by our AI to generate your Miracle. It is <strong className="text-fuchsia-400">deleted immediately after processing</strong>. We do not store the original text of confessions. Miracles that post to the public feed contain only the transformed output, never your original words.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold mb-2">Zero Surveillance Architecture</h2>
            <p>We do not track you across sessions. We do not sell your data. We do not run ads. We do not share anything with third parties except what is required to process payments (Stripe) or send Soul Token emails (if you opt in).</p>
          </section>
          <section>
            <h2 className="text-white font-semibold mb-2">Crisis Data</h2>
            <p>If crisis keywords are detected, we surface resources (988, Crisis Text Line) immediately. We do not log or report this to any authority unless required by law in cases of imminent threat.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold mb-2">Your Rights</h2>
            <p>Since we don't store confessions, there's nothing to delete. Eternity Vault data (premium) is encrypted with your key — we cannot access it. You can request deletion of your account data at any time by emailing <a href="mailto:ryvynn.live@gmail.com" className="text-fuchsia-400 hover:underline">ryvynn.live@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold mb-2">Contact</h2>
            <p>NEXXT GEN INNOVATIONS LLC DBA AONIXX · Tucson, AZ · <a href="mailto:ryvynn.live@gmail.com" className="text-fuchsia-400 hover:underline">ryvynn.live@gmail.com</a></p>
          </section>
        </div>
      </div>
    </main>
  );
}
