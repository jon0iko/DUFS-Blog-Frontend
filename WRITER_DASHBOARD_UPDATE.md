# Writer Dashboard & Editor Routes Update

## Overview
This update reorganizes the submission flow by separating the dashboard and editor into distinct routes, providing a better user experience for writers.

## Changes Made

### 1. New Routes Created

#### `/submit` - Writer Dashboard
- **Purpose**: Central hub for writers to manage their content
- **Features**:
  - Statistics overview (total articles, views, likes, comments)
  - Quick action cards for "Write" and "Upload"
  - List of user's published articles with management options
  - Edit and delete functionality for existing articles
- **Protection**: Requires authentication (redirects to `/auth/signin?redirect=/submit`)

#### `/editor` - Article Editor
- **Purpose**: Dedicated writing environment with TipTap editor
- **Features**:
  - Full-featured rich text editor
  - Draft management (save, load, delete)
  - Publishing workflow
  - Word count tracking
  - Local storage for auto-save
- **Protection**: Requires authentication (redirects to `/auth/signin?redirect=/editor`)
- **Navigation**: Back button returns to `/submit` dashboard

#### `/blogup` - Upload Articles (Coming Soon)
- **Purpose**: Placeholder for future article upload feature
- **Status**: Coming soon page with format list
- **Protection**: Requires authentication

### 2. New Components

#### `components/dashboard/QuickActions.tsx`
- Displays two action cards: "Write" and "Upload"
- Hover effects and animations
- Routes to `/editor` and `/blogup` respectively

#### `components/dashboard/StatsOverview.tsx`
- Shows 4 stat cards in a responsive grid
- Displays total articles, views, likes, and comments
- Includes trend indicators
- Responsive: 1 column on mobile, 2 on tablet, 4 on desktop

#### `components/dashboard/UserArticlesList.tsx`
- Lists user's articles with featured images
- Shows article metadata (status, category, date, views, likes)
- Action menu for each article (Edit, Delete)
- Empty state when no articles exist
- Responsive layout with proper image handling

### 3. API Enhancements

Added to `lib/api.ts`:

```typescript
// Get articles by user ID (through author relation)
export async function getUserArticles(userId: number): Promise<Article[]>

// Get article statistics for a user
export async function getUserArticleStats(userId: number): Promise<{
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}>
```

### 4. Authentication Flow Updates

#### `contexts/AuthContext.tsx`
- Now uses `useSearchParams` to read `redirect` query parameter
- After successful login/registration, redirects to the URL specified in `redirect` param
- Falls back to home (`/`) if no redirect is specified

#### Updated Redirects
- `/submit` → protected, redirects to `/auth/signin?redirect=/submit`
- `/editor` → protected, redirects to `/auth/signin?redirect=/editor`
- `/blogup` → protected, redirects to `/auth/signin?redirect=/blogup`

### 5. Navigation Updates

#### `components/layout/LayoutContent.tsx`
- Updated to hide Header/Footer/Banner on `/editor` page (was `/submit`)
- Submit dashboard now shows full layout with navigation

#### `components/auth/AccountProfile.tsx`
- "New Post" buttons now redirect to `/editor` (was `/submit`)
- "Start Writing" button redirects to `/editor`
- Opening drafts redirects to `/editor`

#### Navigation Menu
- "Submit Article" menu item still points to `/submit` (dashboard)
- Users see dashboard first, then choose Write or Upload

## User Flow

### New Article Flow
1. User clicks "Submit Article" in navigation → Goes to `/submit` dashboard
2. User sees statistics and quick actions
3. User clicks "Write" → Goes to `/editor`
4. User writes article and publishes
5. After publish → Redirects back to `/submit` dashboard

### Edit Existing Article Flow
1. User goes to `/submit` dashboard
2. Sees list of their articles
3. Clicks three-dot menu on an article
4. Clicks "Edit" → Goes to `/editor` with article loaded
5. Makes changes and publishes
6. After publish → Redirects back to `/submit` dashboard

### Login Redirect Flow
1. Unauthenticated user tries to access `/submit` or `/editor`
2. Gets redirected to `/auth/signin?redirect=/submit` (or `/editor`)
3. After successful login, automatically redirected back to intended page

## Responsive Design

All new components are fully responsive:
- **Mobile (< 640px)**: Single column layout, stacked elements
- **Tablet (640px - 1024px)**: 2-column grids where appropriate
- **Desktop (> 1024px)**: Full 4-column grid for stats, optimized spacing

## Design Consistency

- Uses existing DUFS color system (black/white primary colors)
- Follows dark mode patterns from the rest of the site
- Consistent border radius, shadows, and transitions
- Matches existing card and button styles
- Uses lucide-react icons throughout

## Technical Details

### Data Fetching
- Uses Strapi v5 API with flattened response format
- Fetches articles through author relation (user → author → articles)
- Parallel fetching of articles and stats for better performance
- Proper error handling and loading states

### Type Safety
- New `UserArticle` interface in `UserArticlesList.tsx`
- Proper transformation from Strapi Article type to display type
- Full TypeScript coverage

### Performance
- Uses Next.js 14 client components where needed
- Implements proper React hooks (useEffect, useState, useCallback)
- Optimized image loading with Next.js Image component
- Local storage for editor content preservation

## Future Enhancements

1. **Upload Feature** (`/blogup`): Implement document import (Word, Markdown, HTML, etc.)
2. **Comments Count**: Add API integration to fetch actual comment counts
3. **Article Deletion**: Implement Strapi API call for article deletion
4. **Filtering/Sorting**: Add filters for article list (status, date, category)
5. **Search**: Add search functionality in article list
6. **Analytics**: Enhanced statistics with charts and trends
7. **Drafts Section**: Separate view for drafts in dashboard

## Migration Notes

- Old `/submit` route completely replaced with new dashboard
- Editor code moved to `/editor` route
- All localStorage keys remain compatible
- No database migrations required
- Backward compatible with existing user sessions
