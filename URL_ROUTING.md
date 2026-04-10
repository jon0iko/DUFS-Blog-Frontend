# URL Routing Guide - Development vs Production

## 🎯 Quick Summary

**In Code (Development & Production):**
- All article links use: `/read-article?slug=<article-slug>`

**In Production (with .htaccess):**
- Users visit: `/articles/<article-slug>` (pretty URL)
- Apache rewrites to: `/read-article?slug=<article-slug>` (behind scenes)
- Browser shows: `/articles/<article-slug>` (stays pretty!)

---

## 📋 URL Structure

### Internal Links (in code)

All components now link to the universal reader:

```typescript
// ✅ CORRECT - Used everywhere in code
<Link href={`/read-article?slug=${slug}`}>

// ❌ WRONG - No longer used
<Link href={`/articles/${slug}`}>
```

**Why?**
- Works in both development and production
- No 404 errors in dev mode
- Direct access to the reader page

### Public URLs (for users and SEO)

**Development (npm run dev):**
```
http://localhost:3000/read-article?slug=my-article
```

**Production (with Apache .htaccess):**
```
User visits:     https://yourdomain.com/articles/my-article
Apache rewrites: /read-article?slug=my-article (internal)
User sees:       https://yourdomain.com/articles/my-article (stays same!)
```

**SEO/Meta Tags:**
```html
<!-- These still use /articles/ for proper canonical URLs -->
<link rel="canonical" href="https://yourdomain.com/articles/my-article">
<meta property="og:url" content="https://yourdomain.com/articles/my-article">
```

---

## 🔄 How .htaccess Works in Production

### For Human Users

```apache
# Rule: /articles/<slug> → /read-article?slug=<slug>
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^articles/([^/]+)/?$ /read-article?slug=$1 [L,QSA]
```

**Flow:**
1. User visits: `https://yourdomain.com/articles/my-article`
2. Apache checks: Is there a static file? No
3. Apache rewrites to: `/read-article?slug=my-article`
4. Next.js loads: `app/read-article/page.tsx`
5. Client-side fetches from Strapi
6. **URL stays:** `/articles/my-article` (pretty!)

### For Search Engine Bots

```apache
# Rule: Bots get static SEO pages
RewriteCond %{ENV:IS_BOT} =1
RewriteCond %{REQUEST_URI} ^/articles/([^/]+)/?$ [NC]
RewriteCond %{DOCUMENT_ROOT}/articles/%1/index.html -f
RewriteRule ^articles/([^/]+)/?$ /articles/$1/index.html [L]
```

**Flow:**
1. Googlebot visits: `https://yourdomain.com/articles/my-article`
2. Apache checks: Is user-agent a bot? Yes
3. Apache checks: Does static SEO page exist? Yes
4. Apache serves: `/articles/my-article/index.html` (static)
5. Bot gets full HTML with meta tags
6. Perfect SEO!

---

## 🗂️ Files Updated

### Component Files (Updated to use /read-article)

1. **`components/home/ArticleCard.tsx`**
   ```typescript
   // Changed from:
   <Link href={`/articles/${article.slug}`}>
   
   // To:
   <Link href={`/read-article?slug=${article.slug}`}>
   ```

2. **`components/home/HeroSection.tsx`**
   ```typescript
   // Changed from:
   <Link href={`/articles/${articleData.slug}`}>
   
   // To:
   <Link href={`/read-article?slug=${articleData.slug}`}>
   ```

3. **`components/articles/RelatedArticles.tsx`**
   ```typescript
   // Changed from:
   <Link href={`/articles/${article.slug}`}>
   
   // To:
   <Link href={`/read-article?slug=${article.slug}`}>
   ```

4. **`components/articles/ArticleContent.tsx`**
   ```typescript
   // Changed from:
   <ShareButtons url={`/articles/${article.slug}`} />
   
   // To:
   <ShareButtons url={`/read-article?slug=${article.slug}`} />
   ```

### Files NOT Changed (Keeping /articles/ for SEO)

1. **`lib/metadata.ts`** - Keep `/articles/${slug}` for canonical URLs
2. **`scripts/generate-article-pages.mjs`** - Generates static pages at `/articles/${slug}/`
3. **`public/.htaccess`** - Handles the URL rewriting

---

## ✅ Benefits of This Approach

### 1. **Works in Development**
- No 404 errors when clicking articles in dev mode
- Direct access to `/read-article?slug=...`
- No Apache required for local testing

### 2. **Pretty URLs in Production**
- Users see: `/articles/my-article` (clean!)
- Shares work: `/articles/my-article` (shareable)
- SEO perfect: `/articles/my-article` (indexable)

### 3. **Simple Maintenance**
- One universal reader page for all articles
- No dynamic route complexity
- Easy to debug and test

### 4. **SEO Optimized**
- Canonical URLs use `/articles/` format
- Bots get static pages with full meta tags
- Users get dynamic fresh content

---

## 🧪 Testing

### Development Testing

```bash
# Start dev server
npm run dev

# Visit article (should work!)
http://localhost:3000/read-article?slug=test-slug
```

**Expected:**
- ✅ Article content loads from Strapi
- ✅ No 404 error
- ✅ URL shows query parameter

### Production Testing

```bash
# After deploying to cPanel

# Test human user (browser)
https://yourdomain.com/articles/my-article

# Test bot (curl)
curl -A "Googlebot" https://yourdomain.com/articles/my-article
```

**Expected:**
- ✅ Human: URL stays `/articles/my-article`, content loads
- ✅ Bot: Gets static HTML with meta tags

---

## 🚨 Common Issues

### Issue: 404 in Development

**Problem:** Clicking article shows 404

**Cause:** Components still linking to `/articles/` instead of `/read-article`

**Solution:** Check all components are using `/read-article?slug=`

### Issue: Query Params Visible in Production

**Problem:** Users see `/read-article?slug=...` in production

**Cause:** .htaccess not uploaded or not working

**Solution:**
1. Verify `public/.htaccess` exists in deployed site
2. Check Apache mod_rewrite is enabled
3. Test: Visit `/articles/test` directly

### Issue: Pretty URLs Don't Work

**Problem:** Must use `/read-article?slug=...` even in production

**Cause:** Apache rewrite rules not active

**Solution:**
1. Check `.htaccess` is in public_html root
2. Verify `RewriteEngine On` is active
3. Check server error logs

---

## 📚 Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system design
- **[DEPLOY.md](./DEPLOY.md)** - Production deployment guide
- **[START_HERE.md](./START_HERE.md)** - Quick start guide

---

**Last Updated:** November 6, 2025  
**Status:** ✅ Fixed - All components now use `/read-article?slug=`
