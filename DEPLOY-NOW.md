# 🔥 DEPLOY RYVYNN NOW - QUICK START

## ⚡ FASTEST METHOD (5 MINUTES)

### Option 1: Push to GitHub (RECOMMENDED)

```bash
cd ryvynn-production

# If git authentication is set up:
git push -u origin main --force

# Vercel will auto-deploy (if GitHub integration enabled)
# Check: https://vercel.com/ryvynn/ryvynn-final
```

---

### Option 2: Vercel CLI

```bash
cd ryvynn-production

# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project: YES
# - Select team: ryvynn
# - Project: ryvynn-final (or create new)
```

---

### Option 3: Vercel Dashboard

1. **Upload Code**
   - Go to https://github.com/aonixxlive-code/ryvynn-app
   - Upload all files from `ryvynn-production/` folder
   - Commit with message: "RYVYNN v7.1.1 PRODUCTION"

2. **Trigger Deploy**
   - Go to https://vercel.com/ryvynn/ryvynn-final
   - Click "Deployments" → "Redeploy"
   - Or will auto-deploy if GitHub integration active

---

## 🔑 ENVIRONMENT VARIABLES

**Set these in Vercel Dashboard → Project Settings → Environment Variables:**

```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/ryvynn
ANTHROPIC_API_KEY=sk-ant-api03-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://ryvynn.live
```

---

## 📋 POST-DEPLOYMENT CHECKLIST

After deployment succeeds:

### 1. Database
```bash
# From Vercel dashboard, go to your deployment
# Click on "..." menu → "View Deployment"
# In Functions section, find any function
# Run in console:
npx prisma db push
```

### 2. Domain
- Vercel Dashboard → Project Settings → Domains
- Add: `ryvynn.live`
- DNS at registrar:
  - A record: `@` → `76.76.21.21`
  - CNAME: `www` → `cname.vercel-dns.com`

### 3. Stripe Webhook
- Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://ryvynn.live/api/stripe/webhook`
- Select events: `subscription.*`, `invoice.payment_*`
- Copy webhook secret → Add to Vercel env vars

### 4. Test
```bash
# Health check
curl https://ryvynn.live/api/health

# Should return:
# {"status":"ok","version":"7.1.1","service":"RYVYNN"}
```

---

## ✅ SUCCESS INDICATORS

After deployment, verify:

- [ ] https://ryvynn.live loads (landing page)
- [ ] https://ryvynn.live/confess shows form
- [ ] https://ryvynn.live/feed shows empty feed
- [ ] https://ryvynn.live/api/health returns 200
- [ ] Submit test confession → miracle appears
- [ ] Submit "I want to die" → crisis banner shows
- [ ] 988 button visible and clickable

---

## 🆘 TROUBLESHOOTING

**Build fails:**
- Check all env vars are set
- Ensure DATABASE_URL is valid PostgreSQL connection
- Check Vercel build logs

**"Cannot find module '@prisma/client'":**
```bash
# In Vercel dashboard, add build command:
npm install && npx prisma generate && npm run build
```

**Confession → Miracle not working:**
- Verify ANTHROPIC_API_KEY in env vars
- Check function logs in Vercel

**Crisis detection not triggering:**
- Test with exact phrase: "I want to die"
- Check browser console for errors

---

## 📞 CURRENT STATUS

**What Exists:**
- GitHub repo: https://github.com/aonixxlive-code/ryvynn-app
- Vercel project: ryvynn-final (team: ryvynn)
- Production URL: ryvynn-final-jjq287pi3-ryvynn.vercel.app

**What's Missing:**
- Environment variables (need to add)
- Database schema (need to run prisma db push)
- Domain connection to ryvynn.live

**Next Action:**
1. Push this code to GitHub repo (replaces old code)
2. Vercel auto-redeploys
3. Add env vars
4. Run prisma db push
5. Connect domain

---

## 🔥 ONE COMMAND DEPLOY

If you have everything set up:

```bash
cd ryvynn-production && \
git push origin main --force && \
echo "✅ Pushed to GitHub - Check Vercel for deployment status"
```

Then:
1. Add env vars in Vercel
2. Redeploy
3. Run prisma db push
4. Done

---

**TIME TO LIVE SITE: 15 MINUTES**

**NO MORE WAITING. DEPLOY NOW.**
