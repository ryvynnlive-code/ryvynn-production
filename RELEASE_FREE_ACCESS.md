# RYVYNN free-access release

Base: `cd29c68d55a4291ecbf338f4ea80e08a2dd9c3d4` in `ryvynnlive-code/ryvynn-production`.

## Behavior

- Every available feature is free for individuals, families, and therapists. Pricing, promo, and referral URLs explain free access.
- The paid checkout endpoint returns HTTP 410. Token costs are zero; tokens do not gate access.
- Optional donations remain separate and do not grant entitlements. This code does not cancel pre-existing Stripe subscriptions. Reconcile any existing recurring paid plans in the correct Stripe account before declaring billing fully retired.
- Private journals, Eternity, token history, and deletion require a verified Supabase access token matching the requested user. Free access does not grant access to another person's data.
- All Supabase clients use environment configuration; no hardcoded fallback database is selected.
- Guardian messages are processed by Groq. This is disclosed in the interface; server-blind AI processing is not claimed.

## Dependencies and verification

Next.js 15.5.28, React/React DOM 19.3.1, and Supabase JS 2.118.0 are pinned. Tailwind 3 is retained to preserve the design. PostCSS 8.5.31 and selector-parser 7.1.6 overrides patch vulnerable transitive versions. Node 24.x is specified and used for local verification. The lockfile is committed.

Run `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, `npm audit`, and `npm run build`. Builds can use synthetic public Supabase configuration for compilation only. That is not a production integration test. Production credentials must never be used in PR tests or printed in logs.

## Production prerequisites

1. Authorize the Vercel connection for team `ryvynn` and confirm project `ryvnn-prod` links to this repository and `main`. GitHub's existing success status links to deployment `DFhvBpZBKBPiYK4FS2svXWqvbzWf`; this connection cannot inspect its settings.
2. Inspect environment variable names and targets without displaying their values. Reuse the project's existing Supabase URL and matching anon/service-role keys. The active database is not among the five projects exposed by the current Supabase connection. Do not substitute one of those inactive projects.
3. Configure the required and optional keys listed in `.env.example`. Runtime AI routes also use `GEMINI_API_KEY` for blessings and songs. `EXTERNAL_AGENT_SECRET_KEY` remains optional and server-only. Stripe and Resend are optional; do not fabricate credentials. Changing environment values requires a fresh deployment.
4. Inspect actual database grants, RLS, triggers, and RPCs in the correct project. No database migrations were executed in this change. API ownership checks are not proof that the direct Data API is secure.
5. Domain `ryvynn.live` returns NXDOMAIN in the checked public resolver; Vercel reports no A/CNAME configuration. Registrar renewal/hold status could not be independently verified. Restore delegation at the registrar, preserve email records, then apply the exact DNS targets returned for the verified production project. Do not buy, transfer, or replace the domain based on NXDOMAIN alone.

## Release procedure

Build a preview with separate test services. Verify free-access pages, retired checkout, no-token/invalid-token/cross-user denial, journal encryption round-trip, sign-in/sign-out, crisis behavior, optional donation isolation, and invalid Stripe signatures. Verify genuine AI provider responses without entering personal content. Confirm no secret key is in client bundles.

Stage a production-environment build without domain assignment, record its commit and rollback deployment, smoke-test it, then promote that same build. Merge/release only after the actual production project and database have been verified. Do not merge either repository's unrelated Dependabot or Guardian changes blindly.

## Limits

This release does not implement undeveloped features, verify external provider retention policies, guarantee unlimited infrastructure, cancel external subscriptions, repair registrar billing, or prove the production database's RLS. The release must remain pending while those required production checks are inaccessible.

## Recovery follow-up — October 25, 2026

- Vercel team access now works. Verified `ryvnn-prod` project `prj_t0rngQDZWhLRn8jXUlY6xCzeAljh` in team `team_2LSzPFJill2AgYbcStgZG1wD`; existing production still uses `cd29c68`, while the free-access branch preview at `9612e84` built READY. Preview health reports free access and no billing requirement; pricing and public Wall GET return 200.
- Required Supabase and AI environment variable names exist in both production and preview. Secret values were not displayed or changed. Presence is not proof of correctness or credential rotation.
- The browser bundle identifies production database project `iofkxyljwemnnbwzcrke`. Supabase project inspection and security-advisor requests both return permission denied. The five visible projects are inactive and are not substitutes. Direct database grants/RLS and authenticated account journeys remain unverified; production release stays blocked on that access.
- Vercel domain configuration reports `misconfigured: true`, with no A/CNAME answers; public DNS returns NXDOMAIN. Registrar renewal/hold details remain unknown. No registrar plugin was found. Do not change unrelated DNS records or infer an expiration date.
- Follow-up patch verifies identity before Wall attribution/rewards, validates text input, and keeps account-free anonymous posts available. It prevents blocked/failed posting responses being shown as successful, keeps homepage drafts in memory instead of autosaving sensitive text, and removes simulated online-user counts.
- Four security/encryption/checkout tests, typecheck, and the optimized build pass on Node 24 with synthetic public configuration. Lint has 0 errors and 22 pre-existing warnings. Production dependency audit reports 0 known vulnerabilities. No live account, private user record, database schema, or billing subscription was changed.

## Checks completed in this checkout

- Node 24.22.1; Next.js 15.5.28 production build passed with synthetic public configuration and no Stripe, Resend, Groq, or database service-role secret.
- Typecheck passed. ESLint passed with 0 errors and 22 warnings (existing image, hook, and unused-disable warnings).
- Three tests passed: authentication/ownership rejection and acceptance; journal encryption reload/wrong password/tamper protection; retired checkout.
- Eleven HTTP checks against the built server passed: free pricing/promo/referral pages, health, retired checkout, private API denial, and both webhook URLs rejecting unsigned requests.
- Full dependency audit and production-only audit both reported 0 known vulnerabilities on October 25, 2026. This is an advisory snapshot, not a security guarantee.
- Browser visual QA and real account/database/provider integration were not completed; required production credentials and team scope are inaccessible.
