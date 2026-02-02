# Single-Page SSG with Dynamic Content & SEO Setup

## Overview

Your site now uses a **single static HTML page** for all articles with:
- ✅ Fast build times (seconds, not minutes)
- ✅ All articles accessible immediately (no rebuild needed)
- ✅ Fresh content on every page load
- ✅ Full SEO support for Google and social media

## How It Works

### For Regular Users
1. User visits `/articles/some-article-slug`
2. Server serves static `/articles/index.html` (via `.htaccess` rewrite)
3. Client-side JavaScript fetches article from Strapi
4. Article renders with dynamic meta tags
5. **Result**: Fresh content every time

### For Bots/Crawlers (Google, Facebook, Twitter)
1. Bot visits `/articles/some-article-slug`
2. Server detects bot via User-Agent
3. Request proxied to Prerender.io service
4. Prerender.io fetches page, executes JavaScript, captures HTML snapshot
5. Snapshot (with full meta tags, JSON-LD) returned to bot
6. **Result**: Perfect SEO indexing

---

## Setup Instructions

### Step 1: Configure Prerender.io (for SEO)

#### 1.1 Sign Up for Prerender.io

Visit: https://prerender.io/

- **Free tier**: 1,000 cached pages/month (perfect for blogs)
- **Alternative**: https://prerender.cloud (also has free tier)

#### 1.2 Get Your Token

After signup, copy your API token from the dashboard.

#### 1.3 Add Token to .htaccess

Edit `public/.htaccess`, find this line:
```apache
RequestHeader set X-Prerender-Token "YOUR_PRERENDER_TOKEN"
```

Replace with your actual token:
```apache
RequestHeader set X-Prerender-Token "abc123xyz789..."
```

#### 1.4 Update Domain

Find this line:
```apache
RewriteRule ^(.*)$ https://service.prerender.io/https://yourdomain.com/$1 [P,L]
```

Replace `yourdomain.com` with your actual domain:
```apache
RewriteRule ^(.*)$ https://service.prerender.io/https://dufsblog.com/$1 [P,L]
```

---

### Step 2: Deploy to Server

#### 2.1 Build the Site

```bash
npm run build
```

This creates the `out/` directory with your static files.

#### 2.2 Copy .htaccess to Output

```bash
# Windows PowerShell
Copy-Item "public\.htaccess" "out\.htaccess"

# Linux/Mac
cp public/.htaccess out/.htaccess
```

#### 2.3 Upload to Server

Upload the entire `out/` directory (including `.htaccess`) to your web root:

```bash
# Using rsync
rsync -avz --delete out/ user@yourserver.com:/var/www/html/

# Using SCP
scp -r out/* user@yourserver.com:/var/www/html/
```

#### 2.4 Verify Apache Modules

Ensure your server has these modules enabled:

```bash
# SSH into your server
ssh user@yourserver.com

# Check modules
apache2ctl -M | grep -E 'rewrite|proxy|headers'
```

You should see:
- `rewrite_module`
- `proxy_module`
- `proxy_http_module`
- `headers_module`

If missing, enable them:
```bash
sudo a2enmod rewrite proxy proxy_http headers
sudo systemctl restart apache2
```

---

### Step 3: Test the Setup

#### 3.1 Test Regular User Experience

Visit any article URL in your browser:
```
https://yourdomain.com/articles/test-article
```

You should:
- ✅ See the article load
- ✅ See correct title in browser tab
- ✅ Content fetched from Strapi

#### 3.2 Test Bot/Crawler Experience

Use a bot simulator to test SEO:

```bash
# Using curl with Googlebot user agent
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://yourdomain.com/articles/test-article
```

You should see:
- ✅ Full HTML with rendered content
- ✅ Meta tags in `<head>`
- ✅ JSON-LD structured data

#### 3.3 Test with Google Rich Results Test

Visit: https://search.google.com/test/rich-results

Enter your article URL and check for:
- ✅ Article schema detected
- ✅ Title, description, image visible
- ✅ Author information
- ✅ Published date

---

### Step 4: Submit Sitemap to Google

#### 4.1 Create Sitemap in Strapi

Install the Strapi sitemap plugin or create a custom route:

```javascript
// config/plugins.js in Strapi
module.exports = {
  'sitemap': {
    enabled: true,
    config: {
      excludedTypes: [],
      limit: 45000,
    },
  },
};
```

Or create custom route at `src/api/sitemap/routes/sitemap.js`:

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/sitemap.xml',
      handler: 'sitemap.index',
    },
  ],
};
```

#### 4.2 Add Sitemap to robots.txt

Create/edit `public/robots.txt`:

```txt
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

#### 4.3 Submit to Google Search Console

1. Go to https://search.google.com/search-console
2. Add your property
3. Submit sitemap URL
4. Wait for indexing (usually 1-7 days)

---

## Monitoring & Troubleshooting

### Check if Prerender is Working

Visit: https://app.prerender.io/cached

You'll see a list of URLs that have been cached by the service.

### Common Issues

#### Issue 1: Articles not loading

**Symptom**: Blank page or "Article not found"

**Solution**:
- Check browser console for errors
- Verify Strapi is running and accessible
- Check `NEXT_PUBLIC_STRAPI_URL` in your environment

#### Issue 2: 404 errors for article URLs

**Symptom**: Server returns 404 instead of article page

**Solution**:
- Verify `.htaccess` is in web root
- Check Apache rewrite module is enabled
- Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`

#### Issue 3: Bots not seeing meta tags

**Symptom**: Google doesn't show title/description

**Solution**:
- Check Prerender.io dashboard for errors
- Verify token is correct in `.htaccess`
- Test with curl command (see Step 3.2)
- Check mod_proxy is enabled

#### Issue 4: Images not loading

**Symptom**: Broken images on articles

**Solution**:
- Verify `NEXT_PUBLIC_STRAPI_URL` is correct
- Check image URLs in browser DevTools
- Ensure Strapi media URLs are publicly accessible

---

## Performance Optimization

### 1. Enable Caching

The `.htaccess` file already includes caching headers:
- HTML: 5 minutes
- CSS/JS: 1 week
- Images: 1 month

### 2. Use CDN (Optional)

For better global performance:
- Cloudflare (free tier available)
- BunnyCDN
- KeyCDN

Setup:
1. Point your domain to CDN
2. CDN forwards requests to your origin server
3. CDN caches static assets globally

### 3. Optimize Images in Strapi

- Enable responsive images plugin
- Use WebP format
- Set appropriate image sizes

---

## Cost Breakdown

| Service | Cost | Purpose |
|---------|------|---------|
| **Apache Hosting** | You have it | Serve static files |
| **Strapi (your server)** | You have it | CMS backend |
| **Prerender.io** | Free (1K pages/month) | SEO for bots |
| **Domain** | You have it | Website URL |

**Total extra cost**: $0/month ✅

---

## Content Workflow

### Adding New Articles

1. **Create article in Strapi** → Publish
2. **Article immediately accessible** at `/articles/new-slug`
3. **Users see it** after page refresh (no rebuild!)
4. **Bots/Google index it** automatically

### No Build Required! 🎉

Unlike the previous approach:
- ❌ No `npm run build`
- ❌ No redeployment
- ❌ No waiting
- ✅ Just publish in Strapi!

---

## SEO Checklist

After setup, verify:

- [ ] Prerender.io token configured in `.htaccess`
- [ ] Domain updated in `.htaccess`
- [ ] `.htaccess` uploaded to server
- [ ] Apache modules enabled (rewrite, proxy, headers)
- [ ] Test article loads in browser
- [ ] Test bot view with curl
- [ ] Meta tags visible in page source (for bots)
- [ ] Sitemap created and submitted to Google
- [ ] robots.txt points to sitemap
- [ ] Google Search Console configured

---

## Testing Checklist

### Manual Tests

1. **Browser test**:
   ```
   Visit: https://yourdomain.com/articles/test-article
   Expected: Article loads with title and content
   ```

2. **Bot test**:
   ```bash
   curl -A "Googlebot" https://yourdomain.com/articles/test-article | grep "<title>"
   Expected: See article title in output
   ```

3. **Meta tags test**:
   ```bash
   curl -A "Googlebot" https://yourdomain.com/articles/test-article | grep "og:title"
   Expected: See Open Graph title tag
   ```

4. **New article test**:
   - Create new article in Strapi
   - Visit URL immediately
   - Should load without rebuild

### Automated Tests

Use these tools:
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

---

## Support & Resources

- **Prerender.io Docs**: https://docs.prerender.io/
- **Apache mod_rewrite**: https://httpd.apache.org/docs/current/mod/mod_rewrite.html
- **Next.js Static Export**: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Google Search Console**: https://search.google.com/search-console

---

## Summary

### What Changed
- ✅ Build time: 30-60 seconds → **10 seconds**
- ✅ New articles: Manual rebuild → **Instant (on refresh)**
- ✅ SEO: Pre-built HTML → **Dynamic HTML for bots**
- ✅ Scalability: 100 articles max → **Unlimited**

### What Stayed Same
- ✅ Static hosting (no Node.js required)
- ✅ Fast page loads for users
- ✅ Works on shared hosting
- ✅ Perfect SEO

Your blog is now **truly dynamic** while staying **statically hosted**! 🚀
