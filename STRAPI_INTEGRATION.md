# Strapi Integration Guide for DUFS Blog Frontend

## Overview

The frontend has been fully integrated with Strapi CMS as the backend data source. All content is now dynamic and editable through the Strapi admin panel.

## Architecture

### Backend (Strapi)
- **URL**: http://localhost:1337
- **Admin Panel**: http://localhost:1337/admin
- **API Endpoint**: http://localhost:1337/api

### Frontend (Next.js)
- **Type**: Static Site Generation with ISR (Incremental Static Regeneration)
- **Pages**: Pre-rendered at build time, updated via ISR at runtime
- **Data Source**: Strapi API

## Content Types in Strapi

All content types have been created with the following structure:

### 1. **Article** (api::article.article)
- `title` (string, required)
- `slug` (uid, required)
- `excerpt` (text, required)
- `content` (richtext, required)
- `featuredImage` (media, optional)
- `gallery` (media, multiple, optional)
- `language` (enum: 'en', 'bn', 'both')
- `isFeatured` (boolean)
- `isEditorsPick` (boolean)
- `isHero` (boolean)
- `viewCount` (integer)
- `likes` (integer)
- `readTime` (integer)
- `storyState` (enum: 'draft', 'published', 'archived', 'submitted', 'review')
- **Relations**: author, category, tags

### 2. **Author** (api::author.author)
- `Name` (string, required)
- `slug` (uid)
- `Bio` (richtext)
- `Avatar` (media)
- `email` (email)
- `isActive` (boolean)
- **Relations**: articles (one-to-many)

### 3. **Category** (api::category.category)
- `nameEn` (string, required)
- `nameBn` (string, optional)
- `slug` (uid)
- `description` (text)
- `color` (string - hex color)
- `isActive` (boolean)
- `sortOrder` (integer)
- **Relations**: articles (many-to-many)

### 4. **Tag** (api::tag.tag)
- `name` (string, required)
- `slug` (uid)
- `color` (string - hex color)
- **Relations**: articles (many-to-many)

### 5. **Banner** (api::banner.banner)
- `headline` (string, required)
- `postTitle` (string, required)
- `subtitle` (text)
- `postUrl` (string, required)
- `isActive` (boolean)
- `priority` (integer)
- `startDate` (datetime, optional)
- `endDate` (datetime, optional)
- `backgroundColor` (string)
- `textColor` (string)

### 6. **Navigation Item** (api::navigation-item.navigation-item)
- `title` (string, required)
- `href` (string, required)
- `isActive` (boolean)
- `isExternal` (boolean)
- `openInNewTab` (boolean)
- `sortOrder` (integer)

### 7. **Submission** (api::submission.submission)
- `title` (string, required)
- `slug` (uid)
- `excerpt` (text, required)
- `content` (richtext, required)
- `featuredImage` (media)
- `language` (enum: 'en', 'bn', 'both')
- `storyState` (enum: 'submitted', 'under_review', 'approved', 'rejected', 'published')
- `submittedAt` (datetime, required)
- `reviewedAt` (datetime, optional)
- `reviewNotes` (text, optional)
- **Relations**: author, category, tags

## API Client Implementation

### Key Files

1. **`lib/server-api.ts`** - Server-side API client
   - Used in Server Components
   - Handles ISR caching
   - Optimized for static generation

2. **`lib/strapi-helpers.ts`** - Helper utilities
   - `getArticleData()` - Transform Strapi article to frontend format
   - `getArticleImage()` - Extract featured image URL
   - `getAuthorName()` - Safely get author name
   - `formatPublishDate()` - Format dates for display
   - `estimateReadingTime()` - Calculate reading time
   - `createStrapiFilters()` - Build filter queries

3. **`lib/api.ts`** - Client-side API (for future use)
   - Browser-compatible API client
   - For client components

## Frontend Integration

### Updated Components

#### Home Page
- **HeroSection.tsx** - Fetches hero article (isHero = true)
- **FeaturedArticles.tsx** - Fetches featured articles (isFeatured = true)
- **EditorChoice.tsx** - Fetches editors' choice articles (isEditorsPick = true)
- **ArticleCard.tsx** - Updated to work with new data format

#### Article Pages
- **app/articles/[slug]/page.tsx** - Dynamic route with ISR
  - `generateStaticParams()` - Pre-generates all article pages
  - Falls back to ISR for new articles

- **ArticleContent.tsx** - Server component
  - Fetches full article from Strapi
  - Displays all article metadata
  - Shows related articles
  - Handles comments section

#### Layout
- **Sidebar.tsx** - Updated to accept navigation items
- **SidebarLoader.tsx** - Fetches navigation from Strapi

## Deployment Considerations

### Static Build with ISR

The frontend is configured for static generation with ISR:

```typescript
// ISR configuration in server-api.ts
next: {
  revalidate: 3600, // Revalidate every 1 hour
}
```

### Environment Variables

Set these in your `.env.local` or deployment platform:

```bash
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-domain.com
NEXT_PUBLIC_STRAPI_API_TOKEN=your_api_token_here
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

### Strapi API Permissions

Ensure these endpoints have public read access in Strapi:
- GET `/api/articles`
- GET `/api/articles/:slug`
- GET `/api/authors`
- GET `/api/categories`
- GET `/api/tags`
- GET `/api/banners`
- GET `/api/navigation-items`

## Sample Data

Initial sample data has been created in Strapi:

- **8 Categories**: Cinemalapwale, Chitchat, Screenwriting, Craftsmanship, Reviews, Interviews, Features, Miscellaneous
- **5 Authors**: Robert Rubsam, Jillian Steinhauer, Gabriel Winslow-Yost, Tanvir Sakib, DUFS Staff
- **6 Tags**: Cinema, Film Review, Colonialism, Director Profile, Technology, Bengali Cinema
- **5 Articles**: All properly published with relations to categories, authors, and tags
- **5 Navigation Items**: Home, Browse, Submit Article, Account, Sign In
- **1 Banner**: Special announcement

## Performance Optimizations

### ISR (Incremental Static Regeneration)
- Pages are pre-rendered at build time
- New content automatically generates pages on-demand
- Updates revalidate every hour (configurable)
- Perfect for shared server deployment

### Data Transformation
- Strapi data is transformed at build time
- No expensive transformations at runtime
- Images are optimized with Next.js Image component

### Caching
- ISR cache prevents excessive API calls
- Featured/Editor's choice queries cached for 1 hour
- Category pages cached for 1 hour

## Maintenance

### Adding New Content

1. Go to Strapi admin: http://localhost:1337/admin
2. Create new articles, authors, categories as needed
3. Publish content
4. Frontend will automatically generate pages during next build/ISR refresh

### Managing Categories

Categories are editable in Strapi and used for filtering:
- Color codes help with UI theming
- Sort order controls display order
- Active/inactive flag hides categories

### Scheduled Content

Use `startDate` and `endDate` in Banners for time-limited announcements:
- Active banners shown based on current date
- Perfect for special events or promotions

## Troubleshooting

### Pages Not Loading

1. Check Strapi is running: `http://localhost:1337/api/articles`
2. Verify API token is correct
3. Check article status is 'published'
4. Check public permissions in Strapi

### Missing Images

1. Verify image URLs in Strapi media library
2. Check CORS settings if using external domain
3. Ensure image files exist in Strapi public folder

### Build Failures

1. Check Strapi API is accessible during build
2. Verify no articles have draft status (only published)
3. Check for circular relations or missing data
4. Review build logs for specific errors

## Future Enhancements

- [ ] Social sharing metadata (Open Graph)
- [ ] SEO sitemap generation
- [ ] Search functionality
- [ ] User comments approval workflow
- [ ] Analytics integration
- [ ] Email notifications for new content
- [ ] Content scheduling
- [ ] Multi-language support
- [ ] Advanced filtering/sorting

## Contact

For issues or questions, check Strapi documentation: https://strapi.io/documentation
