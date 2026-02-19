'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Category, Article } from '@/types'
import { strapiAPI } from '@/lib/api'
import { getArticleData } from '@/lib/strapi-helpers'
import { getFontClass } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import ArticleCard from './ArticleCard'
import FilmEmojiBackground from './FilmEmojiBackground'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ARTICLES_PER_PAGE = 8

type SortOption = 'newest' | 'oldest' | 'most-read'

interface BrowseContentSectionProps {
  initialCategories: Category[]
}

export default function BrowseContentSection({ initialCategories }: BrowseContentSectionProps) {
  const [categories] = useState<Category[]>(initialCategories)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [, setTotalArticles] = useState(0)
  const [spinTrigger, setSpinTrigger] = useState(0)
  
  // Ref for scrolling to articles grid
  const articlesGridRef = useRef<HTMLDivElement>(null)
  // Ref for detecting when section is revealed
  const headerRef = useRef<HTMLDivElement>(null)
  const hasTriggeredRef = useRef(false)

  // Fetch articles based on active filters
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        
        const filters: {
          page?: number
          pageSize?: number
          category?: string
          sort?: string
          storyState?: string
        } = {
          page: currentPage,
          pageSize: ARTICLES_PER_PAGE,
          sort: sortBy === 'newest' ? 'publishedAt:desc' : sortBy === 'oldest' ? 'publishedAt:asc' : 'viewCount:desc',
          storyState: 'published'
        }
        
        if (activeCategory && activeCategory !== 'all') {
          filters.category = activeCategory
        }
        
        const response = await strapiAPI.getArticles(filters)
        const fetchedArticles = response.data || []
        
        // Get pagination info from meta
        const pagination = response.meta?.pagination
        if (pagination) {
          setTotalPages(pagination.pageCount || 1)
          setTotalArticles(pagination.total || 0)
        }
        
        setArticles(fetchedArticles)
      } catch (error) {
        console.error('Failed to fetch articles:', error)
        setArticles([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchArticles()
  }, [activeCategory, sortBy, currentPage])

  // Detect when section is revealed and trigger spin animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            // Delay the spin animation to start after ScrollReveal completes
            setTimeout(() => {
              setSpinTrigger((prev) => prev + 1)
              hasTriggeredRef.current = true
            }, 800)
          } else if (!entry.isIntersecting) {
            // Reset when section leaves viewport so it can trigger again
            hasTriggeredRef.current = false
          }
        })
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
      }
    )

    const currentHeader = headerRef.current
    if (currentHeader) {
      observer.observe(currentHeader)
    }

    return () => {
      if (currentHeader) {
        observer.unobserve(currentHeader)
      }
    }
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, sortBy])

  // Handle page changes - memoized for performance
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll after state update with requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        if (articlesGridRef.current) {
          const yOffset = -120 // Offset for fixed headers and spacing
          const element = articlesGridRef.current
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      })
    }
  }, [totalPages])

  // Generate page numbers to display - memoized for performance
  const getPageNumbers = useCallback((): (number | string)[] => {
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
  }, [currentPage, totalPages])

  // Filter out invalid articles - memoized for performance
  const validArticles = articles
    .map(article => ({ raw: article, data: getArticleData(article) }))
    .filter(item => item.data !== null)

  return (
    <section className="relative -mt-12 md:-mt-16  py-12 md:py-16 bg-background overflow-hidden">
      {/* Film Emoji Background Elements */}
      <FilmEmojiBackground />
      
      {/* Grainy Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-overlay z-20"
        style={{
          backgroundImage: 'url(/images/Group.jpg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px'
        }}
      />
      
      <div className="container relative z-10">
        {/* Header Section */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-foreground">
              In F<svg 
                key={spinTrigger}
                className={cn(
                  "inline-block w-[0.85em] h-[0.6em] -mx-[0.1em]",
                  spinTrigger > 0 && "animate-spin-reveal"
                )}
                viewBox="0 0 131 131" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path 
                  d="M65.5 0C101.675 0 131 29.3253 131 65.5C131 101.675 101.675 131 65.5 131C29.3253 131 0 101.675 0 65.5C0 29.3253 29.3253 0 65.5 0ZM65 83C58.3726 83 53 88.3726 53 95C53 101.627 58.3726 107 65 107C71.6274 107 77 101.627 77 95C77 88.3726 71.6274 83 65 83ZM37 53C30.3726 53 25 58.3726 25 65C25 71.6274 30.3726 77 37 77C43.6274 77 49 71.6274 49 65C49 58.3726 43.6274 53 37 53ZM94 53C87.3726 53 82 58.3726 82 65C82 71.6274 87.3726 77 94 77C100.627 77 106 71.6274 106 65C106 58.3726 100.627 53 94 53ZM65 24C58.3726 24 53 29.3726 53 36C53 42.6274 58.3726 48 65 48C71.6274 48 77 42.6274 77 36C77 29.3726 71.6274 24 65 24Z" 
                  fill="currentColor"
                />
              </svg>cus
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl font-normal">
              Explore our collection of film analysis, reviews, and publications.
            </p>
          </div>
          <Link 
            href="/browse" 
            className="inline-flex items-center gap-2 text-sm font-normal uppercase tracking-widest hover:underline decoration-1 underline-offset-4 transition-all"
          >
            View all
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200",
                  activeCategory === 'all'
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground/50"
                )}
              >
                All
              </button>
              {categories.map((category) => {
                const categoryName = category.Name || ''
                const categorySlug = category.Slug || ''
                const fontClass = getFontClass(categoryName)
                
                return (
                  <button
                    key={category.documentId}
                    onClick={() => setActiveCategory(categorySlug)}
                    className={cn(
                      "px-4 py-2 text-sm md:text-base font-semibold rounded-md border transition-all duration-200",
                      fontClass,
                      activeCategory === categorySlug
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:border-foreground/50"
                    )}
                  >
                    {categoryName}
                  </button>
                )
              })}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base font-normal text-muted-foreground uppercase tracking-wider">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[140px] text-sm md:text-base font-semibold">
                  <SelectValue placeholder="Select sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="most-read">Most Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div ref={articlesGridRef} className="min-h-[400px]">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
              <p className="text-muted-foreground mt-4">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 inline-block">
                <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
                <p className="text-muted-foreground">No articles match your current filters.</p>
                <p className="text-sm text-gray-500 mt-2">Try selecting a different category or sort option.</p>
              </div>
            </div>
          ) : validArticles.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 inline-block">
                <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-200">Invalid Article Data</h3>
                <p className="text-muted-foreground">Articles exist but contain incomplete or corrupted data.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Articles count info */}
              {/* <div className="mb-6 text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ARTICLES_PER_PAGE + 1} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalArticles)} of {totalArticles} articles
              </div> */}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {validArticles.map(({ raw, data }) => (
                  <ArticleCard 
                    key={raw.documentId} 
                    article={data!} 
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-6">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 rounded-md border transition-all duration-200",
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed border-border"
                    : "hover:bg-accent border-border hover:border-foreground/50"
                )}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page as number)}
                      className={cn(
                        "min-w-[40px] h-[40px] rounded-md text-base font-semibold transition-all duration-200",
                        currentPage === page
                          ? "bg-foreground text-background"
                          : "hover:bg-accent border border-border hover:border-foreground/50"
                      )}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 rounded-md border transition-all duration-200",
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed border-border"
                    : "hover:bg-accent border-border hover:border-foreground/50"
                )}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Page info */}
            {/* <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div> */}
          </div>
        )}
      </div>
    </section>
  )
}
