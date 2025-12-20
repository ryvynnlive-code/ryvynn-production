# RYVYNN Phase 0 Audit — Current State Inventory

## Current Routes (App Pages)

**Public Pages:**
- `/` - Home (new homepage with 8 sections)
- `/waitlist` - Waitlist signup
- `/pricing` - Pricing page (exists)
- `/manifesto` - Manifesto
- `/origin` - Origin story
- `/about` - About page
- `/investors` - Investors page
- `/trust` - Trust/privacy info
- `/privacy` - Privacy policy
- `/aonixx` - AONIXX parent company

**Auth-Required Pages:**
- `/dashboard` - User dashboard
- `/confess` - Confession/Lantern interface
- `/feed` - Dual Flame Feed (public confessions)
- `/journal` - Personal journal
- `/rituals` - Daily rituals
- `/tokens` - Soul Tokens
- `/settings` - User settings
- `/flame` - Pass the Flame ritual
- `/dark-hour` - Dark Hour Ritual

**Crisis Pages:**
- `/crisis` - Crisis resources page (EXISTS)

**API Routes:**
- `/api/trpc/*` - tRPC endpoints
- `/api/oauth/callback` - Manus OAuth
- `/api/stripe/webhook` - Stripe webhook (exists but needs secrets)

## Current Features Implemented

✅ **Auth System**
- Manus OAuth integration
- Session management with JWT
- Protected/public procedures in tRPC

✅ **Database (TiDB MySQL)**
- Users table with role (admin/user)
- Subscriptions table (for Stripe)
- Scribe_responses table (confessions)
- Journal_entries table
- Soul_tokens table
- Rituals table

✅ **Homepage**
- Complete redesign with 8 sections
- RYVYNN Foundation nonprofit integration
- Zero-surveillance messaging
- Crisis resources integrated

✅ **Stripe Integration (Code Complete, Needs Secrets)**
- All 5 Tesla tiers configured (THREE/SIX/NINE/TWELVE/GUARDIAN)
- Checkout session creation
- Webhook handler with signature verification
- Subscription management
- Customer portal
- **BLOCKED: Missing STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET**

✅ **AI Integration**
- LLM helper configured (invokeLLM)
- Confession processing with valence detection
- Journal AI reflections

✅ **Storage**
- S3 integration for file uploads
- storagePut/storageGet helpers

## Current Integrations

✅ **Database:** TiDB (MySQL) - Connected
✅ **Auth:** Manus OAuth - Working
✅ **Stripe:** Code complete, needs API keys
✅ **AI:** Manus built-in LLM - Working
✅ **Storage:** S3 - Working

## Missing/Claimed But Absent Items

❌ **No /988 or /911 static routes** - Crisis pages exist but not at these URLs
❌ **No always-visible Crisis Bar component** - Crisis banner exists but dismissible
❌ **No age tier system** - Age gate exists but only checks 18+, no MINOR_13_17 vs ADULT_18_PLUS bands
❌ **No geo-aware resources** - Crisis page has static resources, no location-based filtering
❌ **Pricing page not linked in navigation** - Exists but not accessible from homepage
❌ **No waitlist admin interface** - Waitlist signups go to database but no way to view/export them
❌ **No entitlements system** - Stripe integration exists but no feature gating based on subscription tier
❌ **No "Truth Nuggets"** - Mentioned in pricing but not implemented
❌ **No "Nugget Vault"** - Not implemented
❌ **No Avatar evolution system** - Mentioned but not implemented
❌ **No rate limiting** - Write endpoints unprotected
❌ **No RLS policies** - Database has no row-level security
❌ **No security headers/CSP** - Not configured

## Top 3 Build Blockers

1. **Stripe API Keys Missing** - Payment system is code-complete but cannot function without STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET

2. **No Feature Entitlements System** - Subscription tiers exist in Stripe but there's no server/client helper to gate features by tier (FREE vs PLUS vs PRO vs LIFETIME)

3. **Waitlist Data Inaccessible** - Users can sign up for waitlist but owner has no way to view/export the list (no admin interface)

## Immediate Action Plan

**Phase 1 (Production Spine):**
1. Add /988, /911, /crisis static routes
2. Make Crisis Bar always-visible and non-dismissible
3. Implement age tier system (MINOR_13_17 vs ADULT_18_PLUS)
4. Add geo-aware resources with manual selection
5. Link pricing page in navigation
6. Create waitlist admin interface
7. Implement entitlements system for feature gating
8. Implement Truth Nuggets + Nugget Vault
9. Implement Avatar evolution (XP/level system)

**Phase 2 (Database Security):**
1. Add RLS policies for user-owned tables
2. Add rate limiting for write endpoints
3. Add env validation at startup
4. Add security headers/CSP

**Phase 3 (Deployment):**
1. Verify build passes
2. Document required env vars
3. Document Stripe webhook setup
4. Create smoke-test checklist
