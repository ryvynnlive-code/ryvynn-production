import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { APP_TITLE } from "@/const";
import { Flame } from "lucide-react";
import { Link } from "wouter";

export default function About() {
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
              About RYVYNN
            </h1>
            <p className="text-xl text-muted-foreground">
              Built by AONIXX. For the moments that matter most.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container max-w-4xl space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">The Origin</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RYVYNN was born from a simple truth: in our darkest hours, we need something more than algorithms 
              optimized for engagement. We need a sanctuary. A space where we can be honest, vulnerable, and human—without 
              fear of judgment, surveillance, or exploitation.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We built RYVYNN for the 3 AM confessions. The moments of crisis. The days when you just need someone 
              (or something) to listen. We built it with zero-surveillance architecture, wellness-first AI, and 
              a commitment to never profit from pain.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">AONIXX</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AONIXX is the parent company behind RYVYNN. We are a sovereign enterprise building AI-powered wellness 
              tools that prioritize conscious life over profit. Our mission is simple: create technology that uplifts, 
              never exploits.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RYVYNN is our first product, but not our last. We are building a suite of tools designed to support 
              mental wellness, emotional resilience, and human flourishing—all grounded in our sacred principles 
              of privacy, impact, and care.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Commitment</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We will never sell your data. We will never block core wellness features behind paywalls. We will 
              never prioritize engagement over wellbeing. These are not aspirations—they are our foundation.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RYVYNN is built for you. For the moments when you need it most. For the journey from your darkest 
              hours to your brightest days.
            </p>
          </div>

          <div className="border-t border-border pt-12 space-y-6">
            <h3 className="text-2xl font-bold text-center">From Our Darkest Hours to Our Brightest Days</h3>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              Thank you for trusting us with your journey.
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
