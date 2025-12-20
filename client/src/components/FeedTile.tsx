import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useLocation } from "wouter";

interface FeedTileProps {
  id: number;
  valence: "light" | "heavy";
  previewText: string;
  mode: "user_half" | "lantern_half";
}

/**
 * Feed Tile Component
 * 
 * Displays truncated preview of feed item with:
 * - Valence badge (light/heavy)
 * - 50% truncated text
 * - Lock overlay fade
 * - CTA to unlock full story
 */
export default function FeedTile({ id, valence, previewText, mode }: FeedTileProps) {
  const [, navigate] = useLocation();
  
  // Determine ARIA label based on valence
  const ariaLabel = valence === "light" 
    ? "hope post - uplifting story from the community" 
    : "vulnerability post - someone sharing their struggle";

  return (
    <article role="article" aria-label={ariaLabel} className="relative group">
      {/* Tile Container */}
      <div className="relative bg-gradient-to-br from-[#0a0a0b] to-[#020203] border border-[#8cb4ff]/20 rounded-lg p-6 overflow-hidden hover:border-[#8cb4ff]/40 transition-all">
        {/* Valence Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              valence === "light"
                ? "bg-[#8cb4ff]/20 text-[#a8c8ff] border border-[#8cb4ff]/30"
                : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
            }`}
          >
            {valence === "light" ? "LIGHT" : "HEAVY"}
          </span>
          <span className="text-xs text-slate-500">
            {mode === "user_half" ? "Voice" : "Dual Flame"}
          </span>
        </div>

        {/* Preview Text */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {previewText}
        </p>

        {/* Bottom Fade Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#020203] via-[#020203]/80 to-transparent pointer-events-none" />

        {/* Lock Overlay (visible on hover) */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-[#8cb4ff] mx-auto mb-2" />
            <p className="text-sm text-slate-300 mb-3">Continue reading</p>
            <Button
              onClick={() => navigate("/feed")}
              size="sm"
              className="bg-[#8cb4ff] text-black hover:bg-[#a8c8ff]"
            >
              View full story
            </Button>
          </div>
        </div>

        {/* Glow Edge (subtle) */}
        <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(140,180,255,0.05)] pointer-events-none" />
      </div>
    </article>
  );
}
