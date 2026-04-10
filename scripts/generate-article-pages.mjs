#!/usr/bin/env node

/**
 * Generate static SEO pages for search engine bots ONLY
 * 
 * IMPORTANT: These pages are NOT served to human users!
 * 
 * Purpose:
 * - Search engine bots (Google, Bing, etc.) need pre-rendered HTML for indexing
 * - Human users ALWAYS fetch fresh content client-side from Strapi
 * - This gives us best of both worlds: instant updates + perfect SEO
 * 
 * What this script does:
 * 1. Fetches all published content from Strapi (articles, authors, categories)
 * 2. Generates static HTML for bots:
 *    - Article pages at /articles/<slug>/index.html
 *    - Author pages at /authors/<slug>/index.html
 *    - Category pages at /browse/<slug>/{en,bn}/index.html (language-specific)
 * 3. Each page has full meta tags (OG, Twitter, JSON-LD) for proper indexing
 * 4. Breadcrumb schema for better SERP hierarchy
 * 5. Creates sitemap.xml with all article, author, and category URLs
 * 6. Creates robots.txt pointing to sitemap
 * 
 * When it runs:
 * - Automatically after every build (via postbuild npm script)
 * - In GitHub Actions CI/CD pipeline
 * - When Strapi webhook triggers rebuild
 * 
 * Environment variables required:
 * - STRAPI_URL: Strapi backend URL (e.g., http://localhost:1337 or https://cms.yourdomain.com)
 * - STRAPI_TOKEN: Strapi API token (read-only access)
 * - SITE_URL: Frontend site URL (e.g., https://yourdomain.com)
 * 
 * Language Support:
 * - Articles: Language-specific (either English OR Bengali, not bilingual)
 * - Categories: Bilingual (separate pages for English and Bengali)
 * - Authors: English only (profile pages)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.log('⚠️  Skipping article SEO pages generation (no Strapi credentials)')
  console.log('   Set STRAPI_URL and STRAPI_TOKEN environment variables to generate SEO pages')
  console.log('   This is normal for local development - SEO pages are generated in CI/CD')
  process.exit(0)
}

console.log('🚀 Starting article SEO pages generation...')
console.log(`   Strapi: ${STRAPI_URL}`)
console.log(`   Site: ${SITE_URL}`)

/**
 * Resolve URL (handle both absolute and relative URLs from Strapi)
 */
function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${STRAPI_URL.replace(/\/$/, '')}${url}`
}

/**
 * Fetch all published articles from Strapi with pagination
 */
async function fetchAllArticles() {
  const pageSize = 100
  let page = 1
  const items = []

  for (;;) {
    const url = new URL(`${STRAPI_URL}/api/articles`)
    url.searchParams.set('filters[storyState][$eq]', 'published')
    url.searchParams.set('fields[0]', 'slug')
    url.searchParams.set('fields[1]', 'title')
    url.searchParams.set('fields[2]', 'content')
    url.searchParams.set('fields[3]', 'publishedAt')
    url.searchParams.set('fields[4]', 'BlogDate')
    url.searchParams.set('fields[5]', 'updatedAt')
    url.searchParams.set('fields[6]', 'language')
    url.searchParams.set('populate[0]', 'author')
    url.searchParams.set('populate[1]', 'featuredImage')
    url.searchParams.set('populate[2]', 'category')
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('pagination[pageSize]', String(pageSize))

    console.log(`   Fetching articles page ${page}...`)

    const res = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Strapi API error: ${res.status} ${txt}`)
    }

    const json = await res.json()
    const data = json?.data || []
    items.push(...data)

    const meta = json?.meta?.pagination
    if (!meta || page >= meta.pageCount) break
    page++
  }

  return items
}

/**
 * Fetch all authors from Strapi
 */
async function fetchAllAuthors() {
  const pageSize = 100
  let page = 1
  const items = []

  for (;;) {
    const url = new URL(`${STRAPI_URL}/api/authors`)
    url.searchParams.set('fields[0]', 'Name')
    url.searchParams.set('fields[1]', 'slug')
    url.searchParams.set('fields[2]', 'Bio')
    url.searchParams.set('fields[3]', 'createdAt')
    url.searchParams.set('fields[4]', 'updatedAt')
    url.searchParams.set('populate[0]', 'users_permissions_user.Avatar')
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('pagination[pageSize]', String(pageSize))

    console.log(`   Fetching authors page ${page}...`)

    const res = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Strapi API error: ${res.status} ${txt}`)
    }

    const json = await res.json()
    const data = json?.data || []
    items.push(...data)

    const meta = json?.meta?.pagination
    if (!meta || page >= meta.pageCount) break
    page++
  }

  return items
}

/**
 * Fetch all categories from Strapi
 */
async function fetchAllCategories() {
  const pageSize = 100
  let page = 1
  const items = []

  for (;;) {
    const url = new URL(`${STRAPI_URL}/api/categories`)
    url.searchParams.set('fields[0]', 'Name')
    url.searchParams.set('fields[1]', 'nameEn')
    url.searchParams.set('fields[2]', 'nameBn')
    url.searchParams.set('fields[3]', 'Slug')
    url.searchParams.set('fields[4]', 'createdAt')
    url.searchParams.set('fields[5]', 'updatedAt')
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('pagination[pageSize]', String(pageSize))

    console.log(`   Fetching categories page ${page}...`)

    const res = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Strapi API error: ${res.status} ${txt}`)
    }

    const json = await res.json()
    const data = json?.data || []
    items.push(...data)

    const meta = json?.meta?.pagination
    if (!meta || page >= meta.pageCount) break
    page++
  }

  return items
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Get publish date with BlogDate as priority
 */
function getPublishDate(article) {
  return article.BlogDate || article.publishedAt
}

/**
 * Generate SEO-optimized HTML for search engine bots
 * 
 * NOTE: This page is ONLY for bots - human users never see this!
 * - Bots get this static page with full meta tags for indexing
 * - Humans get the client-side app that fetches from Strapi
 */
function generateSeoHtml(article) {
  const slug = article.slug
  const title = article.title || 'Untitled Article'
  // Generate description from first 160 chars of content or use empty string
  const description = article.content 
    ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) 
    : ''
  const authorName = article.author?.Name || 'DUFS'
  const categoryName = article.category?.Name || article.category?.nameEn || 'Article'
  const imageUrl = article.featuredImage?.url ? resolveUrl(article.featuredImage.url) : ''
  const articleUrl = `${SITE_URL.replace(/\/$/, '')}/articles/${slug}`
  const language = article.language || 'en'
  const publishDate = getPublishDate(article)

  // Breadcrumb schema for better SERP appearance
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Browse',
        item: `${SITE_URL}/browse`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/browse?category=${article.category?.Slug || ''}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: title,
        item: articleUrl
      }
    ]
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl ? [{
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630
    }] : undefined,
    datePublished: publishDate,
    dateModified: article.updatedAt,
    inLanguage: language === 'bn' ? 'bn' : 'en',
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${SITE_URL}/authors/${article.author?.slug || ''}`
    },
    articleSection: categoryName,
    publisher: {
      '@type': 'Organization',
      name: 'DUFS',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    }
  }

  return `<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="language" content="${language === 'bn' ? 'Bengali' : 'English'}">
  <link rel="canonical" href="${articleUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : ''}
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:site_name" content="DUFS">
  <meta property="article:published_time" content="${publishDate}">
  <meta property="article:modified_time" content="${article.updatedAt}">
  <meta property="article:author" content="${escapeHtml(authorName)}">
  <meta property="article:section" content="${escapeHtml(categoryName)}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}">` : ''}
  
  <!-- JSON-LD Structured Data for Search Engines -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  
  <!-- This page is for SEO bots only - humans are redirected via .htaccess -->
  <meta name="robots" content="index, follow">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f9fafb;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 20px;
    }
    .article {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    .meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 24px;
    }
    .excerpt {
      font-size: 1.1rem;
      color: #555;
      margin-bottom: 32px;
    }
    .bot-notice {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      font-size: 0.9rem;
      color: #92400e;
    }
  </style>
</head>
<body>
  <!-- Static content for search engine indexing -->
  <div class="container">
    <article class="article">
      <span class="meta">${escapeHtml(categoryName)}</span>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        By ${escapeHtml(authorName)} • ${new Date(publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div class="excerpt">${escapeHtml(description)}</div>
      
      <!-- Bot notice (only visible to crawlers) -->
      <div class="bot-notice">
        <strong>Note for crawlers:</strong> This is a static snapshot for indexing purposes. 
        The full article content is loaded dynamically on the client side.
      </div>
    </article>
  </div>
  
  <!-- Human users should never see this - they get the client-side app via .htaccess rewrite -->
</body>
</html>`
}

/**
 * Generate author archive page SEO HTML
 */
function generateAuthorSeoHtml(author) {
  const slug = author.slug
  const name = author.Name || 'Unknown Author'
  const bio = author.Bio || `Articles by ${name}`
  const authorUrl = `${SITE_URL.replace(/\/$/, '')}/authors/${slug}`
  const avatarUrl = author.users_permissions_user?.Avatar?.url 
    ? resolveUrl(author.users_permissions_user.Avatar.url)
    : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    description: bio,
    url: authorUrl,
    ...(avatarUrl && { image: avatarUrl })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: name,
        item: authorUrl
      }
    ]
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Articles by ${escapeHtml(name)} | DUFS</title>
  <meta name="description" content="${escapeHtml(bio)}">
  <link rel="canonical" href="${authorUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escapeHtml(name)} | DUFS Blog">
  <meta property="og:description" content="${escapeHtml(bio)}">
  ${avatarUrl ? `<meta property="og:image" content="${avatarUrl}">
  <meta property="og:image:width" content="200">
  <meta property="og:image:height" content="200">` : ''}
  <meta property="og:url" content="${authorUrl}">
  <meta property="og:site_name" content="DUFS">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${avatarUrl ? 'summary' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(name)} | DUFS Blog">
  <meta name="twitter:description" content="${escapeHtml(bio)}">
  ${avatarUrl ? `<meta name="twitter:image" content="${avatarUrl}">` : ''}
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  
  <meta name="robots" content="index, follow">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f9fafb;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 20px;
    }
    .author {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    .bio {
      font-size: 1.1rem;
      color: #555;
      margin-bottom: 24px;
    }
    .bot-notice {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      font-size: 0.9rem;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <article class="author">
      <h1>${escapeHtml(name)}</h1>
      <div class="bio">${escapeHtml(bio)}</div>
      
      <div class="bot-notice">
        <strong>Note for crawlers:</strong> This is a static author profile snapshot. 
        Full article listings are loaded dynamically on the client side.
      </div>
    </article>
  </div>
</body>
</html>`
}

/**
 * Generate category archive page SEO HTML (language-specific)
 */
function generateCategorySeoHtml(category, language = 'en') {
  const slug = category.Slug
  const name = language === 'bn' ? (category.nameBn || category.Name) : (category.nameEn || category.Name)
  const categoryUrl = `${SITE_URL.replace(/\/$/, '')}/browse?category=${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: `${name} articles on DUFS Blog`,
    url: categoryUrl,
    inLanguage: language === 'bn' ? 'bn' : 'en'
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Browse',
        item: `${SITE_URL}/browse`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: name,
        item: categoryUrl
      }
    ]
  }

  return `<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)} Articles | DUFS Blog</title>
  <meta name="description" content="Browse ${escapeHtml(name)} articles on DUFS Blog. Read latest stories in ${escapeHtml(name)}.">
  <meta name="language" content="${language === 'bn' ? 'Bengali' : 'English'}">
  <link rel="canonical" href="${categoryUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(name)} Articles | DUFS Blog">
  <meta property="og:description" content="Browse ${escapeHtml(name)} articles on DUFS Blog.">
  <meta property="og:url" content="${categoryUrl}">
  <meta property="og:site_name" content="DUFS">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(name)} Articles | DUFS Blog">
  <meta name="twitter:description" content="Browse ${escapeHtml(name)} articles on DUFS Blog.">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  
  <meta name="robots" content="index, follow">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f9fafb;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 20px;
    }
    .category {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    .description {
      font-size: 1.1rem;
      color: #555;
      margin-bottom: 24px;
    }
    .bot-notice {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      font-size: 0.9rem;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <article class="category">
      <h1>${escapeHtml(name)}</h1>
      <div class="description">Browse all ${escapeHtml(name)} articles on DUFS Blog.</div>
      
      <div class="bot-notice">
        <strong>Note for crawlers:</strong> This is a static category page snapshot. 
        Full article listings are loaded dynamically on the client side.
      </div>
    </article>
  </div>
</body>
</html>`
}

function generateSitemap(articles, authors, categories) {
  const now = new Date().toISOString()

  const articleUrls = articles
    .filter(a => a.slug)
    .map(a => ({
      loc: `${SITE_URL.replace(/\/$/, '')}/articles/${a.slug}`,
      lastmod: a.updatedAt || (a.BlogDate || a.publishedAt) || now,
      changefreq: 'weekly',
      priority: '0.8'
    }))

  const authorUrls = authors
    .filter(a => a.slug)
    .map(a => ({
      loc: `${SITE_URL.replace(/\/$/, '')}/authors/${a.slug}`,
      lastmod: a.updatedAt || now,
      changefreq: 'weekly',
      priority: '0.7'
    }))

  const categoryUrls = categories
    .filter(c => c.Slug)
    .flatMap(c => [
      {
        loc: `${SITE_URL.replace(/\/$/, '')}/browse?category=${c.Slug}`,
        lastmod: c.updatedAt || now,
        changefreq: 'daily',
        priority: '0.9'
      }
    ])

  // Add static pages
  const staticPages = [
    { loc: SITE_URL, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/browse`, lastmod: now, changefreq: 'daily', priority: '0.9' }
  ]

  const allUrls = [...staticPages, ...articleUrls, ...authorUrls, ...categoryUrls]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  return `# DUFS Blog - Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL.replace(/\/$/, '')}/sitemap.xml

# Disallow admin and private paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
`
}

/**
 * Main execution
 */
async function main() {
  try {
    const outDir = path.resolve(__dirname, '..', 'out')
    
    if (!fs.existsSync(outDir)) {
      console.error('❌ Output directory "out" not found. Run "npm run build" first.')
      process.exit(1)
    }

    console.log('📡 Fetching content from Strapi...')
    const [articles, authors, categories] = await Promise.all([
      fetchAllArticles(),
      fetchAllAuthors(),
      fetchAllCategories()
    ])
    console.log(`✅ Found ${articles.length} articles, ${authors.length} authors, ${categories.length} categories`)

    if (articles.length === 0) {
      console.warn('⚠️  No published articles found. Skipping article page generation.')
    } else {
      console.log('📝 Generating article SEO pages...')
      let generated = 0
      for (const article of articles) {
        if (!article.slug) {
          console.warn(`⚠️  Skipping article without slug: ${article.title || 'Untitled'}`)
          continue
        }

        const articleDir = path.join(outDir, 'articles', article.slug)
        fs.mkdirSync(articleDir, { recursive: true })
        
        const htmlContent = generateSeoHtml(article)
        fs.writeFileSync(path.join(articleDir, 'index.html'), htmlContent, 'utf8')
        
        generated++
        if (generated % 10 === 0) {
          console.log(`   Generated ${generated}/${articles.length} article pages...`)
        }
      }
      console.log(`✅ Generated ${generated} article SEO pages`)
    }

    if (authors.length > 0) {
      console.log('👤 Generating author archive pages...')
      let generated = 0
      for (const author of authors) {
        if (!author.slug) {
          console.warn(`⚠️  Skipping author without slug: ${author.Name || 'Unknown'}`)
          continue
        }

        const authorDir = path.join(outDir, 'authors', author.slug)
        fs.mkdirSync(authorDir, { recursive: true })
        
        const htmlContent = generateAuthorSeoHtml(author)
        fs.writeFileSync(path.join(authorDir, 'index.html'), htmlContent, 'utf8')
        
        generated++
      }
      console.log(`✅ Generated ${generated} author pages`)
    }

    if (categories.length > 0) {
      console.log('📂 Generating category archive pages...')
      let generated = 0
      for (const category of categories) {
        if (!category.Slug) {
          console.warn(`⚠️  Skipping category without slug: ${category.Name || 'Unknown'}`)
          continue
        }

        // Generate English version
        const categoryDirEn = path.join(outDir, 'browse', category.Slug, 'en')
        fs.mkdirSync(categoryDirEn, { recursive: true })
        const htmlContentEn = generateCategorySeoHtml(category, 'en')
        fs.writeFileSync(path.join(categoryDirEn, 'index.html'), htmlContentEn, 'utf8')

        // Generate Bengali version (if nameBn exists)
        if (category.nameBn) {
          const categoryDirBn = path.join(outDir, 'browse', category.Slug, 'bn')
          fs.mkdirSync(categoryDirBn, { recursive: true })
          const htmlContentBn = generateCategorySeoHtml(category, 'bn')
          fs.writeFileSync(path.join(categoryDirBn, 'index.html'), htmlContentBn, 'utf8')
          generated += 2
        } else {
          generated += 1
        }
      }
      console.log(`✅ Generated ${generated} category pages`)
    }

    console.log('🗺️  Generating sitemap.xml...')
    const sitemap = generateSitemap(articles, authors, categories)
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8')
    console.log('✅ Sitemap generated')

    console.log('🤖 Generating robots.txt...')
    const robotsTxt = generateRobotsTxt()
    fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt, 'utf8')
    console.log('✅ Robots.txt generated')

    const totalPages = (articles.length || 0) + (authors.length || 0) + 
                       (categories.length * (categories.some(c => c.nameBn) ? 2 : 1)) + 2
    console.log(`\n🎉 All done! Generated ${totalPages} total pages.`)
    console.log(`   📄 ${articles.length} article pages`)
    console.log(`   👤 ${authors.length} author pages`)
    console.log(`   📂 ${categories.length} category pages (with language variants)`)
    console.log(`   📍 Sitemap + Robots.txt included`)
  } catch (error) {
    console.error('❌ Error generating pages:', error)
    process.exit(1)
  }
}

main()
