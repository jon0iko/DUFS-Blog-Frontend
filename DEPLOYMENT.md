# DUFS Blog - Deployment Quick Start

## Pre-Deployment Checklist

### Backend (Strapi)

- [ ] Strapi is running and accessible at configured URL
- [ ] Admin panel is accessible at `/admin`
- [ ] All content types are created
- [ ] Sample content is published (at least 1 hero article)
- [ ] API token is generated and secure
- [ ] Public API endpoints have correct permissions
- [ ] Media files are uploaded and accessible
- [ ] Database is backed up

### Frontend (Next.js)

- [ ] All npm dependencies installed
- [ ] Environment variables set correctly
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Build completes successfully (`npm run build`)

## Environment Variables

Create `.env.production.local` for production:

```bash
# Strapi API Configuration
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-domain.com
NEXT_PUBLIC_STRAPI_API_TOKEN=your_secure_token

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-dufs-blog-domain.com
NEXT_PUBLIC_SITE_NAME=DUFS Blog
NEXT_PUBLIC_SITE_DESCRIPTION=The Dhaka University Film Society Blog
```

## Local Testing Before Deployment

### 1. Test Production Build Locally

```bash
# Build the project
npm run build

# Start production server
npm run start

# Visit http://localhost:3000
```

### 2. Test All Routes

Visit these routes to verify everything works:
- `/` - Home page
- `/browse` - Browse page
- `/articles/[slug]` - Article details
- `/authors/[slug]` - Author pages (if implemented)
- `/submit` - Article submission

### 3. Verify Data is Loading

- Check browser console for API errors
- Verify images are loading correctly
- Check article content displays with proper formatting
- Verify navigation items appear

## Deployment Steps

### Option 1: Static Build (Recommended for Shared Hosting)

```bash
# Build static site with ISR
npm run build

# This generates:
# - Static HTML files in .next/standalone
# - Prerendered pages for all articles
# - ISR support for dynamic content
```

**Deploy `.next` folder to your shared server**

### Option 2: Server-Side Rendering

```bash
# Build for server deployment
npm run build

# Deploy entire project (or at minimum: .next, public, package.json, package-lock.json)
npm run start
```

### Option 3: Docker Container

```bash
# Build Docker image
docker build -t dufs-blog .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_STRAPI_URL=https://your-strapi.com \
  -e NEXT_PUBLIC_STRAPI_API_TOKEN=your_token \
  dufs-blog
```

## Post-Deployment

### 1. Verify Site is Live

- Check homepage loads
- Verify articles display
- Test navigation
- Check images load correctly

### 2. Monitor Performance

- Check Lighthouse scores
- Monitor API response times
- Watch for 404 errors
- Track user interactions

### 3. Setup ISR

For ISR to work, you need:
- Node.js server running (not static hosting)
- Revalidation will happen automatically
- New articles available within 1 hour

### 4. Content Updates

After deploying:
1. Add/edit content in Strapi
2. Publish articles
3. ISR will automatically regenerate pages
4. Or manually trigger rebuild via your deployment platform

## API Integration

### Strapi API Endpoints Used

The frontend calls these endpoints:
- `GET /api/articles` - All articles with filters
- `GET /api/articles?filters[isHero]=true` - Hero article
- `GET /api/articles?filters[isFeatured]=true` - Featured articles
- `GET /api/articles?filters[isEditorsPick]=true` - Editor's choice
- `GET /api/authors` - All authors
- `GET /api/categories` - All categories
- `GET /api/navigation-items` - Navigation menu
- `GET /api/banners` - Active banners

### Ensure Permissions

In Strapi Admin:
1. Go to **Settings → Roles → Public**
2. Enable these for "Article", "Author", "Category", "Tag", "Banner", "Navigation Item":
   - `find` (list all)
   - `findOne` (get single item)

## Troubleshooting

### 404 Not Found on Articles

- Verify article status is "published" in Strapi
- Check article slug is correct
- Rebuild site: `npm run build`

### API Connection Error

- Verify Strapi URL is correct
- Check API token is valid
- Ensure Strapi is running and accessible
- Check CORS settings

### Images Not Loading

- Verify image URLs in Strapi
- Check image files exist in Strapi media library
- Ensure Strapi media endpoint is accessible
- Check image permissions

### Build Hangs/Times Out

- Check Strapi API is responsive
- Reduce pagination size if fetching many items
- Check network connectivity
- Review Strapi logs for errors

## Performance Tips

1. **Enable CDN** - Serve static assets through a CDN
2. **Optimize Images** - Use Strapi's built-in image optimization
3. **Monitor Build Time** - Aim for < 5 minutes
4. **Cache Strategy** - ISR revalidates hourly by default
5. **Database** - Ensure Strapi database is optimized

## Monitoring

### Log Files to Watch

- Frontend: Application logs (deployment platform specific)
- Strapi: Application logs at `./logs` or platform specific location
- API: Request logs for failed calls

### Key Metrics

- Page load time (aim for < 3s)
- Time to First Paint (< 1.5s)
- API response time (< 500ms)
- Build time (track trends)

## Support

For issues:
1. Check STRAPI_INTEGRATION.md for detailed documentation
2. Review troubleshooting section
3. Check Strapi admin panel for content issues
4. Check deployment platform logs
5. Review browser console for errors

## Maintenance

### Regular Tasks

- [ ] Weekly: Monitor error logs
- [ ] Weekly: Check ISR revalidation working
- [ ] Monthly: Review analytics
- [ ] Monthly: Update content
- [ ] Quarterly: Test deployment process

### Content Editing Non-Tech Users

1. Go to Strapi admin: `https://your-strapi-domain.com/admin`
2. Login with provided credentials
3. Use the content editor to manage articles
4. All changes automatically appear on website

---

**Last Updated**: October 27, 2025
**Version**: 1.0
**Status**: Production Ready ✓
