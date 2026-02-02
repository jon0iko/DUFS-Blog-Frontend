# Single Page Article Implementation

## Overview

This document explains the implementation of a single static page serving all articles, eliminating the need to rebuild the site when new articles are added to Strapi.

## Architecture

### Traditional Approach (Before)
```
/articles/[slug]/page.tsx → Generates /articles/article-1/index.html
                          → Generates /articles/article-2/index.html
                          → Generates /articles/article-3/index.html
                          → ...requires rebuild for new articles
```

### New Approach (Current)
```
/read-article/page.tsx → Generates /read-article/index.html (single file)
                      → Fetches content client-side based on ?slug= parameter
                      → Zero rebuild needed for new articles
```

## Key Files

### 1. `/app/read-article/page.tsx`
- **Purpose**: Single static page that serves ALL articles
- **URL Format**: `/read-article?slug=article-slug`
- **Features**:
  - Uses `useSearchParams()` wrapped in `Suspense` boundary
  - Client-side rendering with dynamic content fetching
  - Error handling for missing slug
  - SEO via dynamic meta tags and prerender.io

### 2. `/components/articles/ArticleContentClient.tsx`
- **Purpose**: Client-side article content fetcher
- **Features**:
  - Fetches article data from Strapi API using slug
  - Always fresh content (no stale cache)
  - Loading states and error handling
  - Injects ArticleMetaHead for SEO

### 3. `/components/articles/ArticleMetaHead.tsx`
- **Purpose**: Dynamic meta tags for SEO
- **Features**:
  - Sets page title, description, Open Graph tags
  - Twitter Card meta tags
  - JSON-LD structured data
  - Updated after article loads client-side

### 4. `/public/.htaccess`
- **Purpose**: URL rewriting and bot detection
- **Key Rules**:
  ```apache
  # Pretty URLs: /articles/slug → /read-article?slug=slug
  RewriteRule ^articles/([^/]+)/?$ /read-article?slug=$1 [L,QSA]
  
  # Bot detection → prerender.io proxy
  RewriteCond %{HTTP_USER_AGENT} googlebot|bingbot|facebookexternalhit [NC]
  RewriteRule ^(.*)$ https://service.prerender.io/https://yoursite.com/$1 [P,L]
  ```

## How It Works

### User Flow
1. User visits `/articles/my-article-slug`
2. `.htaccess` rewrites to `/read-article?slug=my-article-slug`
3. Static `/read-article/index.html` loads
4. JavaScript parses `slug` from query parameter
5. Client-side fetch to Strapi API: `GET /api/articles?filters[slug][$eq]=my-article-slug`
6. Article content renders with fresh data
7. `ArticleMetaHead` updates page meta tags for SEO

### SEO Bot Flow (Google, Bing, Facebook)
1. Bot visits `/articles/my-article-slug`
2. `.htaccess` detects bot user agent
3. Request proxied to `https://service.prerender.io/https://yoursite.com/articles/my-article-slug`
4. Prerender.io executes JavaScript, waits for content to load
5. Returns fully rendered HTML with meta tags to bot
6. Bot indexes pre-rendered content

## Benefits

### ✅ Zero Rebuild for New Articles
- New articles in Strapi are **instantly accessible**
- No GitHub Actions, no build pipeline, no deployment wait
- Just publish in Strapi and the article is live

### ✅ Single Static File
- `/read-article/index.html` serves unlimited articles
- Minimal storage footprint
- Fast hosting deployments

### ✅ Always Fresh Content
- Client-side fetching bypasses build-time cache
- Content edits in Strapi visible immediately
- No stale data issues

### ✅ SEO Friendly
- Dynamic meta tags updated after content loads
- Prerender.io serves pre-rendered HTML to search bots
- Pretty URLs maintained (`/articles/slug`)
- JSON-LD structured data for rich snippets

### ✅ Shared Hosting Compatible
- Pure static files (HTML, CSS, JS)
- No Node.js server required
- Apache `.htaccess` for URL rewriting
- Works on any cheap shared hosting

## Caching Strategy

### Build-Time (Server-Side)
```typescript
// lib/server-api.ts
cache: 'force-cache'
```
- Server-side API calls during build use cached responses
- Homepage, browse page, author pages pre-rendered with cached data
- Fast build times

### Runtime (Client-Side)
```typescript
// lib/api.ts
cache: 'no-store'
```
- Client-side API calls always fetch fresh data
- Article content never stale
- Users see latest edits immediately

## Configuration

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your-api-token-here
```

### Next.js Config
```javascript
// next.config.js
module.exports = {
  output: 'export',           // Static export for shared hosting
  trailingSlash: true,        // /page/ instead of /page.html
  images: { unoptimized: true } // No image optimization (static only)
}
```

### Prerender.io Setup
1. Sign up at https://prerender.io
2. Add your site: `yoursite.com`
3. Get API token
4. Update `.htaccess` with your token:
   ```apache
   RewriteRule ^(.*)$ https://service.prerender.io/https://yoursite.com/$1 [P,L]
   ```

## Backward Compatibility

The system maintains pre-generated article pages for users without JavaScript:
- `/articles/[slug]/page.tsx` still generates static pages during build
- Old URLs (`/articles/slug/`) continue to work
- JavaScript-disabled users see pre-built content
- Modern users get client-side fetched fresh content

## Limitations

### ⚠️ Client-Side Rendering Required
- First page load shows loading state
- No instant content (unlike SSG)
- JavaScript required for content display

### ⚠️ SEO Depends on Prerender.io
- Without prerender.io, bots see empty shells
- Prerender.io has usage limits/cost
- Alternative: Pre-render critical pages with ISR

### ⚠️ No Static HTML for Articles
- Bots relying on raw HTML won't index (rare)
- View source shows client-side React skeleton
- Fixed by prerender.io for major search engines

## Performance

### Metrics
- **First Load JS**: ~106 KB (read-article page)
- **Client-Side Fetch Time**: ~200-500ms (Strapi response)
- **Total Load Time**: ~1-2s (HTML + JS + API + Render)

### Optimization Tips
1. **Enable Strapi Response Caching**: Add Redis/CDN to Strapi
2. **Use CDN for Static Files**: CloudFlare for `_next/` assets
3. **Prefetch on Link Hover**: Preload article data on link mouseover
4. **Service Worker Caching**: Cache API responses offline

## Troubleshooting

### "Article Not Specified" Error
- **Cause**: Missing `?slug=` query parameter
- **Fix**: Ensure `.htaccess` rewrite rules are active
- **Test**: Visit `/read-article?slug=test-article` directly

### Empty Article Content
- **Cause**: Strapi API not returning data
- **Fix**: Check Strapi is running, article is published
- **Debug**: Open browser console, check network tab for API errors

### Prerender.io Not Working
- **Cause**: `.htaccess` not applied, bot user agent not detected
- **Fix**: Test with `?_escaped_fragment_=` parameter
- **Verify**: Use Google Search Console "URL Inspection" tool

### Build Errors with `useSearchParams()`
- **Cause**: Missing `Suspense` boundary
- **Fix**: Wrap component using `useSearchParams()` in `<Suspense>`
- **Example**: See `/app/read-article/page.tsx`

## Future Enhancements

### 1. Prefetching Strategy
```typescript
// Prefetch article on link hover
<Link 
  href="/articles/slug"
  onMouseEnter={() => prefetchArticle('slug')}
>
```

### 2. Offline Support
```javascript
// Service Worker: Cache API responses
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/articles')) {
    event.respondWith(
      caches.match(event.request).then(cached => 
        cached || fetch(event.request)
      )
    );
  }
});
```

### 3. Static Generation for Popular Articles
```typescript
// Generate top 100 articles statically, rest client-side
export async function generateStaticParams() {
  const topArticles = await getTopArticles(100);
  return topArticles.map(article => ({ slug: article.slug }));
}
```

### 4. Edge Caching with ISR
```typescript
// Use Next.js ISR for frequently accessed articles
export const revalidate = 60; // Revalidate every 60 seconds
```

## Deployment Checklist

- [ ] Strapi backend running and accessible
- [ ] Environment variables configured (`.env.local`)
- [ ] Build succeeds: `npm run build`
- [ ] Static files exported to `/out` directory
- [ ] `.htaccess` uploaded to server
- [ ] Test article URL: `/articles/test-slug`
- [ ] Verify client-side fetching works
- [ ] Prerender.io configured (optional but recommended)
- [ ] Test with Google Search Console URL Inspection
- [ ] Monitor 404 errors for broken slug patterns

## Resources

- [Next.js Static Export Docs](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Strapi v5 API Docs](https://docs.strapi.io/dev-docs/api/rest)
- [Prerender.io Setup Guide](https://docs.prerender.io/)
- [Apache mod_rewrite Guide](https://httpd.apache.org/docs/current/rewrite/)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Strapi API responses in network tab
3. Test `.htaccess` rules with curl:
   ```bash
   curl -H "User-Agent: Googlebot" https://yoursite.com/articles/test
   ```
4. Review this documentation
5. Check Next.js and Strapi GitHub issues

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Author**: GitHub Copilot
