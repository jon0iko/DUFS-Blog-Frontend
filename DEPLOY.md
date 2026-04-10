# Deployment Guide - DUFS Blog (Zero Rebuild + Perfect SEO)

## 🎯 Architecture Overview

### The Two-Tier System

Your blog uses a clever two-tier serving strategy:

```
┌─────────────────────────────────────────────────────┐
│                  User Visits                         │
│              /articles/my-article                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│            Apache .htaccess Checks:                 │
│              Is this a bot or human?                │
└────────┬──────────────────────┬────────────────────┘
         │                      │
    🤖 BOT                 👤 HUMAN
         │                      │
         ▼                      ▼
┌─────────────────┐   ┌──────────────────────┐
│  Static SEO     │   │   Client-Side App    │
│  Page Served    │   │   (React/Next.js)    │
│                 │   │                      │
│  ✅ Full HTML   │   │  ✅ Fetches from     │
│  ✅ Meta tags   │   │     Strapi API       │
│  ✅ JSON-LD     │   │  ✅ Always fresh     │
│  ✅ Indexable   │   │  ✅ No wait time     │
└─────────────────┘   └──────────────────────┘
```

### Key Principles

1. **Users (Humans):**
   - ALWAYS fetch fresh content from Strapi API
   - Click article → instant data (no rebuild wait)
   - See published articles immediately
   - No static content served

2. **Bots (Search Engines):**
   - Get pre-rendered static HTML pages
   - Full meta tags for indexing
   - Generated via CI/CD when content changes
   - Perfect SEO without compromising user experience

---

## 📋 Prerequisites

Before starting, ensure you have:
- [x] cPanel hosting account with FTP access
- [x] GitHub account with repository access
- [x] Strapi backend running and accessible
- [x] Your domain name configured

---

## Part 1: GitHub Repository Setup

### Step 1.1: Add GitHub Secrets

Navigate to your repository: `https://github.com/jon0iko/DUFS-Blog-Frontend/settings/secrets/actions`

Add these 6 secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `STRAPI_URL` | Strapi backend URL | `https://cms.yourdomain.com` or `http://yourdomain.com:1337` |
| `STRAPI_TOKEN` | Strapi API token (read-only) | `abcd1234efgh5678ijkl...` |
| `SITE_URL` | Frontend production URL | `https://yourdomain.com` |
| `FTP_HOST` | cPanel FTP hostname | `ftp.yourdomain.com` |
| `FTP_USER` | cPanel FTP username | `username@yourdomain.com` |
| `FTP_PASS` | cPanel FTP password | Your FTP password |

#### How to Get Strapi API Token:

1. Login to **Strapi Admin Panel**
2. Go to **Settings** → **API Tokens**
3. Click **Create new API Token**
4. Configure:
   - Name: `GitHub Actions (Read-Only)`
   - Token type: **Read-only**
   - Token duration: **Unlimited**
5. Click **Save**
6. **Copy the token** (shown only once!)

---

## Part 2: cPanel Webhook Relay Setup

This PHP script receives webhooks from Strapi and triggers GitHub Actions.

### Step 2.1: Create Webhook Directory

1. Login to **cPanel**
2. Open **File Manager**
3. Navigate to `public_html/`
4. Create new folder: **`webhooks`**

### Step 2.2: Create PHP Relay Script

Create file: `public_html/webhooks/gh-dispatch.php`

```php
<?php
/**
 * Strapi → GitHub Actions Webhook Relay
 * 
 * Flow:
 * Strapi publishes article → Webhook → This script → GitHub Actions → Build + Deploy
 */

// ========== CONFIGURATION ==========
$WEBHOOK_SECRET = 'YOUR_RANDOM_SECRET_HERE_abc123xyz'; // Change this!
$GITHUB_REPO = 'jon0iko/DUFS-Blog-Frontend';
$GITHUB_TOKEN = 'ghp_YOUR_GITHUB_PAT_HERE'; // Create from GitHub settings
// ====================================

// Verify webhook secret
if (!isset($_SERVER['HTTP_X_STRAPI_SECRET']) || $_SERVER['HTTP_X_STRAPI_SECRET'] !== $WEBHOOK_SECRET) {
  http_response_code(403);
  die('Forbidden: Invalid secret');
}

// Optional: Log webhook calls
$logFile = __DIR__ . '/webhook.log';
$logEntry = sprintf("[%s] Webhook received from IP: %s\n", 
  date('Y-m-d H:i:s'), 
  $_SERVER['REMOTE_ADDR'] ?? 'unknown'
);
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Trigger GitHub Actions via repository_dispatch
$url = "https://api.github.com/repos/{$GITHUB_REPO}/dispatches";

$payload = json_encode([
  'event_type' => 'strapi_publish',
  'client_payload' => [
    'source' => 'strapi',
    'timestamp' => time(),
    'trigger_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
  ]
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: token {$GITHUB_TOKEN}",
    "User-Agent: cpanel-webhook-relay",
    "Accept: application/vnd.github+json",
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => $payload
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log result
if ($httpCode >= 200 && $httpCode < 300) {
  $logEntry = sprintf("[%s] ✅ GitHub dispatch successful (HTTP %d)\n", date('Y-m-d H:i:s'), $httpCode);
  file_put_contents($logFile, $logEntry, FILE_APPEND);
  http_response_code(204);
  echo 'OK';
} else {
  $logEntry = sprintf("[%s] ❌ GitHub dispatch failed (HTTP %d): %s\n", date('Y-m-d H:i:s'), $httpCode, $error ?: $response);
  file_put_contents($logFile, $logEntry, FILE_APPEND);
  http_response_code($httpCode ?: 500);
  echo "Error: " . ($error ?: $response);
}
?>
```

### Step 2.3: Configure the Script

Update these 3 variables in the PHP file:

1. **`$WEBHOOK_SECRET`**: Create a random secret (e.g., `dufs_blog_secret_xyz123_2025`)
   - Save this - you'll need it for Strapi webhook config

2. **`$GITHUB_REPO`**: Your repository (`jon0iko/DUFS-Blog-Frontend`)

3. **`$GITHUB_TOKEN`**: Create a GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - Note: `cPanel webhook relay`
   - Expiration: **No expiration** (or 1 year)
   - Scopes: Check **`repo`** only
   - Click **Generate token**
   - Copy the token (starts with `ghp_...`)

### Step 2.4: Set File Permissions

1. Right-click `gh-dispatch.php` in File Manager
2. **Change Permissions** → Set to `644`
3. Save

### Step 2.5: Test the Webhook

```bash
# Test from terminal or use online curl tool
curl -X POST https://yourdomain.com/webhooks/gh-dispatch.php \
  -H "X-STRAPI-SECRET: YOUR_RANDOM_SECRET_HERE_abc123xyz"
```

Check:
- GitHub Actions: https://github.com/jon0iko/DUFS-Blog-Frontend/actions
- Log file: `public_html/webhooks/webhook.log` (should show success)

---

## Part 3: Strapi Webhook Configuration

### Step 3.1: Add Webhook in Strapi

1. Login to **Strapi Admin Panel**
2. **Settings** → **Webhooks**
3. Click **Create new webhook**

### Step 3.2: Configure Webhook

| Field | Value |
|-------|-------|
| **Name** | `GitHub Actions - SEO Rebuild` |
| **URL** | `https://yourdomain.com/webhooks/gh-dispatch.php` |
| **Headers** | Click **Add header** |
| → Header name | `X-STRAPI-SECRET` |
| → Header value | Same secret from PHP file |
| **Events** | Select below ↓ |

### Step 3.3: Select Events

Check these events to trigger SEO rebuilds:

**Articles (required):**
- [x] `entry.create`
- [x] `entry.update`
- [x] `entry.publish`
- [x] `entry.unpublish`
- [x] `entry.delete`

**Categories (optional but recommended):**
- [x] `entry.update`

**Tags (optional):**
- [x] `entry.update`

### Step 3.4: Enable and Test

1. Toggle **Enabled** → ON
2. Click **Save**
3. Click **Trigger** button
4. Verify:
   - GitHub Actions started: https://github.com/jon0iko/DUFS-Blog-Frontend/actions
   - Check `public_html/webhooks/webhook.log` on cPanel

---

## Part 4: Initial Manual Deployment

### Step 4.1: Build Locally

```bash
# In your project directory
npm run build
```

This will:
- Build Next.js static site
- Generate SEO pages for all published articles
- Create sitemap.xml and robots.txt
- Output to `out/` directory

**Note:** If you see "Skipping SEO pages (no Strapi credentials)" - that's normal for local builds. SEO pages are generated in CI/CD.

### Step 4.2: Upload to cPanel

**Option A: cPanel File Manager**
1. Open cPanel → File Manager
2. Navigate to `public_html/`
3. **Delete old files** (keep `webhooks/` folder!)
4. Upload all files from your local `out/` folder
5. Wait for upload to complete

**Option B: FTP (FileZilla/WinSCP)**
1. Connect via FTP to your cPanel
2. Navigate to `public_html/`
3. Upload `out/` contents
4. Overwrite existing files

### Step 4.3: Verify .htaccess

Ensure `public_html/.htaccess` contains the bot detection rules:

```apache
RewriteEngine On

# Detect search engine bots
SetEnvIfNoCase User-Agent "googlebot|bingbot|slurp|duckduckbot|baiduspider" IS_BOT

# Bots get static SEO pages
RewriteCond %{ENV:IS_BOT} =1
RewriteCond %{REQUEST_URI} ^/articles/([^/]+)/?$ [NC]
RewriteCond %{DOCUMENT_ROOT}/articles/%1/index.html -f
RewriteRule ^articles/([^/]+)/?$ /articles/$1/index.html [L]

# Humans get client-side app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^articles/([^/]+)/?$ /read-article?slug=$1 [L,QSA]
```

---

## Part 5: Test the Complete System

### Step 5.1: Test User Experience (Humans)

1. Open browser (non-bot user agent)
2. Visit: `https://yourdomain.com`
3. Click an article card
4. Should see: URL changes to `/articles/slug`
5. Content loads from Strapi (check Network tab)
6. Edit article in Strapi
7. Refresh page - see changes instantly (no rebuild!)

### Step 5.2: Test SEO (Bots)

**Simulate Bot User Agent:**

```bash
# Test with curl (simulates bot)
curl -A "Googlebot" https://yourdomain.com/articles/your-article-slug

# Should return: Static HTML with meta tags
```

**Check Meta Tags:**
- View page source as bot
- Should see full `<meta property="og:...">` tags
- Should see JSON-LD structured data

### Step 5.3: Test Automated Rebuild

1. Login to Strapi
2. Create or edit an article
3. Click **Publish**
4. Wait 1-2 minutes
5. Check GitHub Actions: https://github.com/jon0iko/DUFS-Blog-Frontend/actions
   - Should see workflow running
6. Wait 3-5 minutes for build + deploy
7. Test bot access:
   ```bash
   curl -A "Googlebot" https://yourdomain.com/articles/new-article-slug
   ```
8. Should return updated static SEO page

### Step 5.4: Submit Sitemap

1. Go to: https://search.google.com/search-console
2. Add your property (domain)
3. **Sitemaps** → Submit: `https://yourdomain.com/sitemap.xml`
4. Google will crawl and index your articles

---

## Part 6: Understanding the Flow

### When User Clicks Article Card

```
1. User clicks article → /articles/my-article
2. Apache checks: Is user a bot?
   └─ NO (human) 
      └─ Rewrite to: /read-article?slug=my-article
         └─ Load React app (one static HTML shell)
            └─ JavaScript fetches from: http://localhost:1337/api/articles?filters[slug]=my-article
               └─ Render fresh content
```

**Result:** Instant article view, always fresh data, zero rebuild wait!

### When Bot Crawls Article

```
1. Bot visits → /articles/my-article
2. Apache checks: Is user a bot?
   └─ YES (Googlebot)
      └─ Serve: /articles/my-article/index.html (static)
         └─ Bot sees full HTML with meta tags
            └─ Google indexes properly
```

**Result:** Perfect SEO without slowing down users!

### When You Publish in Strapi

```
1. Click "Publish" in Strapi
   ↓
2. Strapi sends webhook → cPanel PHP
   ↓
3. PHP triggers GitHub Actions
   ↓
4. GitHub Actions:
   - Pull latest code
   - Build Next.js static site
   - Run generate-article-pages.mjs
   - Create SEO pages for ALL articles
   - Generate sitemap.xml
   - Deploy to cPanel via FTP
   ↓
5. New article accessible:
   - Users: Instant (client-side fetch)
   - Bots: After ~3-5 min (static page ready)
```

**Result:** Users see articles instantly, bots get updated SEO pages in a few minutes!

---

## Part 7: Troubleshooting

### Problem: Users see "Article Not Found"

**Possible Causes:**
- Strapi not running
- Article not published
- Wrong API URL in env vars

**Solution:**
1. Check Strapi is accessible: `curl http://localhost:1337/api/articles`
2. Verify article is published (not draft)
3. Check browser console for API errors
4. Verify `NEXT_PUBLIC_STRAPI_URL` in `.env.local`

### Problem: Bots Not Getting Static Pages

**Possible Causes:**
- .htaccess bot detection not working
- Static SEO pages not generated
- File permissions issue

**Solution:**
1. Test bot user agent: `curl -A "Googlebot" https://yourdomain.com/articles/test`
2. Check `/articles/test/index.html` exists
3. Verify .htaccess is uploaded and active
4. Check file permissions (should be 644)

### Problem: Webhook Not Triggering

**Possible Causes:**
- Wrong secret in Strapi or PHP
- GitHub PAT expired/invalid
- PHP errors

**Solution:**
1. Check Strapi webhook logs (Settings → Webhooks → View)
2. Check `public_html/webhooks/webhook.log`
3. Test PHP script manually: `curl -X POST ...`
4. Verify GitHub PAT has `repo` scope

### Problem: Build Fails in GitHub Actions

**Possible Causes:**
- Missing GitHub Secrets
- Strapi not accessible from GitHub
- Environment variable issues

**Solution:**
1. Check GitHub Actions logs for error details
2. Verify all 6 secrets are set correctly
3. Ensure Strapi URL is publicly accessible (not `localhost`)
4. Test build locally: `npm run build`

### Problem: FTP Deploy Fails

**Possible Causes:**
- Wrong FTP credentials
- FTP port blocked
- Server directory doesn't exist

**Solution:**
1. Test FTP with FileZilla
2. Verify credentials in GitHub Secrets
3. Try changing protocol: `ftps` → `ftp` in workflow
4. Check `server-dir: public_html/` exists

---

## Part 8: Monitoring & Maintenance

### Daily Monitoring

- Check GitHub Actions status: https://github.com/jon0iko/DUFS-Blog-Frontend/actions
- Review webhook log: `public_html/webhooks/webhook.log`

### Weekly Tasks

- [ ] Verify articles are indexing in Google Search Console
- [ ] Check for failed builds/deployments
- [ ] Review cPanel disk usage

### Monthly Tasks

- [ ] Update npm dependencies: `npm update`
- [ ] Review and clean old log files
- [ ] Check GitHub Actions usage quota
- [ ] Rotate GitHub PAT if needed

### When Adding New Features

If you modify article structure or add new content types:
1. Update `scripts/generate-article-pages.mjs`
2. Regenerate sitemap
3. Test both user and bot flows

---

## Part 9: Performance Optimization

### Caching Strategy

**Current Setup:**
- **Users:** No cache (always fresh from Strapi)
- **Bots:** Static HTML (updated on publish)

**Optional Improvements:**
1. Add CDN (Cloudflare) for static assets
2. Enable Strapi response caching (Redis)
3. Add service worker for offline support

### Build Optimization

**Current Build Time:** ~3-5 minutes

**To Speed Up:**
1. Limit SEO page generation to recent N articles
2. Use incremental static regeneration (ISR) for popular articles
3. Optimize image sizes in Strapi

---

## Part 10: Security Considerations

### Webhook Security

✅ **Implemented:**
- Secret verification via `X-STRAPI-SECRET` header
- Request logging with IP addresses

🔒 **Additional Hardening:**
1. Add IP whitelist for Strapi server
2. Rate limiting on webhook endpoint
3. Rotate secrets every 6 months

### GitHub Token Security

✅ **Best Practices:**
- Use read-only Strapi token
- Store tokens as GitHub Secrets (encrypted)
- PAT with minimal scope (`repo` only)

---

## Summary

### ✅ What You've Achieved

| Feature | Status |
|---------|--------|
| **Zero rebuilds for users** | ✅ Instant article access |
| **Perfect SEO** | ✅ Static pages for bots |
| **Always fresh content** | ✅ Client-side Strapi fetch |
| **Automated deployment** | ✅ Webhook → CI/CD → Live |
| **Shared hosting** | ✅ Works on basic cPanel |
| **Scalable** | ✅ Handles unlimited articles |

### 🎊 Final Checklist

Before going live:
- [ ] GitHub Secrets configured (6 total)
- [ ] PHP webhook relay created and tested
- [ ] GitHub PAT created with `repo` scope
- [ ] Strapi webhook configured with correct secret
- [ ] Initial manual deployment completed
- [ ] .htaccess bot detection working
- [ ] Tested user flow (client-side fetch)
- [ ] Tested bot flow (static SEO pages)
- [ ] Submitted sitemap to Google Search Console
- [ ] Verified automated rebuild works

---

**Status:** Ready for Production! 🚀

**User Experience:** Instant article loading, always fresh  
**SEO:** Perfect indexing via static pages  
**Maintenance:** Minimal - automated deployments  
**Scalability:** Handles unlimited articles

**Questions?** Check the troubleshooting section or review workflow logs.

---

**Last Updated:** November 6, 2025  
**Version:** 2.0 (Two-Tier Architecture)
