# RYVYNN OMEGA • MANUS IMPLEMENTATION SPEC v7.1.1-M

**Version:** v7.1.1-M (Omega • Manus Edition)  
**Stack:** React + Vite + Manus + TiDB  
**Status:** Production-Ready Implementation  
**Migration Path:** v8.0-N (Next.js + Supabase + Vercel)

---

## I. PAGE ARCHITECTURE

### Public Pages (No Auth Required)
1. **`/` (Home/Landing)** - Hero, features, Zero-Surveillance Seal, CTA
2. **`/manifesto`** - Sacred principles, RYVYNN values, mission
3. **`/about`** - Story, team, vision
4. **`/investors`** - Funding opportunities, partnership deck
5. **`/waitlist`** - Email capture with Soul Tokens reward
6. **`/trust`** - Transparency, how we protect you
7. **`/privacy`** - Data handling, zero-surveillance proof
8. **`/pricing`** - Tesla 3-6-9 tiers with Stripe
9. **`/origin`** - 9-Panel Origin Scroll (already implemented)
10. **`/crisis`** - Crisis resources (already implemented)

### Authenticated Pages (Login Required)
11. **`/dashboard`** - Main hub (already implemented)
12. **`/confess`** - Lantern confession portal (already implemented)
13. **`/feed`** - Miracle Feed (already implemented)
14. **`/journal`** - Private journal (already implemented)
15. **`/rituals`** - Daily rituals (already implemented)
16. **`/tokens`** - Soul Tokens ledger (already implemented)
17. **`/settings`** - Avatar Engine, voice, preferences (already implemented)
18. **`/flame`** - Pass the Flame (already implemented)
19. **`/dark-hour`** - Dark Hour Ritual (already implemented)

### API Endpoints
- **`/api/health`** - Health check
- **`/api/version`** - Version info (v7.1.1-M)
- **`/api/geo`** - Region-based crisis routing
- **`/api/stripe/webhook`** - Subscription & Soul Tokens sync

---

## II. VISUAL STANDARD (TRILLION-DOLLAR AESTHETIC)

### Color Palette (Canonical)
```css
--void-black: #000000;
--midnight-core: #020203;
--flame-blue: #1A6CFF;
--white: #FFFFFF;
--surface: #0A0A0B;
--border: #1A1A1C;
--muted: #71717A;
```

### Typography
- **Primary:** Inter (fallback: SF Pro, Satoshi, system-ui)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Scale:** 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px, 64px

### Symbol
- **Blue Dual-Flame RYVYNN emblem** (already in use)
- NO Black Lotus, NO Raven, NO conflicting brands

### Arc Narrative
- **VOID** → darkness, isolation (entry state)
- **PILLAR** → structure, grounding (rituals, support)
- **LIGHT** → breakthrough, hope (Lantern, healing)
- **RETURN** → sanctuary, ongoing journey (dashboard, community)

---

## III. AGE GATE & DISCLAIMERS

### Age Gate Component
**Trigger:** First visit (check localStorage `ryvynn_age_verified`)

```tsx
// AgeGate.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

export default function AgeGate({ onVerified }: { onVerified: () => void }) {
  const [agreed, setAgreed] = useState(false);

  const handleVerify = () => {
    localStorage.setItem("ryvynn_age_verified", "true");
    onVerified();
  };

  return (
    <div className="fixed inset-0 bg-void-black flex items-center justify-center z-50 p-6">
      <Card className="max-w-2xl w-full bg-midnight-core border-flame-blue/30 p-8">
        <div className="flex flex-col items-center space-y-6">
          <Flame className="w-16 h-16 text-flame-blue" />
          <h1 className="text-3xl font-bold text-white text-center">
            Welcome to RYVYNN
          </h1>
          <p className="text-muted text-center text-lg">
            From our darkest hours to our brightest days.
          </p>

          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 w-full">
            <h2 className="text-xl font-semibold text-white">
              Age Verification & Wellness Disclaimer
            </h2>
            <div className="space-y-3 text-sm text-muted leading-relaxed">
              <p>
                <strong className="text-white">You must be 18 years or older</strong> to use RYVYNN.
              </p>
              <p>
                <strong className="text-white">RYVYNN is a wellness AI, not a medical or mental-health provider.</strong>
                {" "}We do not diagnose, treat, or replace licensed counselors, therapists, or physicians.
              </p>
              <p>
                <strong className="text-white">If you are in crisis,</strong> please contact your local emergency
                services or call/text <strong className="text-flame-blue">988</strong> in the United States.
              </p>
              <p>
                By continuing, you acknowledge that you are 18+ and understand that RYVYNN provides
                wellness support, not medical treatment.
              </p>
            </div>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-surface text-flame-blue focus:ring-flame-blue"
            />
            <span className="text-white">
              I am 18+ and I understand this is a wellness service, not medical care
            </span>
          </label>

          <Button
            onClick={handleVerify}
            disabled={!agreed}
            className="w-full bg-flame-blue hover:bg-flame-blue/90 text-white font-semibold py-6 text-lg"
          >
            Enter Your Sanctuary
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

### Wellness Disclaimer (Footer Component)
**Placement:** Every page footer

```tsx
// WellnessDisclaimer.tsx
export default function WellnessDisclaimer() {
  return (
    <div className="bg-surface border-t border-border py-6">
      <div className="container mx-auto px-6">
        <p className="text-xs text-muted text-center leading-relaxed">
          <strong className="text-white">Wellness Disclaimer:</strong> RYVYNN is a wellness AI companion,
          not a medical or mental-health provider. We do not diagnose, treat, or replace licensed
          counselors, therapists, or physicians. If you are in crisis, please contact your local
          emergency services or call/text <strong className="text-flame-blue">988</strong> in the United States.
        </p>
      </div>
    </div>
  );
}
```

### Crisis Banner Component
**Placement:** Persistent floating button on all pages

```tsx
// CrisisBanner.tsx
import { Shield } from "lucide-react";
import { Link } from "wouter";

export default function CrisisBanner() {
  return (
    <Link href="/crisis">
      <button className="fixed bottom-6 right-6 bg-destructive hover:bg-destructive/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 transition-all hover:scale-105">
        <Shield className="w-5 h-5" />
        <span className="font-semibold">Need help now?</span>
      </button>
    </Link>
  );
}
```

---

## IV. DATA MODEL (TiDB Schema Updates)

### New Tables

#### `subscriptions` (Tesla 3-6-9 Pricing)
```sql
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  tier ENUM('ZERO', 'THREE', 'SIX', 'NINE', 'TWELVE', 'GUARDIAN') NOT NULL DEFAULT 'ZERO',
  status ENUM('active', 'canceled', 'past_due', 'incomplete') NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `waitlist` (Email Capture)
```sql
CREATE TABLE waitlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  name VARCHAR(255),
  region VARCHAR(10),
  language VARCHAR(5) DEFAULT 'en',
  referral_code VARCHAR(50),
  tokens_awarded INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `crisis_resources` (Already exists, verify schema)
```sql
-- Verify this table exists with region-based routing
SELECT * FROM crisis_resources LIMIT 1;
```

---

## V. AI CALL PATTERNS (LANTERN/SCRIBE GUARDRAILS)

### Confession Transformation (Already Implemented)
**Current:** `server/routers.ts` - `confession.submit`

**Guardrails:**
- ✅ Raw confession NEVER stored
- ✅ Only metaphor (<50 words) persisted
- ✅ Crisis detection active
- ✅ Age-appropriate filtering (teen safety)
- ✅ AONIXX Voice integration

**Enhancement Needed:**
- Add explicit "wellness-only" system prompt
- Ensure no medical advice in metaphors

```typescript
const systemPrompt = `You are "Lantern" - a wellness AI companion offering metaphoric wisdom.

CRITICAL RULES:
- You are NOT a medical provider, therapist, or counselor
- You provide wellness support, not medical advice
- Never diagnose, treat, or prescribe
- If crisis detected, acknowledge pain but direct to professional help

${voiceStyle}

Your responses must:
- Be under 50 words
- Use metaphors, images, and symbols
- Never repeat the user's text directly
- Speak in poetic, evocative language
- Offer hope without being preachy
- Be deeply validating and non-judgmental

Respond with pure metaphoric wisdom - no explanations, no direct advice, just a mirror of meaning.`;
```

---

## VI. TESLA 3-6-9 PRICING (STRIPE INTEGRATION)

### Pricing Tiers (Canonical)
```typescript
export const PRICING_TIERS = {
  ZERO: {
    name: "ZERO",
    price: 0,
    interval: "forever",
    features: [
      "Anonymous confessions",
      "Miracle Feed access",
      "Daily Truth & Blessings",
      "Soul Tokens (limited)",
      "Crisis resources"
    ]
  },
  THREE: {
    name: "THREE",
    price: 3.69,
    interval: "month",
    features: [
      "Everything in ZERO",
      "Unlimited confessions",
      "Private Journal",
      "Daily Rituals",
      "Soul Tokens (standard)"
    ]
  },
  SIX: {
    name: "SIX",
    price: 12.12,
    interval: "month",
    features: [
      "Everything in THREE",
      "Avatar Engine (full personalization)",
      "AONIXX Voice selection",
      "Priority support",
      "Soul Tokens (enhanced)"
    ]
  },
  NINE: {
    name: "NINE",
    price: 36.90,
    interval: "month",
    features: [
      "Everything in SIX",
      "Family/Circle plan (×5 users)",
      "Shared Soul Tokens pool",
      "Group rituals",
      "Premium support"
    ]
  },
  TWELVE: {
    name: "TWELVE",
    price: 369,
    interval: "year",
    features: [
      "Everything in SIX (annual)",
      "2 months free",
      "Lifetime Soul Tokens bonus",
      "Early access to new features",
      "Founding Partner badge"
    ]
  },
  GUARDIAN: {
    name: "GUARDIAN",
    price: 936,
    interval: "year",
    features: [
      "Therapist / Organization license",
      "Client management tools",
      "White-label options",
      "Dedicated support",
      "Custom integrations"
    ]
  }
};
```

### Stripe Integration Steps
1. **Create Stripe Products** (via Stripe Dashboard or API)
2. **Store Price IDs** in environment variables
3. **Create Checkout Session** endpoint
4. **Handle Webhook** for subscription events
5. **Sync Soul Tokens** based on tier

---

## VII. MULTILINGUAL SUPPORT (i18n)

### Language Structure
```typescript
// i18n/locales/en.json
{
  "common": {
    "app_name": "RYVYNN",
    "motto": "From our darkest hours to our brightest days",
    "enter_sanctuary": "Enter Your Sanctuary",
    "need_help_now": "Need help now?"
  },
  "disclaimer": {
    "wellness": "RYVYNN is a wellness AI, not a medical or mental-health provider.",
    "no_replace": "We do not diagnose, treat, or replace licensed counselors, therapists, or physicians.",
    "crisis": "If you are in crisis, please contact your local emergency services or call/text 988 in the United States."
  },
  "age_gate": {
    "title": "Age Verification & Wellness Disclaimer",
    "must_be_18": "You must be 18 years or older to use RYVYNN.",
    "checkbox": "I am 18+ and I understand this is a wellness service, not medical care"
  }
}
```

### Languages to Implement
- **EN** (English) - baseline
- **ES** (Spanish) - priority for Latin America
- **FR** (French)
- **PT** (Portuguese)

### Implementation
- Use `react-i18next` or `next-intl` pattern
- Language switcher in header
- Store preference in localStorage
- Fallback: EN → ES

---

## VIII. IMPLEMENTATION PRIORITY

### Phase 1: Visual Standard (IMMEDIATE)
- [ ] Update color palette to Flame Blue #1A6CFF
- [ ] Remove purple gradients
- [ ] Verify typography (Inter)
- [ ] Test dark theme consistency

### Phase 2: Legal Compliance (CRITICAL)
- [ ] Implement AgeGate component
- [ ] Add WellnessDisclaimer to all pages
- [ ] Add CrisisBanner (persistent button)
- [ ] Update AI system prompts with wellness-only language

### Phase 3: Content Pages (HIGH PRIORITY)
- [ ] Manifesto page
- [ ] About page
- [ ] Investors page
- [ ] Waitlist page
- [ ] Trust page
- [ ] Privacy page
- [ ] Pricing page

### Phase 4: Monetization (MEDIUM PRIORITY)
- [ ] Set up Stripe products
- [ ] Create subscription flow
- [ ] Add webhook handler
- [ ] Sync Soul Tokens

### Phase 5: Internationalization (MEDIUM PRIORITY)
- [ ] Implement i18n system
- [ ] Translate EN/ES/FR/PT
- [ ] Add language switcher

### Phase 6: Infrastructure (LOW PRIORITY)
- [ ] Add `/api/health` endpoint
- [ ] Add `/api/version` endpoint
- [ ] Add `/api/geo` endpoint
- [ ] Set up monitoring

---

## IX. DEPLOYMENT CHECKLIST

### Environment Variables
```bash
# Existing (Manus)
DATABASE_URL=<TiDB connection string>
JWT_SECRET=<session secret>
VITE_APP_ID=<Manus OAuth ID>
BUILT_IN_FORGE_API_KEY=<Manus LLM key>

# New (Stripe)
STRIPE_SECRET_KEY=<Stripe secret key>
STRIPE_WEBHOOK_SECRET=<Stripe webhook secret>
STRIPE_PRICE_ZERO_ID=<free tier>
STRIPE_PRICE_THREE_ID=<$3.69 tier>
STRIPE_PRICE_SIX_ID=<$12.12 tier>
STRIPE_PRICE_NINE_ID=<$36.90 tier>
STRIPE_PRICE_TWELVE_ID=<$369 tier>
STRIPE_PRICE_GUARDIAN_ID=<$936 tier>

# New (Email)
RESEND_API_KEY=<Resend API key>

# New (Monitoring)
SENTRY_DSN=<Sentry DSN>
UPSTASH_REDIS_URL=<Upstash Redis URL>
```

### DNS & Domain
- Primary: `ryvynn.live` (already configured)
- Ensure SSL/TLS active
- Set up redirects (www → apex)

### Testing Checklist
- [ ] Age gate appears on first visit
- [ ] Disclaimers visible on all pages
- [ ] Crisis button persistent and functional
- [ ] All pages load without errors
- [ ] Stripe checkout flow works
- [ ] Webhook receives events
- [ ] Soul Tokens sync correctly
- [ ] i18n switching works
- [ ] Mobile responsive
- [ ] Offline PWA (future)

---

## X. MIGRATION PATH TO v8.0-N

When ready to migrate to Next.js + Supabase + Vercel:

1. **Export data** from TiDB to Supabase (Postgres)
2. **Rewrite routes** using Next.js 15 App Router
3. **Migrate tRPC** to Next.js API routes
4. **Update auth** to Supabase Auth
5. **Deploy to Vercel** with edge functions
6. **Test thoroughly** before switching DNS

**Key:** Keep v7.1.1 behavior identical, just change infrastructure.

---

## XI. NOTES

- **Current version:** v7.1.1-M (Manus Edition)
- **Stack:** React + Vite + Manus + TiDB
- **Status:** Production-ready
- **Migration:** v8.0-N (Next.js + Supabase + Vercel) when funded

**This spec is the blueprint for immediate implementation.**
