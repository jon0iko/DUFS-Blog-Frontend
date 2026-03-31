'use client'

import { Suspense, useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { strapiAPI } from '@/lib/api'
import { config } from '@/lib/config'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFontClass } from '@/lib/fonts'
import { cn, formatDate } from '@/lib/utils'
import ArticleCard from '@/components/home/ArticleCard'
import type { Author, Article } from '@/types'

/**
 * Author page - Client-side rendering
 * 
 * Similar to /read-article, this page fetches author data dynamically.
 * 
 * URL Pattern: /author?slug=author-slug
 * Apache rewrite: /authors/slug → /author?slug=slug
 */

const ARTICLES_PER_PAGE = 12

function AuthorPageInner() {
  const searchParams = useSearchParams()
  const slug = useMemo(() => searchParams.get('slug') || '', [searchParams])
  
  const [author, setAuthor] = useState<Author | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)

  const fetchAuthorAndArticles = useCallback(async (page: number = 1) => {
    if (!slug) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch author by slug
      const fetchedAuthor = await strapiAPI.getAuthorBySlug(slug)
      
      if (!fetchedAuthor) {
        setError('Author not found')
        setIsLoading(false)
        return
      }
      
      setAuthor(fetchedAuthor)
      
      // Fetch author's articles with pagination
      const articlesResponse = await strapiAPI.getAuthorArticles(
        fetchedAuthor.documentId, 
        page, 
        ARTICLES_PER_PAGE
      )
      
      setArticles(articlesResponse.data || [])
      
      // Set pagination info
      const pagination = articlesResponse.meta?.pagination
      if (pagination) {
        setTotalPages(pagination.pageCount || 1)
        setTotalArticles(pagination.total || 0)
      }
      
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching author:', err)
      setError('Failed to load author')
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchAuthorAndArticles(1)
  }, [fetchAuthorAndArticles])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchAuthorAndArticles(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      pages.push(totalPages)
    }
    
    return pages
  }

  if (!slug) {
    return (
      <div className="container py-12">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Author Not Specified</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please open a URL like /authors/author-slug
          </p>
        </div>
      </div>
    )
  }

  if (isLoading && !author) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading author...</p>
        </div>
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="container py-12">
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-700 dark:text-red-400">
            {error || 'Author Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The author you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/browse">
            <Button variant="outline">Browse Articles</Button>
          </Link>
        </div>
      </div>
    )
  }

  const avatarUrl = author.users_permissions_user?.Avatar?.url 
    ? (author.users_permissions_user?.Avatar?.url.startsWith('http') 
        ? author.users_permissions_user?.Avatar?.url 
        : `${config.strapi.url}${author.users_permissions_user?.Avatar?.url}`)
    : '/images/avatarPlaceholder.png'

  const authorNameFont = getFontClass(author.Name || '')
  const authorBioFont = getFontClass(author.Bio || '')

  return (
    <div className="bg-background min-h-screen">
      <div className="container py-10 px-4 sm:px-6">
        {/* Author Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-12">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
            <Image 
              src={avatarUrl} 
              alt={author.Name || 'Author'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className={cn("text-3xl font-bold mb-2", authorNameFont)}>{author.Name}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Writer • Joined {formatDate(author.createdAt)}
            </p>
            {author.Bio && (
              <p className={cn("text-muted-foreground max-w-2xl", authorBioFont)}>{author.Bio}</p>
            )}
            <p className="text-sm text-primary mt-4">
              {totalArticles} {totalArticles === 1 ? 'article' : 'articles'} published
            </p>
        </div>
        </div>

        <Separator className="mb-10 bg-foreground border border-dashed" />
        
        <h2 className="text-2xl mb-8">
          <span>Articles by </span>
          <span className={`${authorNameFont} font-bold`}>{author.Name}</span>
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              This author hasn&apos;t published any articles yet.
            </p>
            <Link href="/browse">
              <Button variant="outline">Browse All Articles</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const dateSource = article.BlogDate || article.publishedAt
                return (
                <ArticleCard
                  key={article.documentId}
                  article={{
                    id: article.documentId,
                    title: article.title || '',
                    slug: article.slug || '',
                    image: article.featuredImage?.url
                      ? `${config.strapi.url}${article.featuredImage.url}`
                      : '/images/hero.jpg',
                    category: article.category?.Name || article.category?.nameEn || '',
                    author: {
                      name: author.Name || 'Unknown',
                      avatar: author.users_permissions_user?.Avatar?.url
                        ? author.users_permissions_user?.Avatar?.url.startsWith('http')
                          ? author.users_permissions_user?.Avatar?.url
                          : `${config.strapi.url}${author.users_permissions_user?.Avatar?.url}`
                        : undefined,
                      slug: author.slug,
                    },
                    publishedAt: formatDate(dateSource),
                    language: 'both' as const,
                  }}
                />
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page as number)}
                        disabled={isLoading}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    )
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthorPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading author...</p>
        </div>
      </div>
    }>
      <AuthorPageInner />
    </Suspense>
  )
}
