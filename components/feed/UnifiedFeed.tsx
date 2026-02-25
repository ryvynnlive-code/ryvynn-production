'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import { FeedCard } from './FeedCard';
import type { FeedItem, FeedItemType } from './FeedCard';

type FeedFilter = 'all' | 'miracles' | 'confessions';

const SAMPLE_FEED: FeedItem[] = [
  {
    id: 'm1',
    type: 'miracle',
    content:
      "I carried a storm inside me for years.\nToday, for the first time,\nI felt the sun break through.",
    timestamp: '2m ago',
    likes: 47,
    views: 312,
  },
  {
    id: 'c1',
    type: 'confession',
    content:
      "I haven't told anyone, but some nights I sit in my car in the driveway for an hour before going inside. I just need the silence.",
    timestamp: '5m ago',
    likes: 23,
    views: 189,
  },
  {
    id: 'm2',
    type: 'miracle',
    content:
      "They said I was too broken to be loved.\nBut the cracks are where\nthe light learned to enter.",
    timestamp: '8m ago',
    likes: 91,
    views: 540,
  },
  {
    id: 'c2',
    type: 'confession',
    content:
      "I smile at work every day. Nobody knows I cry the entire drive home. But today someone asked if I was okay, and I almost broke.",
    timestamp: '12m ago',
    likes: 65,
    views: 421,
  },
  {
    id: 'm3',
    type: 'miracle',
    content:
      "I whispered my pain into the void.\nThe void whispered back:\n'You are not alone.'",
    timestamp: '18m ago',
    likes: 112,
    views: 780,
  },
  {
    id: 'c3',
    type: 'confession',
    content:
      "I deleted my ex's number today. It took me 11 months. I don't feel strong, but I feel something. Maybe that's enough.",
    timestamp: '22m ago',
    likes: 38,
    views: 256,
  },
  {
    id: 'm4',
    type: 'miracle',
    content:
      "Three years of silence.\nOne moment of honesty.\nA lifetime of healing began.",
    timestamp: '30m ago',
    likes: 76,
    views: 498,
  },
  {
    id: 'c4',
    type: 'confession',
    content:
      "I keep telling people I'm fine with being alone. The truth is I'm terrified I'll always be. But tonight, reading these, I feel less invisible.",
    timestamp: '35m ago',
    likes: 54,
    views: 367,
  },
  {
    id: 'm5',
    type: 'miracle',
    content:
      "I thought the fire would consume me.\nInstead, it forged me\ninto something unbreakable.",
    timestamp: '42m ago',
    likes: 88,
    views: 610,
  },
  {
    id: 'c5',
    type: 'confession',
    content:
      "My therapist told me progress isn't linear. I didn't believe her until I relapsed and then got back up the same day. That never happened before.",
    timestamp: '50m ago',
    likes: 41,
    views: 290,
  },
  {
    id: 'm6',
    type: 'miracle',
    content:
      "The weight I carried\nwasn't mine to hold.\nI finally set it down today.",
    timestamp: '58m ago',
    likes: 63,
    views: 445,
  },
  {
    id: 'c6',
    type: 'confession',
    content:
      "I wrote a letter to my younger self today. I told him it gets better. I didn't believe it when I started writing, but by the end, I did.",
    timestamp: '1h ago',
    likes: 72,
    views: 503,
  },
  {
    id: 'm7',
    type: 'miracle',
    content:
      "In my darkest hour,\na stranger's words found me.\nNow I carry their light forward.",
    timestamp: '1h ago',
    likes: 95,
    views: 670,
  },
  {
    id: 'm8',
    type: 'miracle',
    content:
      "I stopped waiting for rescue\nand became my own miracle.\nThe flame was inside me all along.",
    timestamp: '2h ago',
    likes: 130,
    views: 890,
  },
];

const NEW_ITEMS: FeedItem[] = [
  {
    id: 'new-c1',
    type: 'confession',
    content:
      "I called my mom today for the first time in two years. Neither of us said sorry. We just cried. It was enough.",
    timestamp: 'just now',
    likes: 3,
    views: 12,
  },
  {
    id: 'new-m1',
    type: 'miracle',
    content:
      "The darkness taught me\nthat even the faintest ember\nis enough to find your way.",
    timestamp: 'just now',
    likes: 5,
    views: 28,
  },
  {
    id: 'new-c2',
    type: 'confession',
    content:
      "I've been sober for 48 hours. Nobody in my life knows I was ever not. This is the only place I can say it out loud.",
    timestamp: 'just now',
    likes: 8,
    views: 45,
  },
  {
    id: 'new-m2',
    type: 'miracle',
    content:
      "They buried me.\nThey didn't know\nI was a seed.",
    timestamp: 'just now',
    likes: 12,
    views: 67,
  },
];

interface UnifiedFeedProps {
  addSubmissionRef?: React.MutableRefObject<((content: string, type: FeedItemType) => void) | null>;
}

export function UnifiedFeed({ addSubmissionRef }: UnifiedFeedProps) {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [items, setItems] = useState<FeedItem[]>(SAMPLE_FEED);
  const newItemIndexRef = useRef(0);

  const addUserSubmission = useCallback((content: string, type: FeedItemType) => {
    const newItem: FeedItem = {
      id: `user-${Date.now()}`,
      type,
      content,
      timestamp: 'just now',
      likes: 0,
      views: 1,
    };
    setItems((prev) => [newItem, ...prev.slice(0, 15)]);
  }, []);

  // Expose the addUserSubmission function to the parent via ref
  useEffect(() => {
    if (addSubmissionRef) {
      addSubmissionRef.current = addUserSubmission;
    }
  }, [addSubmissionRef, addUserSubmission]);

  // Auto-add new items to the top of the feed
  useEffect(() => {
    const interval = setInterval(() => {
      if (newItemIndexRef.current < NEW_ITEMS.length) {
        const newItem = {
          ...NEW_ITEMS[newItemIndexRef.current],
          id: `${NEW_ITEMS[newItemIndexRef.current].id}-${Date.now()}`,
        };
        setItems((prev) => [newItem, ...prev.slice(0, 15)]);
        newItemIndexRef.current++;
      } else {
        newItemIndexRef.current = 0;
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const filtered = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'miracles') return item.type === 'miracle';
    return item.type === 'confession';
  });

  const miracleCount = items.filter((i) => i.type === 'miracle').length;
  const confessionCount = items.filter((i) => i.type === 'confession').length;

  const filters: { key: FeedFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'miracles', label: 'Miracles', count: miracleCount },
    { key: 'confessions', label: 'Confessions', count: confessionCount },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                filter === f.key
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card text-muted-foreground border border-border hover:border-accent/40 hover:text-foreground'
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] tabular-nums ${
                  filter === f.key ? 'text-accent-foreground/70' : 'text-muted-foreground/60'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-4 relative">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </AnimatePresence>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </div>

      {/* Live indicator */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="text-xs text-muted-foreground">
          Miracles and confessions updating live
        </span>
      </div>
    </div>
  );
}
