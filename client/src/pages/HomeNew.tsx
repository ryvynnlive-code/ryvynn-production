import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Flame, Shield, Lock, Brain, TrendingUp, Heart, CheckCircle, Users, DollarSign, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HomeNew() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".scroll-animate").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleCTA = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/waitlist");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Crisis Banner - Always Visible, Non-Dismissible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600/90 backdrop-blur-sm px-4 py-3 text-center">
        <p className="text-sm font-medium">
          ⚠️ Need help now? Call <a href="tel:988" className="underline font-bold">988</a> (US) or visit <a href="/crisis" className="underline font-bold">crisis resources</a>
        </p>
      </div>

      {/* SECTION A: HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-blue-950/20" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Dual Flame Icon */}
          <div className="flex justify-center mb-8">
            <div className="animate-breathe">
              <Flame className="w-20 h-20 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Your private space to breathe, process, and rebuild.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            RYVYNN is a zero-surveillance mental wellness ecosystem. 
            No tracking. No accounts. No data harvesting. 
            Just you, your thoughts, and AI support that respects your privacy.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700"
              onClick={handleCTA}
            >
              Begin Your Path →
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 h-auto bg-transparent border-blue-500 hover:bg-blue-500/10"
              onClick={() => setLocation('/pricing')}
            >
              View Pricing
            </Button>
          </div>

          {/* Quick Access - Core Features */}
          {isAuthenticated && (
            <div className="pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500 mb-4">Quick Access</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                  onClick={() => setLocation('/chat')}
                >
                  💬 AI Companion
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                  onClick={() => setLocation('/mood')}
                >
                  😊 Mood Check-In
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                  onClick={() => setLocation('/guided-rituals')}
                >
                  🕯️ Guided Rituals
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                  onClick={() => setLocation('/journal')}
                >
                  📖 Journal
                </Button>
              </div>
            </div>
          )}

          {/* Trust Statement */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 pt-8">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Anonymous
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Encrypted
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Zero Tracking
            </span>
          </div>
        </div>
      </section>

      {/* SECTION B: THE PROBLEM / THE SHIFT */}
      <section className="py-24 md:py-32 px-4 scroll-animate opacity-0">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why traditional wellness apps fail you.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* The Problem */}
            <div className="border-l-4 border-red-500 pl-6 space-y-4">
              <h3 className="text-2xl font-bold text-red-400">The Problem</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Most mental health apps collect your data, sell your patterns, and treat your vulnerability as a product. 
                They require accounts, track your behavior, and expose your most private moments to corporate surveillance. 
                The friction of signing up, the fear of being watched — it keeps people from getting help when they need it most.
              </p>
            </div>

            {/* The Shift */}
            <div className="border-l-4 border-primary pl-6 space-y-4">
              <h3 className="text-2xl font-bold text-primary">The Shift</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                RYVYNN changes everything. No accounts. No cookies. No tracking. Your confessions, journal entries, and reflections 
                are processed in real-time and never stored in raw form. We use AI to support you, not to extract value from your pain. 
                This is mental wellness technology built on ethics, not exploitation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: CORE BENEFITS */}
      <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-black to-blue-950/10 scroll-animate opacity-0">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Built on principles that protect you.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="group p-8 rounded-lg border border-gray-800 bg-black/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">No Tracking, No Identity Harvesting</h3>
              <p className="text-gray-400 leading-relaxed">
                Every interaction is ephemeral. We don't store your raw confessions, we don't track your behavior, 
                and we don't build profiles. Your privacy isn't a feature — it's our foundation.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="group p-8 rounded-lg border border-gray-800 bg-black/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <Lock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">No Accounts, No Friction</h3>
              <p className="text-gray-400 leading-relaxed">
                Start processing your emotions immediately. No sign-up forms, no email verification, no barriers. 
                When you're in crisis, the last thing you need is paperwork.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="group p-8 rounded-lg border border-gray-800 bg-black/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <Brain className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Intelligent Reflection, Zero Exploitation</h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI (the Dual Flame) provides metaphoric responses, grounding exercises, and reflective prompts — 
                all processed in real-time. Your words are transformed into support, then discarded. Never sold. Never stored.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="group p-8 rounded-lg border border-gray-800 bg-black/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Local-Only Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your mood patterns, journal streaks, and ritual completions — all stored locally on your device. 
                No cloud sync. No corporate access. Your progress belongs to you.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="group p-8 rounded-lg border border-gray-800 bg-black/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Immediate Help Without Surveillance</h3>
              <p className="text-gray-400 leading-relaxed">
                Access local crisis resources, breathing exercises, and grounding techniques instantly. 
                We connect you to real help without collecting your identity or location data.
              </p>
            </div>

            {/* Benefit 6 - Foundation Preview */}
            <div className="group p-8 rounded-lg border border-gray-800 bg-black/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Accessible to Everyone</h3>
              <p className="text-gray-400 leading-relaxed">
                The RYVYNN Foundation ensures vulnerable populations have access to mental wellness support, 
                regardless of their ability to pay. Privacy and dignity for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: HOW RYVYNN WORKS */}
      <section id="how-it-works" className="py-24 md:py-32 px-4 scroll-animate opacity-0">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Your journey starts here.
          </h2>

          <div className="relative space-y-16">
            {/* Timeline connector */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-primary/30 hidden md:block" />

            {/* Step 1 */}
            <div className="relative flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold z-10">
                1
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3">Confess Anonymously</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Share what's weighing on you. No login required. No identity attached. 
                  Just you and the void, ready to listen.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold z-10">
                2
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3">Receive the Dual Flame</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Our AI responds with metaphoric reflections — short, poetic, and designed to help you see your situation 
                  from a new angle. Not therapy. Not advice. Just a mirror.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold z-10">
                3
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3">Ground Yourself</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Access breathing exercises, grounding techniques, and daily rituals. 
                  Build a practice that helps you stay present and connected to your resilience.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold z-10">
                4
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3">Journal in Private</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  If you choose to create an account, unlock encrypted journaling with AI-powered reflection prompts. 
                  Your entries are encrypted end-to-end and never leave your control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: RYVYNN FOUNDATION */}
      <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-blue-950/20 to-black scroll-animate opacity-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Heart className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The RYVYNN Foundation
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The RYVYNN Foundation is a nonprofit organization dedicated to making mental wellness technology accessible 
              to vulnerable populations. We believe that privacy, dignity, and support should never be luxuries. 
              Through community partnerships, crisis-access initiatives, and education programs, we're building a world 
              where everyone has a private space to heal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Impact Area 1 */}
            <div className="p-8 rounded-lg border border-primary/30 bg-black/50">
              <DollarSign className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Crisis Access Initiatives</h3>
              <p className="text-gray-400 leading-relaxed">
                Funding free access to RYVYNN for individuals in acute crisis, including survivors of trauma, 
                domestic violence, and homelessness.
              </p>
            </div>

            {/* Impact Area 2 */}
            <div className="p-8 rounded-lg border border-primary/30 bg-black/50">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Subsidized Support</h3>
              <p className="text-gray-400 leading-relaxed">
                Providing reduced-cost subscriptions to underserved communities, including LGBTQ+ youth, veterans, 
                and rural populations with limited mental health resources.
              </p>
            </div>

            {/* Impact Area 3 */}
            <div className="p-8 rounded-lg border border-primary/30 bg-black/50">
              <BookOpen className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Community Resilience Programs</h3>
              <p className="text-gray-400 leading-relaxed">
                Supporting grassroots organizations with mental wellness education, peer support training, 
                and technology access to strengthen community networks.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-transparent" onClick={() => setLocation("/about")}>
              Explore the Foundation →
            </Button>
            <Button size="lg" onClick={() => setLocation("/waitlist")}>
              Support Our Mission
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION F: CREDIBILITY, ETHICS, SAFETY */}
      <section className="py-24 md:py-32 px-4 scroll-animate opacity-0">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How we protect you.
          </h2>

          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Privacy Model</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                RYVYNN operates on a zero-surveillance model. We don't collect personally identifiable information 
                unless you explicitly create an account — and even then, we only store what's necessary for authentication. 
                Your confessions are processed in real-time by AI and immediately discarded. We never sell data. 
                We never share data. We never build advertising profiles. Your vulnerability is not a product.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Data Handling Philosophy</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                When you journal or track your progress, that data is encrypted end-to-end and stored only on your device 
                or in encrypted cloud storage under your control. We use industry-standard encryption (AES-256) and follow 
                GDPR-aligned principles even where not legally required. You can export or delete your data at any time.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Safety Commitment</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                RYVYNN is not a replacement for professional mental health care. We are a wellness tool designed to support 
                emotional processing, grounding, and reflection. If you are in crisis, we will always direct you to local 
                emergency services and crisis hotlines. Our AI is designed to detect crisis language and escalate appropriately 
                — without storing your identity.
              </p>
            </div>
          </div>

          {/* Key Principles Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
            <div className="flex flex-col items-center text-center p-4">
              <Lock className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium">End-to-End Encryption</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium">No Third-Party Tracking</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <BookOpen className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium">Open-Source Transparency</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium">GDPR-Aligned Privacy</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <CheckCircle className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium">Zero Data Sales</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <TrendingUp className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium">Local-First Storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: TESTIMONIAL-STYLE IMPACT */}
      <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-black to-blue-950/10 scroll-animate opacity-0">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Who this is for.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-800 rounded-lg">
              <div className="text-6xl text-primary mb-4">"</div>
              <p className="text-lg italic text-gray-300 mb-6 leading-relaxed">
                I needed to talk, but I couldn't face another intake form. RYVYNN let me just... start. 
                No questions. No judgment. Just space to breathe.
              </p>
              <p className="text-sm text-gray-500">— The Overwhelmed</p>
            </div>

            <div className="p-8 border border-gray-800 rounded-lg">
              <div className="text-6xl text-primary mb-4">"</div>
              <p className="text-lg italic text-gray-300 mb-6 leading-relaxed">
                I've avoided wellness apps because I don't trust them with my data. RYVYNN is the first one 
                that actually respects my privacy — not as a marketing line, but as a design principle.
              </p>
              <p className="text-sm text-gray-500">— The Privacy-Conscious</p>
            </div>

            <div className="p-8 border border-gray-800 rounded-lg">
              <div className="text-6xl text-primary mb-4">"</div>
              <p className="text-lg italic text-gray-300 mb-6 leading-relaxed">
                When I was at my lowest, I didn't have the energy to create an account or explain myself. 
                RYVYNN met me where I was — anonymous, immediate, and kind.
              </p>
              <p className="text-sm text-gray-500">— The Crisis Survivor</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION H: FINAL CTA */}
      <section className="py-32 md:py-40 px-4 relative overflow-hidden scroll-animate opacity-0">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-black to-black" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold">
            Start with RYVYNN.
          </h2>
          <p className="text-2xl text-gray-400">
            Your private space to breathe and rebuild.
          </p>
          <p className="text-lg text-gray-500">
            No tracking. No accounts. No judgment. Just you and the support you deserve.
          </p>

          <div className="pt-6">
            <Button 
              size="lg" 
              className="text-xl px-12 py-8 h-auto"
              onClick={handleCTA}
            >
              Begin Your Path →
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 pt-8">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Anonymous
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Encrypted
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Zero Tracking
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Always Free Core Features
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Column 1: About */}
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/about" className="hover:text-primary transition-colors">About RYVYNN</a></li>
                <li><a href="/about" className="hover:text-primary transition-colors">The Foundation</a></li>
                <li><a href="/manifesto" className="hover:text-primary transition-colors">Our Ethics</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 2: Features */}
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/confess" className="hover:text-primary transition-colors">Anonymous Confessions</a></li>
                <li><a href="/journal" className="hover:text-primary transition-colors">Private Journaling</a></li>
                <li><a href="/rituals" className="hover:text-primary transition-colors">Daily Rituals</a></li>
                <li><a href="/crisis" className="hover:text-primary transition-colors">Crisis Support</a></li>
              </ul>
            </div>

            {/* Column 3: Community */}
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/manifesto" className="hover:text-primary transition-colors">Manifesto</a></li>
                <li><a href="/investors" className="hover:text-primary transition-colors">Investors</a></li>
                <li><a href="/waitlist" className="hover:text-primary transition-colors">Waitlist</a></li>
                <li><a href="/trust" className="hover:text-primary transition-colors">Trust & Safety</a></li>
              </ul>
            </div>

            {/* Column 4: Crisis Resources */}
            <div>
              <h4 className="font-bold mb-4">Crisis Resources</h4>
              <div className="p-4 border border-red-500/50 rounded-lg bg-red-950/20">
                <p className="text-sm font-medium mb-2">If you're in crisis:</p>
                <p className="text-sm text-gray-400 mb-1">🇺🇸 <a href="tel:988" className="underline">988</a> Suicide & Crisis Lifeline</p>
                <p className="text-sm text-gray-400">🌍 <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline">findahelpline.com</a></p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-gray-900 pt-8 text-center text-xs text-gray-600">
            <p className="mb-4">
              RYVYNN is a wellness tool, not a medical device. We do not diagnose, treat, or replace professional mental health care. 
              If you are experiencing a mental health emergency, please contact local emergency services immediately.
            </p>
            <p>© 2025 RYVYNN Foundation. From our darkest hours to our brightest days.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
