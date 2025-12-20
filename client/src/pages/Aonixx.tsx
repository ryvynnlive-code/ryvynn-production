import { Button } from "@/components/ui/button";
import { Flame, Zap, Wrench, Rocket, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * AONIXX Landing Page
 * High-conversion micro-site with trillion-dollar aesthetic
 * "Power Unlocked" - Done-For-You AI Powerhouse
 */

const services = [
  { title: "Fix my website", icon: Wrench },
  { title: "Build me a brand", icon: Sparkles },
  { title: "Write me a sales funnel", icon: Rocket },
  { title: "Make me a marketing ad", icon: Zap },
  { title: "Create my business", icon: Flame },
  { title: "Design me a landing page", icon: Shield },
  { title: "Build my product pitch", icon: Rocket },
  { title: "Write my investor email", icon: Sparkles },
  { title: "Repair my code", icon: Wrench },
  { title: "Automate my business", icon: Zap },
];

const valueProps = [
  {
    title: "Instant AI Solutions",
    description: "Give AONIXX a problem. Get a full solution, step-by-step.",
    icon: Zap,
  },
  {
    title: "Done-For-You Builds",
    description: "Landing pages, funnels, emails, branding, scripts — delivered instantly.",
    icon: Rocket,
  },
  {
    title: "Fix Anything Mode",
    description: "Show AONIXX what's broken. It fixes it or rebuilds it better.",
    icon: Wrench,
  },
  {
    title: "The Reason to Choose AONIXX",
    description: "Fastest execution. Zero fluff, zero noise. Solves real problems right now. Affordable, immediate, powerful.",
    icon: Flame,
  },
];

export default function Aonixx() {
  const [pillarHeight, setPillarHeight] = useState(0);
  const [floatingBadgesVisible, setFloatingBadgesVisible] = useState(false);

  // Pillar animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillarHeight(100);
    }, 300);

    const badgeTimer = setTimeout(() => {
      setFloatingBadgesVisible(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(badgeTimer);
    };
  }, []);

  const handleOrderNow = (service: string) => {
    // TODO: Implement order/contact flow
    alert(`Order: ${service}\n\nThis will connect to your payment/contact system.`);
  };

  const handleCTA = (action: string) => {
    // TODO: Implement CTA actions
    alert(`CTA: ${action}\n\nThis will navigate to your onboarding flow.`);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      {/* Floating Badges */}
      {floatingBadgesVisible && (
        <>
          <div className="fixed top-20 right-10 z-50 animate-float">
            <div className="bg-[#1A6CFF]/10 border border-[#1A6CFF]/30 rounded-full px-4 py-2 text-xs font-semibold text-[#1A6CFF] shadow-[0_0_20px_rgba(26,108,255,0.3)]">
              AI-Powered
            </div>
          </div>
          <div className="fixed top-40 right-16 z-50 animate-float" style={{ animationDelay: "0.5s" }}>
            <div className="bg-[#1A6CFF]/10 border border-[#1A6CFF]/30 rounded-full px-4 py-2 text-xs font-semibold text-[#1A6CFF] shadow-[0_0_20px_rgba(26,108,255,0.3)]">
              Fast
            </div>
          </div>
          <div className="fixed top-60 right-12 z-50 animate-float" style={{ animationDelay: "1s" }}>
            <div className="bg-[#1A6CFF]/10 border border-[#1A6CFF]/30 rounded-full px-4 py-2 text-xs font-semibold text-[#1A6CFF] shadow-[0_0_20px_rgba(26,108,255,0.3)]">
              Done For You
            </div>
          </div>
        </>
      )}

      {/* Floating Chat Bubble */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => handleCTA("Chat")}
          className="bg-[#1A6CFF] hover:bg-[#1A6CFF]/90 text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(26,108,255,0.5)] hover:shadow-[0_0_40px_rgba(26,108,255,0.7)] transition-all font-medium"
        >
          Need something built? Ask me.
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Vertical Pillar Animation */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 bg-gradient-to-t from-[#1A6CFF] to-transparent transition-all duration-[2000ms] ease-out shadow-[0_0_30px_rgba(26,108,255,0.8)]"
          style={{ height: `${pillarHeight}%` }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            AONIXX <span className="text-[#1A6CFF]">//</span> Power Unlocked.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light leading-relaxed">
            AI that gets you unstuck, solves your problems, and builds what you need — fast.
          </p>

          <p className="text-sm md:text-base text-gray-400 mb-12 italic">
            Built by the creator of <span className="text-[#1A6CFF] font-semibold">RYVYNN</span> — the anonymous wellness platform changing lives from the dark to the light.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleCTA("Start Now")}
              size="lg"
              className="bg-[#1A6CFF] hover:bg-[#1A6CFF]/90 text-white px-8 py-6 text-lg font-semibold shadow-[0_0_30px_rgba(26,108,255,0.5)] hover:shadow-[0_0_40px_rgba(26,108,255,0.7)] transition-all"
            >
              Start Now
            </Button>
            <Button
              onClick={() => handleCTA("See What's Possible")}
              size="lg"
              variant="outline"
              className="border-[#1A6CFF] text-[#1A6CFF] hover:bg-[#1A6CFF]/10 px-8 py-6 text-lg font-semibold"
            >
              See What's Possible
            </Button>
          </div>
        </div>
      </section>

      {/* Value Stack Sections */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {valueProps.map((prop, index) => {
              const Icon = prop.icon;
              return (
                <div
                  key={index}
                  className="bg-[#0a0a0a] border border-[#1A6CFF]/20 rounded-lg p-8 hover:border-[#1A6CFF]/50 transition-all hover:shadow-[0_0_30px_rgba(26,108,255,0.2)]"
                >
                  <Icon className="w-12 h-12 text-[#1A6CFF] mb-4" />
                  <h3 className="text-2xl font-bold mb-3">{prop.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{prop.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Money Services Grid */}
      <section className="py-24 px-4 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Quick Money Services
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Order what you need. Get it done. Move forward.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-black border border-[#1A6CFF]/20 rounded-lg p-6 hover:border-[#1A6CFF]/50 transition-all group"
                >
                  <Icon className="w-8 h-8 text-[#1A6CFF] mb-3" />
                  <h4 className="text-lg font-semibold mb-4">{service.title}</h4>
                  <Button
                    onClick={() => handleOrderNow(service.title)}
                    className="w-full bg-[#1A6CFF] hover:bg-[#1A6CFF]/90 text-white font-semibold shadow-[0_0_20px_rgba(26,108,255,0.3)] group-hover:shadow-[0_0_30px_rgba(26,108,255,0.5)] transition-all"
                  >
                    ORDER NOW
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl text-gray-300 mb-6 font-light">
            Trusted by founders, creators, small businesses, and people who needed a breakthrough.
          </p>
          <p className="text-sm text-gray-500 italic">
            Built by the same founder behind <span className="text-[#1A6CFF] font-semibold">RYVYNN</span> — the anonymous mental-wellness platform changing lives.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#1A6CFF]/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 mb-2">AONIXX © 2025</p>
          <p className="text-sm text-gray-600 italic">
            Built in the dark. Made for your breakthrough.
          </p>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
