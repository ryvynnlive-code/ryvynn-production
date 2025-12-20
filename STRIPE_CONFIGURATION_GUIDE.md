# RYVYNN Stripe Integration Audit & Configuration Guide

**Mission-Critical Payment Stability for Revenue Generation**

---

## Executive Summary

This guide audits RYVYNN's Stripe integration and provides step-by-step configuration for stable, production-ready payment processing.

**Current Status:** Stripe integration code exists, needs environment configuration
**Payment Tiers:** 6 Tesla 3-6-9 pricing tiers (ZERO → GUARDIAN)
**Webhook Endpoint:** `/api/stripe/webhook`
**Critical Issue:** Missing Stripe environment variables prevent payment processing

---

## Section 1: Stripe Integration Audit

### ✅ Code Implementation Status

**Strengths:**
- ✅ Webhook handler properly implemented (`server/_core/stripe-webhook.ts`)
- ✅ Signature verification enabled (prevents fraud)
- ✅ Idempotent event handling (prevents duplicate processing)
- ✅ Subscription lifecycle covered (create, update, cancel, payment_failed)
- ✅ Database integration ready (`updateUserSubscription` function)
- ✅ Pricing configuration centralized (`client/src/lib/pricing.ts`)
- ✅ Environment variable-based price IDs (no hard-coded secrets)

**Gaps:**
- ❌ Missing `STRIPE_SECRET_KEY` environment variable
- ❌ Missing `STRIPE_WEBHOOK_SECRET` environment variable
- ❌ Missing `VITE_STRIPE_PRICE_*` environment variables for each tier
- ❌ No Stripe checkout UI implementation (needs frontend integration)
- ❌ No subscription management UI (cancel, upgrade, downgrade)

### Current Webhook Events Handled

1. `checkout.session.completed` - User completes payment
2. `customer.subscription.updated` - Subscription renewed or changed
3. `customer.subscription.deleted` - User cancels subscription
4. `invoice.payment_failed` - Payment fails (card declined, etc.)

### Database Schema Review

```sql
-- users table includes Stripe fields
stripeCustomerId VARCHAR(255)        -- Stripe customer ID (cus_xxx)
stripeSubscriptionId VARCHAR(255)    -- Stripe subscription ID (sub_xxx)
subscriptionTier ENUM                -- 'zero', 'three', 'six', 'nine', 'twelve', 'guardian'
subscriptionStatus ENUM              -- 'active', 'canceled', 'past_due', 'trialing'
subscriptionEndsAt TIMESTAMP         -- When subscription expires
```

**Status:** ✅ Schema is correct and ready for production

---

## Section 2: Stripe Account Setup

### Step 1: Create Stripe Account (If Not Done)

1. Go to https://stripe.com
2. Click "Sign up"
3. Complete business verification
4. Enable payment methods (cards, Apple Pay, Google Pay)

### Step 2: Get API Keys

1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Go to **Developers** → **API keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

**⚠️ CRITICAL:** Keep secret key private. Never commit to Git.

### Step 3: Create Products and Prices

Navigate to **Products** → **Add Product** and create 6 products:

#### Product 1: RYVYNN ZERO (Free)
- Name: `RYVYNN ZERO`
- Description: `Free forever. Basic emotional support.`
- Price: $0.00 / forever
- **No Stripe price needed** (free tier, no payment)

#### Product 2: RYVYNN THREE (Intro)
- Name: `RYVYNN THREE`
- Description: `$3.69 first month intro. Full access to Dual Flame AI.`
- Price: $3.69 / month (one-time or recurring)
- Copy **Price ID** (starts with `price_`)

#### Product 3: RYVYNN SIX (Standard)
- Name: `RYVYNN SIX`
- Description: `$12.12/month. Unlimited confessions, journal, rituals.`
- Price: $12.12 / month (recurring)
- Copy **Price ID**

#### Product 4: RYVYNN NINE (Family)
- Name: `RYVYNN NINE`
- Description: `$36.90/month. Family plan for 5 users.`
- Price: $36.90 / month (recurring)
- Copy **Price ID**

#### Product 5: RYVYNN TWELVE (Annual)
- Name: `RYVYNN TWELVE`
- Description: `$369/year. Best value, 2 months free.`
- Price: $369.00 / year (recurring)
- Copy **Price ID**

#### Product 6: RYVYNN GUARDIAN (Enterprise)
- Name: `RYVYNN GUARDIAN`
- Description: `$936 lifetime license. One-time payment, lifetime access.`
- Price: $936.00 (one-time payment)
- Copy **Price ID**

### Step 4: Configure Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://ryvynn.live/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_`)

---

## Section 3: Environment Variables Configuration

### Required Environment Variables

Add these to **Manus Dashboard → Settings → Secrets**:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (from Step 3 above)
VITE_STRIPE_PRICE_THREE=price_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_SIX=price_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_NINE=price_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_TWELVE=price_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_GUARDIAN=price_xxxxxxxxxxxxxxxxxxxxx
```

### How to Add in Manus

1. Open Manus Dashboard
2. Go to your RYVYNN project
3. Click **Settings** → **Secrets**
4. Click **Add Secret**
5. For each variable:
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_...` (paste your key)
   - Click **Save**
6. Repeat for all 7 variables above

### Verification

After adding secrets, restart your dev server:
```bash
# Server will log:
[Stripe Webhook] Stripe configured successfully
```

---

## Section 4: Frontend Checkout Integration

### Current Gap

RYVYNN has pricing page but no checkout flow. Users can't actually pay yet.

### Implementation Required

Create Stripe Checkout session in backend:

**File:** `server/routers.ts`

```typescript
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

// Add to appRouter
payment: router({
  createCheckoutSession: protectedProcedure
    .input(z.object({
      priceId: z.string(),
      tier: z.enum(['three', 'six', 'nine', 'twelve', 'guardian']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe not configured',
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: input.tier === 'guardian' ? 'payment' : 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: input.priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.VITE_APP_URL || 'https://ryvynn.live'}/dashboard?success=true`,
        cancel_url: `${process.env.VITE_APP_URL || 'https://ryvynn.live'}/pricing?canceled=true`,
        customer_email: ctx.user.email || undefined,
        metadata: {
          userId: ctx.user.id.toString(),
          tier: input.tier,
        },
      });

      return { url: session.url };
    }),

  createPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!stripe || !ctx.user.stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active subscription',
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${process.env.VITE_APP_URL || 'https://ryvynn.live'}/dashboard`,
      });

      return { url: session.url };
    }),
}),
```

### Frontend Button Implementation

**File:** `client/src/pages/Pricing.tsx`

```typescript
import { trpc } from '@/lib/trpc';

function PricingTierCard({ tier }: { tier: PricingTier }) {
  const createCheckout = trpc.payment.createCheckoutSession.useMutation();

  const handleUpgrade = async () => {
    if (!tier.stripePriceId) {
      // Free tier or contact-us tier
      return;
    }

    const { url } = await createCheckout.mutateAsync({
      priceId: tier.stripePriceId,
      tier: tier.id as any,
    });

    if (url) {
      window.location.href = url;
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={createCheckout.isLoading}>
      {createCheckout.isLoading ? 'Loading...' : 'Upgrade'}
    </Button>
  );
}
```

---

## Section 5: Webhook Testing

### Test Webhook Locally (Development)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local dev server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger invoice.payment_failed
   ```

### Test Webhook in Production

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select event type (e.g., `checkout.session.completed`)
5. Click **Send test webhook**
6. Check Manus logs for:
   ```
   [Stripe Webhook] Event received: checkout.session.completed
   [Stripe Webhook] Checkout completed for user 1, tier: six
   ```

---

## Section 6: Security Best Practices

### ✅ Already Implemented

1. **Signature Verification** - Prevents fake webhook requests
2. **Environment Variables** - No hard-coded secrets
3. **Idempotency** - Prevents duplicate processing
4. **Error Handling** - Graceful failures, no data loss

### Additional Recommendations

1. **Enable Stripe Radar** (fraud detection)
   - Go to Stripe Dashboard → **Radar**
   - Enable automatic fraud detection
   - Set risk threshold (default: 65)

2. **Require 3D Secure** (Strong Customer Authentication)
   - Go to **Settings** → **Payment methods**
   - Enable "Use 3D Secure when required"

3. **Set Up Billing Alerts**
   - Go to **Settings** → **Billing**
   - Add email alerts for:
     - Failed payments
     - High-risk transactions
     - Subscription cancellations

4. **Enable Webhook Retry**
   - Stripe automatically retries failed webhooks
   - Check **Developers** → **Webhooks** → **Settings**
   - Ensure "Retry failed webhooks" is enabled

---

## Section 7: Revenue Monitoring

### Key Metrics to Track

1. **Monthly Recurring Revenue (MRR)**
   - Dashboard → **Home** → **MRR**
   - Target: $1,000 MRR in first 3 months

2. **Churn Rate**
   - Dashboard → **Customers** → **Churn**
   - Target: <5% monthly churn

3. **Failed Payments**
   - Dashboard → **Payments** → **Failed**
   - Follow up with customers immediately

4. **Average Revenue Per User (ARPU)**
   - Total MRR / Active Subscribers
   - Target: $15-20 ARPU

### Automated Reporting

Set up daily email reports:
1. Go to **Settings** → **Notifications**
2. Enable "Daily summary"
3. Add your email
4. Select metrics to include

---

## Section 8: Subscription Management

### Customer Self-Service Portal

Stripe provides a hosted portal for customers to:
- Update payment methods
- View invoices
- Cancel subscriptions
- Upgrade/downgrade plans

**Implementation:** Already coded in Section 4 (`createPortalSession`)

**Usage:**
1. User clicks "Manage Subscription" in Dashboard
2. Frontend calls `trpc.payment.createPortalSession.mutate()`
3. User is redirected to Stripe portal
4. Changes sync back via webhooks

### Handling Cancellations

When user cancels:
1. Webhook `customer.subscription.deleted` fires
2. `subscriptionStatus` set to `canceled`
3. `subscriptionEndsAt` set to end of billing period
4. User retains access until `subscriptionEndsAt`
5. After expiry, downgrade to FREE tier

---

## Section 9: Common Issues & Solutions

### Issue 1: "Stripe not configured" Error

**Cause:** Missing `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`

**Solution:**
1. Add environment variables in Manus Dashboard → Secrets
2. Restart dev server
3. Verify logs show: `[Stripe Webhook] Stripe configured successfully`

### Issue 2: Webhook Signature Verification Failed

**Cause:** Incorrect `STRIPE_WEBHOOK_SECRET`

**Solution:**
1. Go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Click **Reveal** next to "Signing secret"
4. Copy the correct secret (starts with `whsec_`)
5. Update in Manus Dashboard → Secrets
6. Restart server

### Issue 3: Checkout Session Not Creating

**Cause:** Missing price IDs or invalid tier

**Solution:**
1. Verify all `VITE_STRIPE_PRICE_*` variables are set
2. Check price IDs are correct (copy from Stripe Dashboard → Products)
3. Ensure tier names match exactly: `three`, `six`, `nine`, `twelve`, `guardian`

### Issue 4: Payment Succeeds But User Not Upgraded

**Cause:** Webhook not reaching server or metadata missing

**Solution:**
1. Check webhook endpoint is reachable: `curl https://ryvynn.live/api/stripe/webhook`
2. Verify webhook events are being sent (Stripe Dashboard → Webhooks → Logs)
3. Check server logs for webhook processing errors
4. Ensure `userId` and `tier` are in checkout session metadata

---

## Section 10: Testing Checklist

### Before Going Live

- [ ] All environment variables added to Manus Secrets
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook signature verification working
- [ ] Test checkout flow (use Stripe test cards)
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Test failed payment handling
- [ ] Verify user is upgraded after payment
- [ ] Verify user is downgraded after cancellation
- [ ] Test customer portal access
- [ ] Enable Stripe Radar (fraud detection)
- [ ] Set up billing alerts
- [ ] Add daily revenue reports

### Stripe Test Cards

Use these for testing (test mode only):

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 0002 | Declined (generic) |
| 4000 0025 0000 3155 | Requires 3D Secure |

**Expiry:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

---

## Section 11: Go-Live Checklist

### Switch from Test Mode to Live Mode

1. Go to Stripe Dashboard
2. Toggle from **Test mode** to **Live mode** (top-right)
3. Get new API keys:
   - **Live Publishable Key** (`pk_live_...`)
   - **Live Secret Key** (`sk_live_...`)
4. Update environment variables in Manus:
   - Replace `STRIPE_SECRET_KEY` with live key
5. Create new webhook endpoint for live mode:
   - URL: `https://ryvynn.live/api/stripe/webhook`
   - Get new **Signing Secret** (`whsec_...`)
   - Update `STRIPE_WEBHOOK_SECRET` in Manus
6. Verify products and prices exist in live mode
7. Update `VITE_STRIPE_PRICE_*` variables with live price IDs
8. Test with real card (small amount, then refund)
9. Monitor first 10 transactions closely

---

## Section 12: Action Items (Immediate)

### Within 1 Hour
1. ✅ Create Stripe account (if not done)
2. ✅ Get API keys (test mode)
3. ✅ Create 6 products and prices
4. ✅ Add environment variables to Manus
5. ✅ Configure webhook endpoint

### Within 24 Hours
1. ✅ Implement checkout flow (Section 4 code)
2. ✅ Test with Stripe test cards
3. ✅ Verify webhook events fire correctly
4. ✅ Test subscription lifecycle (create, cancel, fail)

### Within 7 Days
1. ✅ Enable Stripe Radar
2. ✅ Set up billing alerts
3. ✅ Add daily revenue reports
4. ✅ Switch to live mode
5. ✅ Process first real transaction

---

## Conclusion

**Stripe integration is code-complete but needs configuration.**

**Critical Path:**
1. Add 7 environment variables to Manus Secrets
2. Implement checkout flow (copy code from Section 4)
3. Test with Stripe test cards
4. Go live

**Estimated Time:** 2-4 hours for full implementation

**Next:** Proceed to Section 3 (TiDB Security Audit)

---

**Last Updated:** 2025-01-29
**RYVYNN Version:** v7.1.1-M
**Status:** Ready for Configuration
