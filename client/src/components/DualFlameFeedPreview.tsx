import { trpc } from "@/lib/trpc";
import FeedTile from "./FeedTile";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * Dual Flame Feed Preview
 * 
 * Shows 4-6 tiles from the public feed with:
 * - 50/50 valence balance (light/heavy)
 * - Randomized content type (user_voice/dual_flame_voice)
 * - 50% text truncation
 * - CTAs to view more or upgrade
 */
export default function DualFlameFeedPreview() {
  const [, navigate] = useLocation();
  const { data: feedItems, isLoading } = trpc.publicFeed.list.useQuery({ limit: 6 });

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-black to-[#020203]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stories of Healing
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Glimpses of transformation. You are not alone.
          </p>
        </div>

        {/* Feed Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          </div>
        ) : feedItems && feedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {feedItems.map((item) => (
              <FeedTile
                key={item.id}
                id={item.id}
                valence={item.valence as "light" | "heavy"}
                previewText={item.preview_text}
                mode={item.mode as "user_half" | "lantern_half"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400">No stories yet. Be the first to share your light.</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/feed")}
            className="bg-gradient-to-r from-[#3B82F6] to-[#a8c8ff] text-black font-semibold px-8 py-6 text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
          >
            See more stories
          </Button>
          <Button
            onClick={() => navigate("/pricing")}
            variant="outline"
            className="border-[#3B82F6]/50 text-[#3B82F6] hover:bg-[#3B82F6]/10 px-8 py-6 text-lg"
          >
            Unlock deeper guidance with RYVYNN Plus
          </Button>
        </div>
      </div>
    </section>
  );
}
