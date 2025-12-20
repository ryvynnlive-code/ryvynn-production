import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { APP_TITLE } from "@/const";
import { Flame, Shield, Lock, Eye, Database, Users } from "lucide-react";
import { Link } from "wouter";

export default function Trust() {
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
              Trust & Privacy
            </h1>
            <p className="text-xl text-muted-foreground">
              Your privacy is sacred. Here's exactly how we protect it.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container max-w-4xl space-y-16">
          {/* Zero-Surveillance */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Zero-Surveillance Architecture</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We log as little as possible. Confessions are never stored—they are processed in real-time and 
              immediately discarded. Journal entries are encrypted and stored locally on your device, never on 
              our servers. We do not track your behavior, sell your data, or share it with third parties.
            </p>
          </div>

          {/* No Human Eyes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">No Human Eyes</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              All responses are AI-generated. No humans read your confessions, journal entries, or private 
              conversations. Your secrets stay between you and the machine—never exposed to human eyes.
            </p>
          </div>

          {/* Data Minimization */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Data Minimization</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We only collect what is absolutely necessary to provide the service: your email (for login), 
              your profile settings (voice tone, avatar theme), and your Soul Tokens balance. We do not collect 
              browsing history, device fingerprints, or behavioral analytics.
            </p>
          </div>

          {/* Encryption */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">End-to-End Encryption</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              All data in transit is encrypted using TLS 1.3. All data at rest is encrypted using AES-256. 
              Your journal entries are encrypted client-side before being stored, meaning only you can read them.
            </p>
          </div>

          {/* No Selling */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">No Data Selling</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We will never sell your data to advertisers, data brokers, or third parties. Your trust is not 
              a commodity. We monetize through premium subscriptions, not surveillance.
            </p>
          </div>

          {/* Transparency */}
          <div className="border-t border-border pt-12 space-y-6">
            <h2 className="text-3xl font-bold">Transparency</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              If we ever need to change our privacy practices, we will notify you in advance and give you 
              the option to opt out or delete your account. Your privacy is not negotiable.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For full legal details, see our <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link>.
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
              <Link href="/manifesto">
                <span className="hover:text-foreground transition-colors cursor-pointer">Manifesto</span>
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
