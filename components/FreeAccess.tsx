import Link from 'next/link';

export default function FreeAccess() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-widest text-ryvynn-cyan">RYVYNN · Free for everyone</p>
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">Full access. Always free.</h1>
        <p className="mb-8 text-lg leading-relaxed text-gray-300">Every available RYVYNN feature is free for individuals, families, and therapists. No paid plans, upgrade fees, token purchases, or payment card required.</p>
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {[
            ['Guardian', 'Talk without a subscription.', '/guardian'],
            ['The Wall', 'Read and share at your own pace.', '/wall'],
            ['Private journal', 'Save encrypted entries with your free account.', '/journal'],
            ['Eternity', 'Use the available message vault with your free account.', '/eternity'],
          ].map(([name, description, href]) => (
            <Link key={href} href={href} className="rounded-2xl border border-gray-800 p-6 hover:border-ryvynn-cyan">
              <h2 className="mb-2 text-xl font-semibold">{name}</h2>
              <p className="text-gray-400">{description}</p>
            </Link>
          ))}
        </div>
        <p className="mb-6 text-sm text-gray-400">Sign-in protects saved personal data. Age and safety protections still apply. Soul Tokens recognize participation; they never determine access.</p>
        <Link href="/" className="inline-block rounded-xl bg-ryvynn-cyan px-6 py-3 font-semibold text-black">Enter RYVYNN</Link>
        <p className="mt-8 text-sm text-gray-500">Optional <Link href="/support" className="underline">mission support</Link> helps cover operating costs and unlocks no additional access.</p>
      </div>
    </main>
  );
}
