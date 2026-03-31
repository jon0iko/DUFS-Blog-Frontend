# Strapi v5 Setup for DUFS Blog (Single‑language per entity)

This guide tells you exactly what to create in Strapi v5 so your Next.js frontend can load all content from the backend. Every entity stores content in only one language at a time (no duplicate fields like titleBn). Where needed, use a single `language` enum field.

## What you will build
- Collection types: Article, Author, Category, Tag, Navigation Item, Banner, Submission, Comment, Page (for standard static pages)
- Single types: Site Config, Home Page, Browse Page, Submit Page, Article Template
- Components: SEO, Section Settings (shared), and Page Builder blocks (Dynamic Zone)
- Public permissions and an API Token
- Initial seed content (categories, author, one hero article, etc.)

---

## 1) Create Components first

Create these components before content types so relations/blocks are available.

### 1.1 Component: `shared.Seo`
- Fields
  - `metaTitle` (Text, max ~60)
  - `metaDescription` (Text, max ~160)
  - `metaKeywords` (JSON) — array of strings
  - `MetalImage` (Media, Single, Images)

### 1.2 Component: `shared.sectionSettings`
- Purpose: shared layout/visibility controls for every block
- Fields
  - `enabled` (Boolean, default true)
  - `anchorId` (Text)
  - `spacingTop` (Enumeration: none, sm, md, lg, xl; default md)
  - `spacingBottom` (Enumeration: none, sm, md, lg, xl; default md)
  - `backgroundColor` (Text, hex or tailwind token)
  - `visibility` (Enumeration: all, desktop, mobile; default all)

### 1.3 Page Builder Block components (namespace: `blocks.*`)

Each block includes `sectionSettings` (Component: `shared.sectionSettings`).

- `blocks.heroSection`
  - `article` (Relation: Article, required)
  - `showExcerpt` (Boolean, default false)
  - `overlay` (Boolean, default true)
  - `grayscale` (Boolean, default false)
  - `sectionSettings` (Component)

- `blocks.featuredArticlesSection`
  - `limit` (Number, default 4)
  - `filterCategory` (Relation: Category, optional)
  - `filterLanguage` (Enumeration: en, bn, both; optional)
  - `excludeArticleIds` (JSON, optional array of numeric IDs)
  - `sectionSettings` (Component)

- `blocks.editorsChoiceSection`
  - `articles` (Relation: Article[], multiple, required) — manually curated
  - `sectionSettings` (Component)

- `blocks.articlesListSection`
  - `filters.category` (Relation: Category, optional)
  - `filters.tags` (Relation: Tag[], multiple, optional)
  - `filters.language` (Enumeration: en, bn, both; optional)
  - `sort` (Text, default "publishedAt:desc")
  - `limit` (Number, default 12)
  - `showPagination` (Boolean, default true)
  - `layout` (Enumeration: grid, list; default grid)
  - `sectionSettings` (Component)

- `blocks.categoryTabsSection`
  - `categories` (Relation: Category[], multiple)
  - `defaultCategory` (Relation: Category, optional)
  - `sectionSettings` (Component)

- `blocks.richTextSection`
  - `content` (Rich Text)
  - `sectionSettings` (Component)

- `blocks.bannerSection`
  - `source` (Enumeration: reference, custom; default reference)
  - If `reference`:
    - `banner` (Relation: Banner)
  - If `custom`:
    - `headline` (Text)
    - `postTitle` (Text)
    - `subtitle` (Text)
    - `postUrl` (Text)
  - `sectionSettings` (Component)

- `blocks.callToActionSection`
  - `title` (Text)
  - `subtitle` (Text)
  - `ctaText` (Text)
  - `ctaUrl` (Text)
  - `style` (Enumeration: primary, secondary; default primary)
  - `sectionSettings` (Component)

- `blocks.mediaSection`
  - `images` (Media, Multiple)
  - `captions` (JSON, array of strings aligned by index, optional)
  - `sectionSettings` (Component)

- `blocks.htmlEmbedSection`
  - `rawHtml` (Text — keep short; sanitize on frontend)
  - `sectionSettings` (Component)

- `blocks.newsletterSignupSection`
  - `title` (Text)
  - `subtitle` (Text)
  - `provider` (Enumeration: custom, mailchimp; default custom)
  - `actionUrl` (Text)
  - `sectionSettings` (Component)

---

## 2) Create Content Types

All entities are single‑language per entry. Where relevant add `language` (Enumeration: en, bn, both).

### 2.1 Collection Type: Article (`article`)
- Fields
  - `title` (Text, required)
  - `slug` (UID, required, target: title)
  - `excerpt` (Text, required, max ~300)
  - `content` (Rich Text, required)
  - `language` (Enumeration: en, bn, both; required)
  - `status` (Enumeration: draft, review, published, archived, submitted; default draft)
  - `featuredImage` (Media, Single, required)
  - `socialImage` (Media, Single)
  - `gallery` (Media, Multiple)
  - `isFeatured` (Boolean, default false)
  - `InFeatured` (Boolean, default false)
  - `InSlider` (Boolean, default false)
  - `readTime` (Number)
  - `viewCount` (Number, default 0)
  - `likes` (Number, default 0)
  - `seo` (Component: `shared.seo`)
- Relations
  - `author` (Relation: Many-to-One → Author, required)
  - `category` (Relation: Many-to-One → Category, required)
  - `tags` (Relation: Many-to-Many → Tag)
- Draft & Publish: Enabled

### 2.2 Collection Type: Author (`author`)
- Fields
  - `name` (Text, required)
  - `slug` (UID, required, target: name)
  - `bio` (Text)
  - `email` (Email)
  - `avatar` (Media, Single)
  - `isActive` (Boolean, default true)
  - `articlesCount` (Number, default 0) — optional (can be maintained via lifecycle)
- Relations
  - `user` (Relation: One-to-One → User, optional)

### 2.3 Collection Type: Category (`category`)
- Fields
  - `name` (Text, required)
  - `slug` (UID, required, target: name)
  - `description` (Text)
  - `color` (Text) — hex like #E5E7EB or a token
  - `isActive` (Boolean, default true)
  - `sortOrder` (Number, default 0)

### 2.4 Collection Type: Tag (`tag`)
- Fields
  - `name` (Text, required)
  - `slug` (UID, required, target: name)
  - `color` (Text)

### 2.5 Single Type: Site Config (`site-config`)
- Fields
  - `siteName` (Text, required)
  - `siteDescription` (Text, required)
  - `siteUrl` (Text, required)
  - `logoLight` (Media, Single)
  - `logoDark` (Media, Single)
  - `favicon` (Media, Single)
  - `defaultMetaImage` (Media, Single)
  - `contactEmail` (Email, required)
  - `supportedLanguages` (JSON) — like ["en","bn"]
  - `defaultLanguage` (Enumeration: en, bn; default en)
  - `socialLinks` (Component, repeatable: platform enum youtube/twitter/instagram/facebook/linkedin/website, href text, icon media single, isActive bool, sortOrder number)
  - `seo` (Component: `shared.seo`)

### 2.6 Collection Type: Navigation Item (`navigation-item`)
- Fields
  - `title` (Text, required)
  - `href` (Text, required) — absolute or relative path
  - `isExternal` (Boolean, default false)
  - `isActive` (Boolean, default true)
  - `openInNewTab` (Boolean, default false)
  - `sortOrder` (Number, default 0)

### 2.7 Collection Type: Banner (`banner`)
- Fields
  - `headline` (Text, required)
  - `postTitle` (Text, required)
  - `subtitle` (Text, required)
  - `postUrl` (Text, required)
  - `isActive` (Boolean, default false)
  - `startDate` (DateTime)
  - `endDate` (DateTime)
  - `priority` (Number, default 0)
  - `backgroundColor` (Text)
  - `textColor` (Text)

### 2.8 Collection Type: Submission (`submission`)
- Fields
  - `title` (Text, required)
  - `excerpt` (Text, required)
  - `content` (Rich Text, required)
  - `language` (Enumeration: en, bn, both; required)
  - `status` (Enumeration: submitted, under_review, approved, rejected, published; default submitted)
  - `reviewNotes` (Text)
  - `submittedAt` (DateTime)
  - `reviewedAt` (DateTime)
  - `featuredImage` (Media, Single)
- Relations
  - `author` (Many-to-One → Author, required)
  - `category` (Many-to-One → Category, required)
  - `tags` (Many-to-Many → Tag)
  - `publishedArticle` (One-to-One → Article)

### 2.9 Collection Type: Comment (`comment`)
- Fields
  - `content` (Text, required)
  - `authorName` (Text, required)
  - `authorEmail` (Email, required)
  - `isApproved` (Boolean, default false)
- Relations
  - `article` (Many-to-One → Article, required)
  - `parentComment` (Many-to-One → Comment)
  - `replies` (One-to-Many → Comment)

### 2.10 Collection Type: Page (`page`)
- Purpose: CMS‑controlled standard/static pages (About, Pitching Guidelines, Contact, etc.). Route-specific unique pages are Single Types below.
- Fields
  - `title` (Text, required)
  - `slug` (UID, required, target: title) — e.g., `about`, `pitching-guidelines`, `contact`
  - `language` (Enumeration: en, bn; required)
  - `featuredImage` (Media, Single)
  - `seo` (Component: `shared.seo`)
  - `showInSitemap` (Boolean, default true)
  - `canonicalUrl` (Text)
  - `redirectTo` (Text) — optional URL
  - `httpStatus` (Enumeration: 301, 302)
  - `contentSections` (Dynamic Zone) — allow components: all `blocks.*` listed above
- Draft & Publish: Enabled

### 2.11 Single Type: Home Page (`home-page`)
- Purpose: Manage homepage content as one entry
- Fields
  - `seo` (Component: `shared.seo`)
  - `contentSections` (Dynamic Zone) — allow typical homepage blocks: `heroSection`, `featuredArticlesSection`, `editorsChoiceSection`, `richTextSection`, `bannerSection`, `mediaGallerySection`, `callToActionSection`, etc.

### 2.12 Single Type: Browse Page (`browse-page`)
- Purpose: Manage browse route intro, tabs and defaults
- Fields
  - `seo` (Component: `shared.seo`)
  - `defaultCategory` (Relation: Category, optional)
  - `defaultSort` (Text, default `publishedAt:desc`)
  - `defaultLanguage` (Enumeration: en, bn, both; optional)
  - `contentSections` (Dynamic Zone) — allow `richTextSection`, `categoryTabsSection`, `bannerSection`, etc.

### 2.13 Single Type: Submit Page (`submit-page`)
- Purpose: Control copy and open/closed state of submission page
- Fields
  - `seo` (Component: `shared.seo`)
  - `isOpen` (Boolean, default true)
  - `closedMessage` (Text)
  - `successMessage` (Text)
  - `contentSections` (Dynamic Zone) — allow `richTextSection`, `callToActionSection`, `bannerSection`

### 2.14 Single Type: Article Template (`article-template`)
- Purpose: Global toggles/slots for article detail pages
- Fields
  - `showReadingProgressBar` (Boolean, default true)
  - `showFloatingShareBar` (Boolean, default true)
  - `showRelatedArticles` (Boolean, default true)
  - `relatedArticlesLimit` (Number, default 3)
  - `showComments` (Boolean, default true)
  - `sidebarSections` (Dynamic Zone) — optional; allow `shareButtons` (represented via `richTextSection` or future dedicated block), `richTextSection`, `bannerSection`, `mediaGallerySection`
  - `seo` (Component: `shared.seo`) — optional overrides (rarely needed)

---

## 3) Permissions (Settings → Users & Permissions Plugin → Roles → Public)
Enable read for these:
- Article: find, findOne
- Author: find, findOne (filter by `isActive=true` when querying)
- Category: find, findOne (filter by `isActive=true` when querying)
- Tag: find, findOne
- Site Config: find
- Navigation Item: find
- Banner: find
- Page: find, findOne
- Comment: find (only approved comments should be rendered)

For authenticated users (if you allow submissions):
- Submission: create, find (own), update (own limited)
- Comment: create

---

## 4) API Token
- Settings → API Tokens → Create new `Read-only` token.
- Scope: Read for above types.
- Use it as `NEXT_PUBLIC_STRAPI_API_TOKEN` in your frontend.

---

## 5) Initial Content to Create
1. Site Config (Single Type)
   - Fill site name/description/siteUrl, upload logos and default meta image, add social links.
2. Categories
   - Add your working set (e.g., সিনেমালাপ, আলাপ-সালাপ, Reviews, Features…) with `isActive=true` and `sortOrder`.
3. Tags
   - Add a few tags (e.g., film-review, colonialism, interviews).
4. Authors
   - Create at least one active Author with avatar.
5. One Hero Article
   - Create a published Article with `InSlider=true`, `isFeatured=true` (optional), `category`, `author`, image, and `language`.
6. Navigation Items
   - Add items like Home (`/`), Browse (`/browse`), Submit (`/submit`), About (`/about`).
7. Banner (optional)
   - Create an active banner with date window.
8. Single Types (Pages)
   - Home Page: add blocks `heroSection`, `featuredArticlesSection`, `editorsChoiceSection`, etc.
   - Browse Page: set defaults and add `richTextSection` intro + `categoryTabsSection`.
   - Submit Page: set `isOpen`/messages and add instructions via `richTextSection`.
9. Pages (Collection)
   - About / Pitching Guidelines — use `richTextSection`, `callToActionSection`, etc.

---

## 6) Query patterns (REST examples)
Use `populate` to expand relations and media.

- Articles (featured, published)
```
GET /api/articles?filters[isFeatured][$eq]=true&filters[status][$eq]=published&sort=publishedAt:desc&pagination[pageSize]=4&populate=featuredImage&populate=author&populate=author.avatar&populate=category&populate=tags
```

- Article by slug
```
GET /api/articles?filters[slug][$eq]=your-slug&populate=featuredImage&populate=gallery&populate=socialImage&populate=author&populate=author.avatar&populate=category&populate=tags
```

- Hero article
```
GET /api/articles?filters[InSlider][$eq]=true&filters[status][$eq]=published&populate=featuredImage&populate=author&populate=category
```

- Page by slug (e.g., home)
```
GET /api/pages?filters[slug][$eq]=home&populate=contentSections&populate=contentSections.sectionSettings&populate=contentSections.backgroundImage&populate=contentSections.images&populate=seo&populate=featuredImage
```

- Active banners
```
GET /api/banners?filters[isActive][$eq]=true&filters[startDate][$lte]=<ISO>&filters[endDate][$gte]=<ISO>&sort=priority:desc
```

Note: In Strapi v5, multiple `populate` params are allowed; adjust as your API requires.

---

## 7) Webhooks (optional)
Settings → Webhooks → Add
- Name: Frontend Revalidate
- URL: your-frontend-domain.com/api/revalidate
- Events: entry.create, entry.update, entry.delete

---

## 8) Editorial workflow tips
- Create one Page per route you want to control via CMS (e.g., `home`, `browse`, `about`, `pitching-guidelines`).
- Use rule-based blocks (Featured/Editors Choice) for dynamic feeds, or manual for curated picks.
- For bilingual needs, create separate entries per language (`language = en` or `bn`) and route accordingly from the frontend.
- Keep SEO fields filled on Articles, Pages, and Site Config.

---

## 9) Frontend mapping (what the app expects)
- Articles/Authors/Categories/Tags: power listing, detail, and metadata.
- Banners: feed the floating banner, filtered by date and `isActive`.
- Navigation Items: header/footer menus.
- Site Config: global SEO and branding.
- Pages: modular sections for Home/Browse intro/static pages. The frontend should fetch `Page` by slug (e.g., `home`) and render each block type using a component map.

You now have a single‑language, editor‑friendly CMS that cleanly powers the DUFS Blog frontend with modular pages and fully managed content.

 