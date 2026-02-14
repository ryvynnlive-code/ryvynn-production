# 🔥 RYVYNN v7.1.1 PRODUCTION

**Complete, production-ready mental health crisis intervention platform.**

## ✅ WHAT THIS IS

- ✅ Anonymous confession → AI miracle transformation
- ✅ Real-time crisis detection (suicide, self-harm keywords)
- ✅ Automatic 988 Lifeline integration
- ✅ Public miracle feed
- ✅ Zero confession storage (privacy-first)
- ✅ Stripe-ready monetization
- ✅ PostgreSQL + Prisma
- ✅ Full TypeScript

## 🚀 DEPLOY NOW (10 MINUTES)

### 1. Install
```bash
npm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env.local`:

```bash
DATABASE_URL="postgresql://..."
ANTHROPIC_API_KEY="sk-ant-..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_APP_URL="https://ryvynn.live"
```

### 3. Database
```bash
npx prisma db push
npx prisma generate
```

### 4. Build
```bash
npm run build
```

### 5. Deploy
```bash
vercel --prod
```

### 6. Configure Domain

In Vercel:
- Add domain: `ryvynn.live`
- DNS: A record → 76.76.21.21

### 7. Stripe Webhook

Stripe Dashboard → Webhooks:
- Endpoint: `https://ryvynn.live/api/stripe/webhook`
- Events: subscription.created, subscription.updated, invoice.payment_succeeded

## 📋 WHAT'S INCLUDED

**Pages:**
- `/` - Landing
- `/confess` - Confession form
- `/feed` - Miracle feed

**APIs:**
- `/api/confession` - Process + transform
- `/api/miracle/feed` - Public miracles
- `/api/health` - Health check
- `/api/stripe/webhook` - Payments

**Components:**
- CrisisBanner - 988 hotline
- Dark theme (cyan/purple)

**Database:**
- Users (anonymous-first)
- Confessions (metadata only)
- Miracles (public)
- CrisisEvents (severity logs)

## 🔒 PRIVACY

- Confessions NEVER stored
- Only miracles saved
- Anonymous by default
- No tracking

## 💰 PRICING (Tesla Grid)

- FREE: $0
- SPARK: $3.69/mo
- BLAZE: $12.12/mo
- INFERNO: $36.90/mo
- SUPERNOVA: $369/mo
- BIGBANG: $936/mo

## 🆘 CRISIS SAFETY

**Detects:**
- Suicide ideation
- Self-harm
- Violence

**Triggers:**
- 988 Lifeline display
- Crisis Text Line (741741)
- Online chat links

## 📞 CONTACT

Email: founder.soulos@gmail.com
Company: NEXXT GEN INNOVATIONS LLC
Founder: Shawn Michael Lutz

## 🎯 GRANT READY

Production URL: https://ryvynn.live

This is COMPLETE. Deploy and save lives.
