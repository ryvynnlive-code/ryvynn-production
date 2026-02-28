"use client"

import { useState } from "react"
import { Flame, Check, Zap, Users, Heart, Building2, Infinity } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const TIERS = [
  {
    id:          "free",
    name:        "Crisis",
    tagline:     "Always free. No exceptions.",
    price:       "$0",
    period:      "forever",
    priceId:     null,
    mode:        null,
    icon:        Heart,
    color:       "from-zinc-800 to-zinc-900",
    border:      "border-zinc-700",
    accent:      "#71717a",
    cta:         "Start Free",
    ctaStyle:    "bg-zinc-700 hover:bg-zinc-600 text-white",
    features: [
      "Unlimited anonymous confessions",
      "AI miracle transformation",
      "Crisis detection + 988 hotline",
      "Public miracle feed",
      "Zero surveillance, always",
      "Immediate deletion after processing",
    ],
  },
  {
    id:       "solo",
    name:     "Solo Flame",
    tagline:  "Personal ignition.",
    price:    "$12.12",
    period:   "/mo",
    priceId:  "price_1T3LjdFQvVkmN1b80afextYF",
    mode:     "subscription",
    icon:     Zap,
    color:    "from-fuchsia-950 to-zinc-900",
    border:   "border-fuchsia-800/60",
    accent:   "#c026d3",
    cta:      "Ignite",
    ctaStyle: "bg-fuchsia-700 hover:bg-fuchsia-600 text-white",
    features: [
      "Everything in Crisis",
      "Dark Journal (encrypted vault)",
      "Growing Avatar System (GAAS)",
      "AI guardian — always on",
      "Priority miracle generation",
      "Sound healing + frequency player",
      "Soul Token wallet",
    ],
  },
  {
    id:       "family",
    name:     "Family Flame",
    tagline:  "Blessings scale to kin.",
    price:    "$36.93",
    period:   "/mo",
    priceId:  "price_1T3LjnFQvVkmN1b8lUiEJyDs",
    mode:     "subscription",
    icon:     Users,
    color:    "from-violet-950 to-zinc-900",
    border:   "border-violet-700/60",
    accent:   "#7c3aed",
    cta:      "Cover Your People",
    ctaStyle: "bg-violet-700 hover:bg-violet-600 text-white",
    highlight: true,
    badge:    "MOST LOVED",
    features: [
      "Everything in Solo Flame",
      "Up to 6 members",
      "Shared Soul Token pool",
      "Family Witness Circle",
      "Group blessings cascade",
      "Unified crisis dashboard",
      "Admin controls",
    ],
  },
  {
    id:       "therapist",
    name:     "Therapist",
    tagline:  "Pro guardian tools.",
    price:    "$69.36",
    period:   "/mo",
    priceId:  "price_1T3LjuFQvVkmN1b81Vg49Wpq",
    mode:     "subscription",
    icon:     Building2,
    color:    "from-orange-950 to-zinc-900",
    border:   "border-orange-800/60",
    accent:   "#ea580c",
    cta:      "Equip Your Practice",
    ctaStyle: "bg-orange-700 hover:bg-orange-600 text-white",
    features: [
      "Everything in Family Flame",
      "Client crisis dashboards",
      "Session notes integration",
      "Anonymized outcome reports",
      "Multiplied Soul Token grants",
      "Priority support line",
      "HIPAA-conscious design",
    ],
  },
  {
    id:       "enterprise",
    name:     "Enterprise",
    tagline:  "Org-level soul pools.",
    price:    "$96.36",
    period:   "/mo",
    priceId:  "price_1T3Lk1FQvVkmN1b8b7BjRZxS",
    mode:     "subscription",
    icon:     Building2,
    color:    "from-red-950 to-zinc-900",
    border:   "border-red-800/60",
    accent:   "#dc2626",
    cta:      "Deploy at Scale",
    ctaStyle: "bg-red-700 hover:bg-red-600 text-white",
    features: [
      "Everything in Therapist",
      "Unlimited users",
      "Custom crisis protocols",
      "White-label option",
      "Dedicated success manager",
      "SLA + uptime guarantee",
      "API access",
    ],
  },
  {
    id:       "lifetime",
    name:     "Lifetime Flame",
    tagline:  "Eternal. One time. Done.",
    price:    "$369.36",
    period:   "once",
    priceId:  "price_1T3Lk7FQvVkmN1b8TxqsKbd4",
    mode:     "payment",
    icon:     Infinity,
    color:    "from-yellow-950 to-zinc-900",
    border:   "border-yellow-600/60",
    accent:   "#ca8a04",
    cta:      "Burn Forever",
    ctaStyle: "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold",
    features: [
      "Everything, forever",
      "One payment — no recurring",
      "Eternity Message vault",
      "Encrypted letters to descendants",
      "Permanent Soul Token reservoir",
      "Founder-level access",
      "Early access to all future features",
    ],
  },
]

function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const success  = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  async function handleCheckout(tier: typeof TIERS[0]) {
    if (!tier.priceId) {
      window.location.href = "/"
      return
    }
    setLoading(tier.id)
    try {
      const res  = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId: tier.priceId, mode: tier.mode }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert("Checkout error: " + (data.error || "No URL returned"))
    } catch {
      alert("Could not connect to payment. Try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* Success / Cancel banners */}
      {success && (
        <div className="bg-fuchsia-900/80 text-fuchsia-100 text-center py-3 text-sm font-medium">
          🔥 Flame ignited. Welcome to RYVYNN. Check your email.
        </div>
      )}
      {canceled && (
        <div className="bg-zinc-800 text-zinc-400 text-center py-3 text-sm">
          Payment canceled — your free tier is always here.
        </div>
      )}

      {/* Header */}
      <div className="text-center px-6 pt-16 pb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Flame className="h-8 w-8 text-fuchsia-400" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            The Dual Flame Grid
          </h1>
        </div>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Crisis support is free forever. Premium fuels the mission — and unlocks everything.
        </p>
        <p className="text-zinc-600 text-xs mt-3">
          Pricing inspired by Tesla 3-6-9. Zero surveillance at every tier.
        </p>
      </div>

      {/* Tier cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const Icon = tier.icon
          const isLoading = loading === tier.id
          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl bg-gradient-to-b ${tier.color} border ${tier.border} p-6 flex flex-col ${
                tier.highlight ? "ring-2 ring-violet-500/50 shadow-lg shadow-violet-900/20" : ""
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full tracking-widest">
                  {tier.badge}
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-5 w-5" style={{ color: tier.accent }} />
                  <h2 className="text-lg font-bold">{tier.name}</h2>
                </div>
                <p className="text-zinc-500 text-sm">{tier.tagline}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-zinc-500 text-sm ml-1">{tier.period}</span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: tier.accent }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(tier)}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${tier.ctaStyle} disabled:opacity-60`}
                style={tier.highlight ? { boxShadow: `0 0 20px ${tier.accent}40` } : undefined}
              >
                {isLoading ? "Opening..." : tier.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom trust row */}
      <div className="text-center mt-16 px-6 space-y-3">
        <p className="text-zinc-600 text-xs">
          🔒 Zero surveillance · Anonymous by design · Crisis access free forever
        </p>
        <p className="text-zinc-700 text-xs">
          Powered by NEXXT GEN INNOVATIONS LLC DBA AONIXX · ryvynn.live
        </p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors mt-2">
          <Flame className="h-3.5 w-3.5" />
          Back to the Flame
        </Link>
      </div>
    </main>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>}>
      <PricingContent />
    </Suspense>
  )
}
