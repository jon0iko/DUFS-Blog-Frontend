'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleContentClient from '@/components/articles/ArticleContentClient'

/**
 * Universal article reader page - Client-side rendering ONLY
 * 
 * This page serves ALL articles dynamically by fetching from Strapi on demand.
 * 
 * User Flow:
 * 1. User clicks article card → /articles/slug
 * 2. Apache rewrites to /read-article?slug=slug  
 * 3. This page loads (one static HTML shell)
 * 4. Client-side fetch from Strapi using slug
 * 5. Content renders instantly (no rebuild wait!)
 * 
 * SEO Flow:
 * 1. Bot visits /articles/slug
 * 2. Apache serves pre-rendered /articles/slug/index.html
 * 3. Static page has full meta tags, JSON-LD
 * 4. Bot indexes properly
 * 
 * Key Points:
 * - Users ALWAYS fetch fresh data from Strapi (no static content served)
 * - Zero rebuild needed for new articles
 * - SEO bots get separate pre-rendered pages (generated in CI)
 */

function ReadArticleInner() {
  const searchParams = useSearchParams()
  const slug = useMemo(() => searchParams.get('slug') || '', [searchParams])

  if (!slug) {
    return (
      <div className="container py-12">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Specified</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please open a URL like /articles/my-article-slug
          </p>
        </div>
      </div>
    )
  }

  return <ArticleContentClient slug={slug} />
}

export default function ReadArticlePage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    }>
      <ReadArticleInner />
    </Suspense>
  )
}
