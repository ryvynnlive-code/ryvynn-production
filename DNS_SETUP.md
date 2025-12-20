# RYVYNN DNS Configuration Guide

This guide explains how to connect your custom domain `ryvynn.live` to your Manus-hosted RYVYNN application.

---

## Prerequisites

- You own the domain `ryvynn.live` (registered with a domain registrar like Namecheap, GoDaddy, Cloudflare, etc.)
- Your RYVYNN project is deployed on Manus
- You have access to your domain registrar's DNS management panel

---

## Step 1: Access Your Domain Registrar's DNS Settings

1. Log in to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
2. Navigate to DNS Management or DNS Settings for `ryvynn.live`
3. Look for options to add/edit DNS records

---

## Step 2: Remove Conflicting Records (If Any)

Before adding new records, remove any existing conflicting records:

- **Remove old A records** pointing to `ryvynn.live` (root domain)
- **Remove old CNAME records** for `www.ryvynn.live` or `ryvynn.live`
- **Keep MX records** (email) and **TXT records** (verification) if they exist

---

## Step 3: Add DNS Records for Manus Hosting

### Option A: Using Manus Custom Domain Feature (Recommended)

1. Go to your Manus Dashboard → Your Project → Settings → Domains
2. Click "Add Custom Domain"
3. Enter `ryvynn.live`
4. Manus will provide you with specific DNS records to add (usually CNAME or A records)
5. Follow Manus's instructions exactly
6. Wait for DNS propagation (5 minutes to 48 hours)

### Option B: Manual A Record Configuration

If Manus provides a specific IP address (like `76.76.21.21`), add these DNS records:

**A Record for root domain:**
```
Type: A
Host: @ (or leave blank for root domain)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**CNAME Record for www subdomain:**
```
Type: CNAME
Host: www
Value: ryvynn.live
TTL: 3600 (or Auto)
```

---

## Step 4: Verify Domain Connection

### In Manus Dashboard

1. Go to Manus Dashboard → Your Project → Settings → Domains
2. Check the status of `ryvynn.live`
3. It should show "Connected" or "Valid" (may take up to 48 hours)

### Using Command Line

Check DNS propagation:

```bash
# Check A record
dig ryvynn.live +short

# Check CNAME record
dig www.ryvynn.live +short

# Check DNS from multiple locations
https://dnschecker.org/#A/ryvynn.live
```

### Using Browser

1. Wait 5-15 minutes after adding DNS records
2. Visit `https://ryvynn.live` in your browser
3. You should see your RYVYNN homepage
4. Check for HTTPS (green padlock icon)

---

## Step 5: Verify HTTPS Certificate

Manus automatically provisions SSL/TLS certificates for custom domains.

1. Visit `https://ryvynn.live` (note the `https://`)
2. Click the padlock icon in your browser
3. Verify the certificate is valid and issued by Let's Encrypt or similar

---

## Step 6: Test Application Health

### Heartbeat Endpoint

Add a health check endpoint to verify your application is running:

```bash
curl https://ryvynn.live/api/heartbeat
# Expected response: {"status": "ok"}
```

### Full Application Test

1. Visit `https://ryvynn.live`
2. Test key flows:
   - Homepage loads
   - Confession submission works
   - Feed displays correctly
   - Login/signup works
   - All pages accessible

---

## Troubleshooting

### "Domain not found" or "DNS_PROBE_FINISHED_NXDOMAIN"

- **Cause:** DNS records not propagated yet
- **Solution:** Wait 5-60 minutes, then try again. Full propagation can take up to 48 hours.

### "Connection not secure" or "Certificate error"

- **Cause:** SSL certificate not provisioned yet
- **Solution:** Wait 5-15 minutes after DNS propagation. Manus auto-provisions certificates.

### "This site can't be reached"

- **Cause:** Incorrect A record or CNAME value
- **Solution:** Double-check DNS records match Manus's instructions exactly.

### Domain shows "Pending" in Manus Dashboard

- **Cause:** DNS records not detected yet
- **Solution:** Verify DNS records are correct using `dig` or dnschecker.org

---

## DNS Propagation Time

- **Minimum:** 5 minutes
- **Typical:** 15-60 minutes
- **Maximum:** 48 hours

Use https://dnschecker.org to check propagation status globally.

---

## Important Notes

1. **Do not change DNS records in code** - DNS must be configured in your domain registrar
2. **Keep MX records** - Don't delete email-related DNS records
3. **Use HTTPS only** - Manus automatically redirects HTTP to HTTPS
4. **Manus handles SSL** - No manual certificate installation needed

---

## Support

If you encounter issues:

1. Check Manus Dashboard → Domains for error messages
2. Verify DNS records using `dig` or dnschecker.org
3. Contact Manus support at https://help.manus.im
4. Contact your domain registrar's support for DNS-specific issues

---

## Quick Reference

| Record Type | Host | Value | TTL |
|-------------|------|-------|-----|
| A | @ | 76.76.21.21 (or Manus-provided IP) | 3600 |
| CNAME | www | ryvynn.live | 3600 |

**Note:** Replace `76.76.21.21` with the actual IP address provided by Manus in your Dashboard → Domains section.

---

## Verification Checklist

- [ ] DNS A record added for `ryvynn.live`
- [ ] DNS CNAME record added for `www.ryvynn.live`
- [ ] Old conflicting records removed
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] Manus Dashboard shows "Connected"
- [ ] `https://ryvynn.live` loads correctly
- [ ] HTTPS certificate valid (green padlock)
- [ ] `/api/heartbeat` returns 200 OK
- [ ] All application features working

---

**Last Updated:** 2025-01-29
**RYVYNN Version:** v7.1.1-M
