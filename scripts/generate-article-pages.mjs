#!/usr/bin/env node

// Generate static SEO pages for search engine bots
// Requires: STRAPI_URL, STRAPI_TOKEN, SITE_URL environment variables
//
// These snapshots must carry the FULL article content — Google only indexes
// what it sees here. Thin pages (title + excerpt) do not rank at all.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

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
    url.searchParams.set('filters[publishedAt][$notNull]', 'true')
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
    url.searchParams.set('populate[3]', 'tags')
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
 * Strip markdown/HTML down to plain text (for meta descriptions and word counts)
 */
function toPlainText(input) {
  if (!input) return ''
  let s = String(input)
  s = s.replace(/<[^>]*>/g, '')
  s = s.replace(/```[\s\S]*?```/g, '')
  s = s.replace(/`([^`]+)`/g, '$1')
  s = s.replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
  s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
  s = s.replace(/^#{1,6}\s*/gm, '')
  s = s.replace(/\*\*(.*?)\*\*/g, '$1')
  s = s.replace(/\*(.*?)\*/g, '$1')
  s = s.replace(/__([^_]+)__/g, '$1')
  s = s.replace(/_([^_]+)_/g, '$1')
  s = s.replace(/~~([^~]+)~~/g, '$1')
  s = s.replace(/^>\s?/gm, '')
  s = s.replace(/^[\-\*\+]\s+/gm, '')
  s = s.replace(/[\r\n]+/g, ' ')
  s = s.replace(/\s{2,}/g, ' ')
  return s.trim()
}

/**
 * Meta description: plain text, cut at a word boundary near 158 chars.
 * (Sanitize FIRST, then truncate — truncating raw markdown mangles the text.)
 */
function buildDescription(content) {
  const text = toPlainText(content)
  if (text.length <= 158) return text
  const cut = text.slice(0, 158)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

/**
 * Render the article's markdown content to HTML with the same marked
 * pipeline the client app uses, so bots index the exact content humans read.
 *
 * Sanitization: content is authored by our own Strapi editors and the page
 * is a static snapshot, but strip active content anyway (scripts, embeds,
 * inline event handlers, javascript: URLs) as defense in depth.
 */
function renderContentHtml(markdown) {
  if (!markdown) return ''
  let html = marked.parse(String(markdown), { gfm: true, breaks: false, async: false })
  html = html.replace(/<(script|style|iframe|object|embed|form|link|meta)\b[\s\S]*?(<\/\1>|\/?>)/gi, '')
  html = html.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  html = html.replace(/\s(href|src)\s*=\s*(["']?)\s*javascript:[^"'\s>]*\2/gi, '')
  return html
}

/**
 * Normalize tags to an array of names (Strapi returns objects, not strings)
 */
function getTagNames(article) {
  if (!Array.isArray(article.tags)) return []
  return article.tags.map(t => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
}

const BENGALI_RE = /[ঀ-৿]/

function detectLanguage(article) {
  if (article.language === 'bn') return 'bn'
  if (article.language === 'en') return 'en'
  return BENGALI_RE.test(article.title || '') ? 'bn' : 'en'
}

/** Shared minimal styling for all snapshot pages */
const SNAPSHOT_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Bengali", sans-serif;
      line-height: 1.7;
      color: #333;
      background: #f9fafb;
    }
    .site-header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 14px 20px; }
    .site-header nav { max-width: 800px; margin: 0 auto; display: flex; gap: 20px; align-items: center; }
    .site-header a { color: #111; text-decoration: none; font-weight: 600; }
    .site-header a:hover { text-decoration: underline; }
    .container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
    .card { background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 2.2rem; margin-bottom: 16px; line-height: 1.25; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 24px; }
    .meta a { color: #444; }
    .featured { width: 100%; height: auto; border-radius: 8px; margin-bottom: 28px; }
    .content { font-size: 1.05rem; color: #222; }
    .content p, .content ul, .content ol, .content blockquote, .content pre, .content figure, .content table { margin-bottom: 1.1em; }
    .content h1, .content h2, .content h3, .content h4 { margin: 1.4em 0 0.6em; line-height: 1.3; }
    .content img { max-width: 100%; height: auto; border-radius: 6px; }
    .content blockquote { border-left: 3px solid #d1d5db; padding-left: 16px; color: #555; }
    .content a { color: #1d4ed8; }
    .tags { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9rem; }
    .tags a { color: #444; margin-right: 10px; }
    .article-list { list-style: none; margin-top: 24px; }
    .article-list li { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .article-list a { color: #111; text-decoration: none; font-weight: 600; font-size: 1.1rem; }
    .article-list a:hover { text-decoration: underline; }
    .article-list .date { display: block; color: #888; font-size: 0.85rem; margin-top: 2px; }
    .site-footer { max-width: 800px; margin: 40px auto 60px; padding: 0 20px; color: #888; font-size: 0.9rem; }
    .site-footer a { color: #555; }
`

function siteHeader() {
  return `<header class="site-header">
    <nav>
      <a href="${SITE_URL}/">DUFS Blog</a>
      <a href="${SITE_URL}/browse">Browse Articles</a>
    </nav>
  </header>`
}

function siteFooter() {
  return `<footer class="site-footer">
    <p><a href="${SITE_URL}/">DUFS Blog</a> — Film publication of the Dhaka University Film Society.</p>
  </footer>`
}

/**
 * Generate SEO-optimized HTML for search engine bots.
 *
 * Contains the FULL article content so search engines index the same text
 * humans read (Google's dynamic-rendering guidance requires equivalence).
 */
function generateSeoHtml(article) {
  const slug = article.slug
  const title = article.title || 'Untitled Article'
  const description = buildDescription(article.content)
  const contentHtml = renderContentHtml(article.content)
  const plainText = toPlainText(article.content)
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const authorName = article.author?.Name || 'DUFS'
  const authorSlug = article.author?.slug || ''
  const categoryName = article.category?.Name || article.category?.nameEn || 'Article'
  const categorySlug = article.category?.Slug || ''
  const imageUrl = article.featuredImage?.url ? resolveUrl(article.featuredImage.url) : ''
  const imageAlt = article.featuredImage?.alternativeText || title
  const articleUrl = `${SITE_URL}/articles/${slug}`
  const language = detectLanguage(article)
  const publishDate = getPublishDate(article)
  const tagNames = getTagNames(article)
  const keywords = tagNames.join(', ')

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
        item: `${SITE_URL}/browse?category=${categorySlug}`
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
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    url: articleUrl,
    image: imageUrl ? [{
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630
    }] : undefined,
    datePublished: publishDate,
    dateModified: article.updatedAt,
    inLanguage: language,
    wordCount: wordCount || undefined,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorSlug && { url: `${SITE_URL}/authors/${authorSlug}` })
    },
    articleSection: categoryName,
    keywords: keywords || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Dhaka University Film Society',
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

  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | DUFS Blog</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}
  <link rel="canonical" href="${articleUrl}">
  <meta name="robots" content="index, follow, max-image-preview:large">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">` : ''}
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:site_name" content="DUFS Blog">
  <meta property="og:locale" content="${language === 'bn' ? 'bn_BD' : 'en_US'}">
  <meta property="article:published_time" content="${publishDate}">
  <meta property="article:modified_time" content="${article.updatedAt}">
  <meta property="article:author" content="${escapeHtml(authorName)}">
  <meta property="article:section" content="${escapeHtml(categoryName)}">
  ${tagNames.map(t => `<meta property="article:tag" content="${escapeHtml(t)}">`).join('\n  ')}

  <!-- Twitter -->
  <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}">` : ''}

  <!-- JSON-LD Structured Data for Search Engines -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <style>${SNAPSHOT_CSS}</style>
</head>
<body>
  ${siteHeader()}
  <div class="container">
    <main>
      <article class="card">
        ${categorySlug ? `<span class="meta"><a href="${SITE_URL}/browse?category=${categorySlug}">${escapeHtml(categoryName)}</a></span>` : `<span class="meta">${escapeHtml(categoryName)}</span>`}
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">
          By ${authorSlug ? `<a href="${SITE_URL}/authors/${authorSlug}">${escapeHtml(authorName)}</a>` : escapeHtml(authorName)}${formattedDate ? ` • <time datetime="${escapeHtml(String(publishDate))}">${formattedDate}</time>` : ''}
        </div>
        ${imageUrl ? `<img class="featured" src="${imageUrl}" alt="${escapeHtml(imageAlt)}">` : ''}
        <div class="content">
${contentHtml}
        </div>
        ${tagNames.length ? `<div class="tags">${tagNames.map(t => `<a href="${SITE_URL}/browse?search=${encodeURIComponent(t)}&amp;category=all">#${escapeHtml(t)}</a>`).join(' ')}</div>` : ''}
      </article>
    </main>
  </div>
  ${siteFooter()}
</body>
</html>`
}

/**
 * Generate author archive page SEO HTML — includes a linked list of the
 * author's articles so crawlers can discover them and PageRank flows.
 */
function generateAuthorSeoHtml(author, authorArticles = []) {
  const slug = author.slug
  const name = author.Name || 'Unknown Author'
  const bio = author.Bio || `Articles by ${name} on DUFS Blog, the film publication of the Dhaka University Film Society.`
  const authorUrl = `${SITE_URL}/authors/${slug}`
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

  const articleListHtml = authorArticles.length
    ? `<h2>Articles by ${escapeHtml(name)}</h2>
      <ul class="article-list">
        ${authorArticles.map(a => {
          const d = getPublishDate(a)
          const dateStr = d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
          return `<li><a href="${SITE_URL}/articles/${a.slug}">${escapeHtml(a.title || 'Untitled')}</a>${dateStr ? `<span class="date">${dateStr}</span>` : ''}</li>`
        }).join('\n        ')}
      </ul>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Articles by ${escapeHtml(name)} | DUFS Blog</title>
  <meta name="description" content="${escapeHtml(bio)}">
  <link rel="canonical" href="${authorUrl}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escapeHtml(name)} | DUFS Blog">
  <meta property="og:description" content="${escapeHtml(bio)}">
  ${avatarUrl ? `<meta property="og:image" content="${avatarUrl}">
  <meta property="og:image:width" content="200">
  <meta property="og:image:height" content="200">` : ''}
  <meta property="og:url" content="${authorUrl}">
  <meta property="og:site_name" content="DUFS Blog">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(name)} | DUFS Blog">
  <meta name="twitter:description" content="${escapeHtml(bio)}">
  ${avatarUrl ? `<meta name="twitter:image" content="${avatarUrl}">` : ''}

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <style>${SNAPSHOT_CSS}</style>
</head>
<body>
  ${siteHeader()}
  <div class="container">
    <main>
      <article class="card">
        <h1>${escapeHtml(name)}</h1>
        <div class="meta">${escapeHtml(bio)}</div>
        ${articleListHtml}
      </article>
    </main>
  </div>
  ${siteFooter()}
</body>
</html>`
}

/**
 * Generate category archive page SEO HTML (language-specific) — includes a
 * linked list of the category's articles for crawl discovery.
 */
function generateCategorySeoHtml(category, language = 'en', categoryArticles = []) {
  const slug = category.Slug
  const name = language === 'bn' ? (category.nameBn || category.Name) : (category.nameEn || category.Name)
  const categoryUrl = `${SITE_URL}/browse?category=${slug}`

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

  const articleListHtml = categoryArticles.length
    ? `<ul class="article-list">
        ${categoryArticles.map(a => {
          const d = getPublishDate(a)
          const dateStr = d ? new Date(d).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
          const byline = a.author?.Name ? ` — ${escapeHtml(a.author.Name)}` : ''
          return `<li><a href="${SITE_URL}/articles/${a.slug}">${escapeHtml(a.title || 'Untitled')}</a><span class="date">${dateStr}${byline}</span></li>`
        }).join('\n        ')}
      </ul>`
    : `<p class="meta">Browse all ${escapeHtml(name)} articles on DUFS Blog.</p>`

  return `<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)} Articles | DUFS Blog</title>
  <meta name="description" content="Browse ${escapeHtml(name)} articles on DUFS Blog. Read the latest film writing in ${escapeHtml(name)}.">
  <link rel="canonical" href="${categoryUrl}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(name)} Articles | DUFS Blog">
  <meta property="og:description" content="Browse ${escapeHtml(name)} articles on DUFS Blog.">
  <meta property="og:url" content="${categoryUrl}">
  <meta property="og:site_name" content="DUFS Blog">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(name)} Articles | DUFS Blog">
  <meta name="twitter:description" content="Browse ${escapeHtml(name)} articles on DUFS Blog.">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <style>${SNAPSHOT_CSS}</style>
</head>
<body>
  ${siteHeader()}
  <div class="container">
    <main>
      <article class="card">
        <h1>${escapeHtml(name)}</h1>
        ${articleListHtml}
      </article>
    </main>
  </div>
  ${siteFooter()}
</body>
</html>`
}

function generateSitemap(articles, authors, categories) {
  const now = new Date().toISOString()

  const articleUrls = articles
    .filter(a => a.slug)
    .map(a => ({
      loc: `${SITE_URL}/articles/${a.slug}`,
      lastmod: a.updatedAt || (a.BlogDate || a.publishedAt) || now,
      changefreq: 'weekly',
      priority: '0.8'
    }))

  const authorUrls = authors
    .filter(a => a.slug)
    .map(a => ({
      loc: `${SITE_URL}/authors/${a.slug}`,
      lastmod: a.updatedAt || now,
      changefreq: 'weekly',
      priority: '0.7'
    }))

  const categoryUrls = categories
    .filter(c => c.Slug)
    .flatMap(c => [
      {
        loc: `${SITE_URL}/browse?category=${c.Slug}`,
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
    <loc>${u.loc.replace(/&/g, '&amp;')}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

/**
 * Generate robots.txt
 *
 * NOTE: /_next/ must stay crawlable — Google needs the JS/CSS bundles to
 * render the client-side pages. Blocking it makes every SPA page appear
 * blank/broken to the indexer.
 */
function generateRobotsTxt() {
  return `# DUFS Blog - Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Disallow admin and private paths
Disallow: /api/
Disallow: /admin/
Disallow: /account
Disallow: /auth/
Disallow: /editor
Disallow: /submit
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

    // Newest first for archive listings
    const sortedArticles = [...articles].sort((a, b) =>
      new Date(getPublishDate(b) || 0) - new Date(getPublishDate(a) || 0)
    )

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

        const authorArticles = sortedArticles.filter(a => a.slug && a.author?.slug === author.slug)
        const htmlContent = generateAuthorSeoHtml(author, authorArticles)
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

        const categoryArticles = sortedArticles.filter(a => a.slug && a.category?.Slug === category.Slug)

        // Generate English version
        const categoryDirEn = path.join(outDir, 'browse', category.Slug, 'en')
        fs.mkdirSync(categoryDirEn, { recursive: true })
        const htmlContentEn = generateCategorySeoHtml(category, 'en', categoryArticles)
        fs.writeFileSync(path.join(categoryDirEn, 'index.html'), htmlContentEn, 'utf8')

        // Generate Bengali version (if nameBn exists)
        if (category.nameBn) {
          const categoryDirBn = path.join(outDir, 'browse', category.Slug, 'bn')
          fs.mkdirSync(categoryDirBn, { recursive: true })
          const htmlContentBn = generateCategorySeoHtml(category, 'bn', categoryArticles)
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
    console.log(`   📄 ${articles.length} article pages (full content)`)
    console.log(`   👤 ${authors.length} author pages`)
    console.log(`   📂 ${categories.length} category pages (with language variants)`)
    console.log(`   📍 Sitemap + Robots.txt included`)
  } catch (error) {
    console.error('❌ Error generating pages:', error)
    process.exit(1)
  }
}

main()
