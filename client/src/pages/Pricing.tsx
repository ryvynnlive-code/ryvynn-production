import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Flame, Check } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PRICING_TIERS, formatPrice, getCtaText, type PricingTierId } from "@/lib/pricing";

/**
 * RYVYNN Pricing Page
 * Tesla 3-6-9 Pricing Grid
 * Brightness Level 4 (brightest)
 */
export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const createCheckout = trpc.payment.createCheckout.useMutation();

  const handleSubscribe = async (tierId: PricingTierId) => {
    // ZERO tier is always free
    if (tierId === "ZERO") {
      if (!isAuthenticated) {
        window.location.href = getLoginUrl();
      } else {
        toast.success("You're already using RYVYNN for free!");
      }
      return;
    }

    // GUARDIAN tier requires contact
    if (tierId === "GUARDIAN") {
      window.location.href = "mailto:guardian@ryvynn.live?subject=GUARDIAN License Inquiry";
      return;
    }

    // Other tiers require authentication
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    setLoading(tierId);
    try {
      // Get the Stripe price ID for this tier
      const tier = PRICING_TIERS.find(t => t.id === tierId);
      if (!tier || !tier.stripePriceId) {
        toast.error("This tier is not yet available. Please contact support.");
        setLoading(null);
        return;
      }

      // Map Tesla tier IDs to backend tier names
      const tierMap: Record<string, "three" | "six" | "nine" | "twelve" | "guardian"> = {
        "THREE": "three",
        "SIX": "six",
        "NINE": "nine",
        "TWELVE": "twelve",
        "GUARDIAN": "guardian",
      };
      
      const backendTier = tierMap[tierId];
      if (!backendTier) {
        toast.error("Invalid tier selected");
        setLoading(null);
        return;
      }

      const result = await createCheckout.mutateAsync({
        tier: backendTier,
      });
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
      setLoading(null);
    }
  };

  return (
    <>
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1c]/80 backdrop-blur-sm border-b border-[#8cb4ff]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <Flame className="w-8 h-8 text-[#8cb4ff]" />
                <span className="text-2xl font-bold text-white">{APP_TITLE}</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/manifesto">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Manifesto
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-[#8cb4ff] to-[#a8c8ff] text-black">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-gradient-to-r from-[#8cb4ff] to-[#a8c8ff] text-black">
                    Sign in
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Tesla 3-6-9 Pricing
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From our darkest hours to our brightest days. Choose the path that serves your journey.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={`relative p-8 bg-gradient-to-br from-[#1a1a1c] to-[#0a0a0b] border ${
                  tier.highlighted
                    ? "border-[#8cb4ff] shadow-[0_0_30px_rgba(140,180,255,0.3)]"
                    : "border-[#8cb4ff]/20"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8cb4ff] to-[#a8c8ff] text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.label}</h3>
                  <div className="text-4xl font-bold text-[#8cb4ff] mb-2">
                    {formatPrice(tier)}
                  </div>
                  <p className="text-sm text-slate-400">{tier.tagline}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-[#8cb4ff] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id}
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-[#8cb4ff] to-[#a8c8ff] text-black hover:shadow-[0_0_20px_rgba(140,180,255,0.5)]"
                      : "bg-[#8cb4ff]/10 text-[#8cb4ff] border border-[#8cb4ff]/30 hover:bg-[#8cb4ff]/20"
                  }`}
                >
                  {loading === tier.id ? "Processing..." : getCtaText(tier)}
                </Button>
              </Card>
            ))}
          </div>

          {/* FAQ / Additional Info */}
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Can I really use RYVYNN for free forever?</h3>
                <p className="text-slate-300">
                  Yes. The ZERO tier is free forever, no credit card required. You get anonymous emotional support, 
                  AI-powered Dual Flame responses, and crisis resource access. We believe everyone deserves a safe space.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">What's the difference between THREE and SIX?</h3>
                <p className="text-slate-300">
                  THREE ($3.69/mo) is a first-month intro price to try RYVYNN Plus. After the first month, it automatically 
                  becomes SIX ($12.12/mo). SIX gives you full access to daily rituals, private journaling, mood tracking, 
                  and voice persona customization.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">What is a Family Circle (NINE tier)?</h3>
                <p className="text-slate-300">
                  NINE ($36.90/mo) allows you to create a Family Circle for up to 5 people. Share rituals, blessings, 
                  and insights while maintaining individual privacy. Perfect for small families or close-knit groups.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">How does the annual plan (TWELVE) work?</h3>
                <p className="text-slate-300">
                  TWELVE ($369/year) gives you everything in SIX but billed annually. You save $76.44 compared to paying 
                  monthly, and you get access to exclusive annual rituals and priority feature access.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Who is GUARDIAN for?</h3>
                <p className="text-slate-300">
                  GUARDIAN ($936/license) is designed for therapists, counselors, and organizations who want to use RYVYNN 
                  with their clients or members. It includes HIPAA-compliant workflows, white-label options, and dedicated support. 
                  Contact us to learn more.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Can I cancel anytime?</h3>
                <p className="text-slate-300">
                  Yes. All paid tiers can be canceled anytime from your account settings. You'll retain access until the end 
                  of your billing period, then automatically return to the ZERO tier.
                </p>
              </div>
            </div>
          </div>

          {/* Wellness Disclaimer */}
          <div className="mt-16 max-w-4xl mx-auto">
            <WellnessDisclaimer />
          </div>
        </div>
      </div>
    </>
  );
}
