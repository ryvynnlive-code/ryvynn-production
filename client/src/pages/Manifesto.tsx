import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { APP_TITLE } from "@/const";
import { Flame, Shield, Heart, Sparkles, Users, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="glow">
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold gradient-text">{APP_TITLE}</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold gradient-text">
              The RYVYNN Manifesto
            </h1>
            <p className="text-xl text-muted-foreground">
              Our sacred principles. Our unbreakable commitments.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container max-w-4xl space-y-16">
          {/* Principle 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Zero-Surveillance Lock</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We log as little as possible. Confessions are never stored. No third-party tracking. No data selling. 
              Your privacy is sacred, not a commodity. We exist to help, not to harvest.
            </p>
          </div>

          {/* Principle 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Primacy of Conscious Life</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every sentient being deserves care, never manipulation. Your wellbeing comes first, always. 
              We prioritize and uplift conscious life—never exploit it for engagement or profit.
            </p>
          </div>

          {/* Principle 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Impact Over Income</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Prior care forever. Monetization never blocks mental health support. We exist to help, 
              not to profit from pain. If we must choose between impact and income, impact wins—every time.
            </p>
          </div>

          {/* Principle 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">AI-Only Responses</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No humans read your confessions. No journal entries are stored. All responses are AI-generated. 
              Your secrets stay between you and the machine—never exposed to human eyes.
            </p>
          </div>

          {/* Principle 5 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Wellness, Not Medical</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RYVYNN is a wellness AI, not a medical provider. We do not diagnose, treat, or replace 
              licensed professionals. We offer support, reflection, and companionship—never medical advice.
            </p>
          </div>

          {/* Closing */}
          <div className="border-t border-border pt-12 space-y-6">
            <h3 className="text-2xl font-bold text-center">From Our Darkest Hours to Our Brightest Days</h3>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              These principles are not marketing. They are our foundation. They guide every decision, 
              every line of code, every interaction. We built RYVYNN for the moments when you need it most—and 
              we will never betray that trust.
            </p>
          </div>
        </div>
      </section>

      {/* Wellness Disclaimer */}
      <WellnessDisclaimer />

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">{APP_TITLE}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/origin">
                <span className="hover:text-foreground transition-colors cursor-pointer">Origin</span>
              </Link>
              <Link href="/trust">
                <span className="hover:text-foreground transition-colors cursor-pointer">Trust</span>
              </Link>
              <Link href="/privacy">
                <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
              </Link>
              <Link href="/investors">
                <span className="hover:text-foreground transition-colors cursor-pointer">Investors</span>
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">
              © 2025 {APP_TITLE}. Built with care.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
