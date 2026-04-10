# DUFS Blog - Two-Tier Architecture

## 🎯 Core Concept

**Problem:** Users shouldn't wait for rebuilds, but SEO needs static pages for Google indexing.

**Solution:** Serve different content based on who's requesting:
- **👤 Human Users:** Dynamic client-side fetching from Strapi (always fresh, zero wait)
- **🤖 SEO Bots:** Pre-rendered static HTML pages (perfect indexing)

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser Requests                             │
│                    /articles/my-article                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                Apache .htaccess (URL Rewrite)                    │
│                                                                   │
│   IF User-Agent matches bot pattern (Googlebot, Bingbot, etc.)  │
│   THEN serve: /articles/my-article/index.html (static)          │
│   ELSE rewrite to: /read-article?slug=my-article (dynamic)      │
└─────┬───────────────────────────────────┬─────────────────────┘
      │                                   │
🤖 BOT PATH                          👤 HUMAN PATH
      │                                   │
      ▼                                   ▼
┌─────────────────┐             ┌──────────────────────────────┐
│  Static SEO     │             │   Universal Reader Page      │
│  HTML Page      │             │   (/read-article)            │
│                 │             │                              │
│  ✅ Full meta   │             │  ✅ One static HTML shell    │
│  ✅ JSON-LD     │             │  ✅ Client-side JS           │
│  ✅ OG tags     │             │  ✅ useSearchParams(slug)    │
│  ✅ Schema.org  │             │  ✅ Fetch from Strapi API    │
│  ✅ Indexable   │             │  ✅ Render fresh content     │
│                 │             │  ✅ Zero rebuild wait        │
│  📄 Generated   │             │                              │
│     in CI/CD    │             │  🔄 Always fresh data        │
└─────────────────┘             └──────────────────────────────┘
```

---

## 🗂️ File Structure

### Key Files

```
app/
├── read-article/
│   └── page.tsx ..................... Universal reader (ALL articles)
├── articles/ ........................ ❌ DELETED (no dynamic route!)
└── ... (other routes)

public/
└── .htaccess ........................ Bot detection + URL rewriting

scripts/
└── generate-article-pages.mjs ....... SEO page generator (CI/CD)

.github/workflows/
└── deploy.yml ....................... Automated deployment

out/ (after build)
├── read-article/
│   └── index.html ................... One universal reader page
├── articles/
│   ├── article-1/
│   │   └── index.html ............... Static SEO page (bots only)
│   ├── article-2/
│   │   └── index.html ............... Static SEO page (bots only)
│   └── ... (generated in CI/CD)
├── sitemap.xml ...................... All article URLs
└── robots.txt ....................... Points to sitemap
```

---

## 🚀 How It Works

### 1️⃣ User Clicks Article Card

```javascript
// ArticleCard component
<Link href={`/articles/${article.slug}`}>
  Read More
</Link>
```

**URL in browser:** `https://yourdomain.com/articles/my-article`

---

### 2️⃣ Apache Checks User-Agent

**`.htaccess` logic:**

```apache
# Detect bots
SetEnvIfNoCase User-Agent "googlebot|bingbot|slurp" IS_BOT

# Bot → static SEO page
RewriteCond %{ENV:IS_BOT} =1
RewriteCond %{REQUEST_URI} ^/articles/([^/]+)/?$ [NC]
RewriteCond %{DOCUMENT_ROOT}/articles/%1/index.html -f
RewriteRule ^articles/([^/]+)/?$ /articles/$1/index.html [L]

# Human → dynamic app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^articles/([^/]+)/?$ /read-article?slug=$1 [L,QSA]
```

---

### 3️⃣ For Human Users

**Rewrite happens:**
```
/articles/my-article → /read-article?slug=my-article
```

**`app/read-article/page.tsx` loads:**

```typescript
'use client'

function ReadArticleInner() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') // "my-article"
  
  // Fetch from Strapi API
  return <ArticleContentClient slug={slug} />
}
```

**API call:**
```
GET http://localhost:1337/api/articles?filters[slug]=my-article
```

**Result:** 
- ✅ Content loads instantly
- ✅ Always fresh from Strapi
- ✅ No rebuild needed
- ✅ URL stays `/articles/my-article` (pretty!)

---

### 4️⃣ For SEO Bots

**Static page served:**
```
/articles/my-article/index.html
```

**Contains:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Article Title</title>
  <meta name="description" content="Article excerpt...">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="My Article Title">
  <meta property="og:image" content="https://...">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "My Article Title",
    ...
  }
  </script>
</head>
<body>
  <!-- Static content snapshot for indexing -->
  <article>
    <h1>My Article Title</h1>
    <p>Article excerpt...</p>
  </article>
</body>
</html>
```

**Result:**
- ✅ Bot sees full meta tags
- ✅ Google indexes properly
- ✅ Rich snippets in search
- ✅ No JavaScript required

---

## 🔄 Content Publishing Flow

### When You Publish in Strapi

```
┌───────────────────────┐
│   1. Click Publish    │
│   in Strapi Admin     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   2. Strapi Webhook   │
│   Triggers            │
│   → POST to cPanel    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   3. PHP Relay        │
│   (cPanel webhook)    │
│   → GitHub API call   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   4. GitHub Actions   │
│   Workflow Starts     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   5. CI/CD Pipeline   │
│   • npm install       │
│   • npm run build     │
│   • Generate SEO      │
│   • FTP Deploy        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   6. Live on cPanel   │
│   Users: Instant ✅   │
│   Bots: 3-5 min ✅    │
└───────────────────────┘
```

**Timeline:**
- **0 seconds:** User publishes in Strapi
- **0 seconds:** Users can see article (client-side fetch)
- **2 minutes:** GitHub Actions starts build
- **5 minutes:** SEO pages deployed, bots can index

---

## ⚡ Performance Benefits

### For Users (Humans)

| Metric | Old Dynamic Route | New Two-Tier System |
|--------|-------------------|---------------------|
| **First visit** | Wait for rebuild | Instant (already deployed) |
| **New article** | Wait 5-10 min | Instant (0 seconds) |
| **Content update** | Wait for rebuild | Instant refresh |
| **Page load** | SSG pre-rendered | Client-side fetch (~200ms) |

### For SEO (Bots)

| Metric | Value |
|--------|-------|
| **Indexing** | Perfect ✅ |
| **Meta tags** | Full ✅ |
| **JSON-LD** | Yes ✅ |
| **Performance** | Static HTML (instant) |
| **Rich snippets** | Supported ✅ |

---

## 🔍 SEO Implementation Details

### Static SEO Page Generation

**Script:** `scripts/generate-article-pages.mjs`

**When it runs:**
- Automatically after every build (`postbuild` npm script)
- In GitHub Actions CI/CD pipeline
- Triggered by Strapi webhook

**What it does:**

```javascript
1. Fetch all published articles from Strapi
   ↓
2. For each article:
   • Create /articles/<slug>/index.html
   • Add full meta tags (title, description, OG, Twitter)
   • Add JSON-LD structured data
   • Add minimal content snapshot
   ↓
3. Generate sitemap.xml
   • List all article URLs
   • Add lastmod dates
   • Priority and changefreq
   ↓
4. Generate robots.txt
   • Point to sitemap
   • Allow all crawlers
```

**Example output:**

```
out/
├── articles/
│   ├── my-first-article/
│   │   └── index.html (2.5 KB, full SEO)
│   ├── another-article/
│   │   └── index.html (2.3 KB, full SEO)
│   └── ... (all published articles)
├── sitemap.xml (5 KB, all URLs)
└── robots.txt (100 bytes)
```

---

## 🛠️ Local Development

### Running Dev Server

```bash
npm run dev
```

**What happens:**
- ✅ Universal reader page works
- ✅ Client-side fetching from Strapi
- ✅ No SEO pages generated (not needed for dev)
- ✅ Test with: http://localhost:3000/articles/test-slug

### Building Locally

```bash
npm run build
```

**What happens:**
- ✅ Builds 14 static pages
- ✅ Creates `/read-article/index.html`
- ⚠️ Skips SEO page generation (no Strapi credentials)
- ✅ Output to `out/` directory

**Note:** SEO pages are only generated in CI/CD with full environment variables.

---

## 🔐 Security & Best Practices

### Bot Detection

**User-Agent patterns:**
```
googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot
```

**Why it's safe:**
- Search engines identify themselves
- Legitimate bots use known user agents
- Humans get better experience (dynamic)

### Webhook Security

**Implemented:**
- ✅ Secret token verification (`X-STRAPI-SECRET`)
- ✅ Request logging with IP addresses
- ✅ GitHub PAT with minimal scope

**PHP relay verification:**
```php
if ($_SERVER['HTTP_X_STRAPI_SECRET'] !== $WEBHOOK_SECRET) {
  http_response_code(403);
  die('Forbidden');
}
```

---

## 📊 Monitoring

### What to Track

1. **GitHub Actions:**
   - Build success rate
   - Build duration (~3-5 min normal)
   - Deployment errors

2. **Webhook Logs:**
   - `public_html/webhooks/webhook.log`
   - Verify triggers are working

3. **Google Search Console:**
   - Indexing status
   - Crawl errors
   - Rich snippet validation

4. **User Experience:**
   - Browser console (no API errors)
   - Page load times
   - Content freshness

---

## 🚨 Troubleshooting

### Users See "Article Not Found"

**Check:**
1. Strapi API is running: `curl http://localhost:1337/api/articles`
2. Article is published (not draft)
3. Browser console for API errors
4. Network tab shows successful fetch

**Fix:**
- Ensure `NEXT_PUBLIC_STRAPI_URL` is correct
- Check Strapi article slug matches URL

### Bots Don't Get Static Pages

**Check:**
1. Test: `curl -A "Googlebot" https://yourdomain.com/articles/test`
2. Verify `/articles/test/index.html` exists
3. Check `.htaccess` is uploaded

**Fix:**
- Regenerate SEO pages in CI/CD
- Verify bot detection patterns in `.htaccess`
- Check file permissions (644)

### Webhook Not Triggering

**Check:**
1. Strapi webhook logs (Settings → Webhooks)
2. `public_html/webhooks/webhook.log`
3. GitHub Actions status page

**Fix:**
- Verify secret matches in Strapi and PHP
- Check GitHub PAT is valid
- Test PHP script manually

---

## 🎊 Benefits Summary

### ✅ For Users
- **Instant access** to all articles (no rebuild wait)
- **Always fresh** content from Strapi
- **Fast page loads** (client-side rendering)
- **No stale cache** issues

### ✅ For SEO
- **Perfect indexing** with static pages
- **Full meta tags** for rich snippets
- **JSON-LD** structured data
- **Sitemap** auto-generated

### ✅ For Developers
- **Simple architecture** (one reader page)
- **Automated deployments** (webhook-triggered)
- **Works on shared hosting** (no Node.js required)
- **Scalable** (handles unlimited articles)

### ✅ For Business
- **Zero cost** for new articles (no rebuild)
- **Instant publishing** (users see immediately)
- **SEO optimized** (Google loves static pages)
- **Minimal maintenance** (automated)

---

## 📚 Related Documentation

- **[DEPLOY.md](./DEPLOY.md)** - Complete deployment guide
- **[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)** - CI/CD configuration
- **[scripts/generate-article-pages.mjs](./scripts/generate-article-pages.mjs)** - SEO generator
- **[public/.htaccess](./public/.htaccess)** - Bot detection rules

---

**Architecture Version:** 2.0 (Two-Tier System)  
**Last Updated:** November 6, 2025  
**Status:** Production Ready 🚀
