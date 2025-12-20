import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Flame, TrendingUp, Users, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Investors() {
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
              Investor Relations
            </h1>
            <p className="text-xl text-muted-foreground">
              Building the future of AI-powered wellness. Trillion-dollar market. Sacred principles.
            </p>
          </div>
        </div>
      </section>

      {/* Opportunity */}
      <section className="pb-20">
        <div className="container max-w-4xl space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">The Opportunity</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Mental wellness is a <strong className="text-foreground">$500B+ global market</strong>, growing 
              at 20%+ annually. Yet current solutions are fragmented, expensive, and inaccessible. RYVYNN 
              is building the AI-first wellness platform for the next billion users.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3 cyber-card">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold">Market Size</h3>
              <p className="text-muted-foreground">
                $500B+ global mental wellness market, growing 20%+ YoY
              </p>
            </Card>

            <Card className="p-6 space-y-3 cyber-card">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold">Addressable Users</h3>
              <p className="text-muted-foreground">
                1B+ people globally seeking accessible mental health support
              </p>
            </Card>

            <Card className="p-6 space-y-3 cyber-card">
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold">Differentiation</h3>
              <p className="text-muted-foreground">
                Zero-surveillance architecture + wellness-first AI + sacred principles
              </p>
            </Card>

            <Card className="p-6 space-y-3 cyber-card">
              <Zap className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold">Business Model</h3>
              <p className="text-muted-foreground">
                Freemium SaaS: Free core features, premium tiers at $3/$6/$9/mo (Tesla pricing)
              </p>
            </Card>
          </div>

          {/* Why RYVYNN */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Why RYVYNN Wins</h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <Flame className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">AI-First Architecture:</strong> Built on Claude 3.5 Sonnet, 
                  optimized for empathy, safety, and wellness-first responses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Flame className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Zero-Surveillance Lock:</strong> No data selling, no tracking, 
                  no human eyes on confessions—privacy as a competitive moat
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Flame className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Freemium Model:</strong> Free core features drive viral growth, 
                  premium tiers ($3/$6/$9) monetize power users
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Flame className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Global Reach:</strong> Multilingual (EN/ES/FR/PT), 
                  culturally adaptive, accessible 24/7
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="border-t border-border pt-12 space-y-6">
            <h2 className="text-3xl font-bold text-center">Get in Touch</h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              We are raising our Seed round. If you are an investor aligned with our mission to build 
              AI that uplifts conscious life, we would love to connect.
            </p>
            <div className="flex justify-center">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg"
                onClick={() => window.location.href = "mailto:investors@aonixx.com"}
              >
                Contact Us
              </Button>
            </div>
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
