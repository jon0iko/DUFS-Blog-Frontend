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
 * 1. Fetches all published articles from Strapi
 * 2. Generates static HTML at /articles/<slug>/index.html (for bots only)
 * 3. Each page has full meta tags (OG, Twitter, JSON-LD) but minimal content
 * 4. Creates sitemap.xml for search engines to discover articles
 * 5. Creates robots.txt pointing to sitemap
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
    url.searchParams.set('fields[2]', 'excerpt')
    url.searchParams.set('fields[3]', 'publishedAt')
    url.searchParams.set('fields[4]', 'updatedAt')
    url.searchParams.set('populate[0]', 'author')
    url.searchParams.set('populate[1]', 'featuredImage')
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('pagination[pageSize]', String(pageSize))

    console.log(`   Fetching page ${page}...`)

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
 * Generate SEO-optimized HTML for search engine bots
 * 
 * NOTE: This page is ONLY for bots - human users never see this!
 * - Bots get this static page with full meta tags for indexing
 * - Humans get the client-side app that fetches from Strapi
 */
function generateSeoHtml(article) {
  const slug = article.slug
  const title = article.title || 'Untitled Article'
  const description = article.excerpt || ''
  const authorName = article.author?.Name || 'DUFS'
  const imageUrl = article.featuredImage?.url ? resolveUrl(article.featuredImage.url) : ''
  const articleUrl = `${SITE_URL.replace(/\/$/, '')}/articles/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: authorName
    },
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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${articleUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta property="og:image" content="${imageUrl}">` : ''}
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:site_name" content="DUFS">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}">` : ''}
  
  <!-- JSON-LD Structured Data for Search Engines -->
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
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        By ${escapeHtml(authorName)} • ${new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
 * Generate sitemap.xml with all article URLs
 */
function generateSitemap(articles) {
  const urls = articles
    .filter(a => a.slug)
    .map(a => ({
      loc: `${SITE_URL.replace(/\/$/, '')}/articles/${a.slug}`,
      lastmod: a.updatedAt || a.publishedAt || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    }))

  // Add homepage and other static pages
  const staticPages = [
    { loc: SITE_URL, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/browse`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.9' }
  ]

  const allUrls = [...staticPages, ...urls]

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

    console.log('📡 Fetching articles from Strapi...')
    const articles = await fetchAllArticles()
    console.log(`✅ Found ${articles.length} published articles`)

    if (articles.length === 0) {
      console.warn('⚠️  No published articles found. Skipping page generation.')
      return
    }

    console.log('📝 Generating SEO pages...')
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
        console.log(`   Generated ${generated}/${articles.length} pages...`)
      }
    }
    console.log(`✅ Generated ${generated} SEO pages`)

    console.log('🗺️  Generating sitemap.xml...')
    const sitemap = generateSitemap(articles)
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8')
    console.log('✅ Sitemap generated')

    console.log('🤖 Generating robots.txt...')
    const robotsTxt = generateRobotsTxt()
    fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt, 'utf8')
    console.log('✅ Robots.txt generated')

    console.log('\n🎉 All done! SEO pages, sitemap, and robots.txt are ready in the "out" directory.')
  } catch (error) {
    console.error('❌ Error generating article pages:', error)
    process.exit(1)
  }
}

main()
