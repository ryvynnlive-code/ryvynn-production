import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { Flame } from "lucide-react";

/**
 * Avatar Evolution Hero
 * 
 * Darkest section in entire app with vertical ascension pillar
 * Shows user's evolution progress and primary CTA
 */
export default function AvatarEvolutionHero() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Vertical Ascension Pillar - Blue Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-[#3B82F6]/30 to-transparent animate-pulse-slow" />
        <div className="absolute w-32 h-full bg-gradient-to-b from-transparent via-[#3B82F6]/10 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Avatar Display */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Avatar Orb */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#a8c8ff]/10 border border-[#3B82F6]/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-breathe">
              <Flame className="w-16 h-16 text-[#3B82F6]" />
            </div>

            {/* Evolution Progress Ring */}
            <svg className="absolute inset-0 w-32 h-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeOpacity="0.2"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="377"
                strokeDashoffset={377 * (1 - 0.3)} // 30% progress for demo
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
          RYVYNN
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-slate-300 mb-8">
          From our darkest hours to our brightest days
        </p>

        {/* Evolution Status */}
        {isAuthenticated && user && (
          <div className="mb-8 text-sm text-slate-400">
            <p>Welcome back, {user.name || "Traveler"}</p>
            <p className="text-[#3B82F6]">Your journey continues...</p>
          </div>
        )}

        {/* CTA */}
        {loading ? (
          <div className="h-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? (
          <Button
            onClick={() => navigate("/journal")}
            className="bg-gradient-to-r from-[#3B82F6] to-[#a8c8ff] text-black font-semibold px-8 py-6 text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
          >
            Continue your ritual
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/waitlist")}
              className="bg-gradient-to-r from-[#3B82F6] to-[#a8c8ff] text-black font-semibold px-8 py-6 text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
            >
              Start anonymous for free
            </Button>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              variant="outline"
              className="border-[#3B82F6]/50 text-[#3B82F6] hover:bg-[#3B82F6]/10 px-8 py-6 text-lg"
            >
              Sign in
            </Button>
          </div>
        )}

        {/* Subtle hint */}
        <p className="mt-8 text-sm text-slate-500">
          A sovereign wellness sanctuary. No surveillance. No judgment.
        </p>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
