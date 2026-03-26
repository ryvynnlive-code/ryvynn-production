import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(supabaseUrl, key);
}

async function getEntry(id: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('wall_entries')
      .select('id, confession, transformation, votes, created_at')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const entry = await getEntry(params.id);
  if (!entry) {
    return { title: 'Transformation Not Found | RYVYNN' };
  }

  const confessionSnip =
    entry.confession.length > 80
      ? entry.confession.slice(0, 80) + '...'
      : entry.confession;

  const description = `"${confessionSnip}" — See the transformation on RYVYNN's anonymous miracle wall.`;

  return {
    title: 'A Darkness Became Light | RYVYNN',
    description,
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url: `https://ryvynn.live/wall/${params.id}`,
      siteName: 'RYVYNN',
      title: 'Someone turned their darkness into light',
      description,
      images: [
        {
          url: '/assets/dual-flame-logo.png',
          width: 512,
          height: 512,
          alt: 'RYVYNN Dual Flame',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: 'Someone turned their darkness into light — RYVYNN',
      description,
      images: ['/assets/dual-flame-logo.png'],
    },
  };
}

export default async function WallEntryPage({
  params,
}: {
  params: { id: string };
}) {
  const entry = await getEntry(params.id);
  if (!entry) notFound();

  return (
    <main className="min-h-screen py-16 px-6 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
            From the Miracle Wall
          </p>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            A Darkness Became Light
          </h1>
        </div>

        {/* 50/50 Card */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <div className="grid md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-800">
            {/* Shadow */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌑</span>
                <h2 className="font-bold text-ryvynn-cyan text-sm uppercase tracking-widest">
                  The Shadow
                </h2>
              </div>
              <p className="text-gray-200 leading-relaxed text-lg">
                {entry.confession}
              </p>
            </div>

            {/* Light */}
            <div className="p-8 bg-gradient-to-br from-black to-gray-900">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h2 className="font-bold text-ryvynn-purple text-sm uppercase tracking-widest">
                  The Light
                </h2>
              </div>
              <p className="text-gray-200 leading-relaxed text-lg">
                {entry.transformation}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-800 px-8 py-5 flex items-center justify-between bg-black/60">
            <div className="flex items-center gap-2 text-ryvynn-purple font-bold">
              <span className="text-xl">🔥</span>
              <span>{entry.votes} souls witnessed this</span>
            </div>
            <span className="text-xs text-gray-600">
              {new Date(entry.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-gray-400 text-lg">
            Your darkness has a path through it too.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wall"
              className="px-8 py-4 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 transition-all"
            >
              See the Miracle Wall
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-gray-700 rounded-xl font-bold text-gray-300 hover:border-ryvynn-cyan transition-all"
            >
              Start Your Journey — Free
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            100% anonymous. Zero surveillance. Free crisis support forever.
          </p>
        </div>
      </div>
    </main>
  );
}
