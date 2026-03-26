import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://ryvynn.live';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/wall`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/crisis`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/press`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return staticRoutes;

    const supabase = createClient(supabaseUrl, key);

    const { data: entries } = await supabase
      .from('wall_entries')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    const wallEntryRoutes: MetadataRoute.Sitemap = (entries ?? []).map((e) => ({
      url: `${BASE}/wall/${e.id}`,
      lastModified: new Date(e.created_at),
      changeFrequency: 'never' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...wallEntryRoutes];
  } catch {
    return staticRoutes;
  }
}
