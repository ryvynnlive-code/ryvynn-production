import { useAuth } from "@/_core/hooks/useAuth";
import AvatarEvolutionHero from "@/components/AvatarEvolutionHero";
import DualFlameFeedPreview from "@/components/DualFlameFeedPreview";
import ZeroSurveillanceSeal from "@/components/ZeroSurveillanceSeal";
import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Flame } from "lucide-react";
import { Link } from "wouter";

/**
 * RYVYNN Trillion-Dollar Homepage v1.40
 * 
 * Darkest page in entire app with:
 * - Avatar Evolution Hero with ascension pillar
 * - Dual Flame Feed Preview with 50/50 valence balance
 * - Zero-surveillance seal
 * - Brightness level 1 (darkest)
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <Flame className="w-16 h-16 text-[#8cb4ff]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-[#8cb4ff]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="shadow-[0_0_20px_rgba(140,180,255,0.4)]">
                <Flame className="w-8 h-8 text-[#8cb4ff]" />
              </div>
              <span className="text-2xl font-bold text-white">{APP_TITLE}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/pricing">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  {t('common.pricing')}
                </Button>
              </Link>
              <Link href="/manifesto">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  {t('common.manifesto')}
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-[#8cb4ff] to-[#a8c8ff] text-black hover:shadow-[0_0_20px_rgba(140,180,255,0.5)]">
                    Enter Sanctuary
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-gradient-to-r from-[#8cb4ff] to-[#a8c8ff] text-black hover:shadow-[0_0_20px_rgba(140,180,255,0.5)]">
                    Begin Journey
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Avatar Evolution Hero - Darkest section */}
      <AvatarEvolutionHero />

      {/* Zero-Surveillance Seal */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#020203] to-black">
        <div className="max-w-4xl mx-auto">
          <ZeroSurveillanceSeal />
        </div>
      </section>

      {/* Dual Flame Feed Preview */}
      <DualFlameFeedPreview />

      {/* Footer */}
      <footer className="border-t border-[#8cb4ff]/20 bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-[#8cb4ff]" />
                <span className="text-xl font-bold text-white">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-slate-400">
                From our darkest hours to our brightest days
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/manifesto" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Manifesto</Link></li>
                <li><Link href="/about" className="text-sm text-slate-400 hover:text-[#8cb4ff]">About</Link></li>
                <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Pricing</Link></li>
                <li><Link href="/waitlist" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Waitlist</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/trust" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Trust</Link></li>
                <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Privacy</Link></li>
                <li><Link href="/investors" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Investors</Link></li>
                <li><Link href="/origin" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Origin Story</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/crisis" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Crisis Resources</Link></li>
                <li><a href="tel:988" className="text-sm text-slate-400 hover:text-[#8cb4ff]">988 Lifeline</a></li>
                <li><a href="sms:741741" className="text-sm text-slate-400 hover:text-[#8cb4ff]">Crisis Text Line</a></li>
              </ul>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="border-t border-[#8cb4ff]/20 pt-8 pb-8 text-center">
            <p className="text-sm text-slate-400 mb-3">
              RYVYNN stays free forever at the <span className="text-[#8cb4ff] font-semibold">ZERO</span> tier. 
              Upgrades follow the Tesla 3-6-9 path: <span className="text-[#8cb4ff]">ZERO · THREE · SIX · NINE · TWELVE · GUARDIAN</span>
            </p>
            <Link href="/pricing">
              <Button variant="outline" className="border-[#8cb4ff]/50 text-[#8cb4ff] hover:bg-[#8cb4ff]/10">
                View full pricing
              </Button>
            </Link>
          </div>

          {/* Wellness Disclaimer */}
          <div className="border-t border-[#8cb4ff]/20 pt-8">
            <WellnessDisclaimer />
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-slate-500 mt-8">
            © {new Date().getFullYear()} RYVYNN. A sovereign wellness sanctuary.
          </div>
        </div>
      </footer>
    </div>
  );
}
