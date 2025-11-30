'use client'

import { useState, useEffect } from 'react'
import ArticleCard from '@/components/home/ArticleCard'
import { Article } from '@/types'
import { Button } from '@/components/ui/button'
import { strapiAPI } from '@/lib/api'
import { getArticleData } from '@/lib/strapi-helpers'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ArticlesListProps {
  category: string
  language: string
  sortBy: string
  searchQuery?: string
}

const ARTICLES_PER_PAGE = 12

export default function ArticlesList({
  category,
  language,
  sortBy,
  searchQuery
}: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        
        let response;
        
        // If there's a search query, use the search API
        if (searchQuery && searchQuery.trim()) {
          response = await strapiAPI.searchArticles(searchQuery, {
            page: currentPage,
            pageSize: ARTICLES_PER_PAGE,
            category: category && category !== 'all' ? category : undefined,
            language: language && language !== 'all' ? (language as 'en' | 'bn') : undefined,
          })
        } else {
          // Build filters for Strapi v5
          const filters: {
            page?: number;
            pageSize?: number;
            category?: string;
            language?: 'en' | 'bn' | 'both';
            sort?: string;
            storyState?: string;
          } = {
            page: currentPage,
            pageSize: ARTICLES_PER_PAGE,
            sort: sortBy === 'recent' ? 'publishedAt:desc' : sortBy === 'oldest' ? 'publishedAt:asc' : 'viewCount:desc',
            storyState: 'published'
          }
          
          if (category && category !== 'all') {
            filters.category = category
          }
          
          if (language && language !== 'all') {
            filters.language = language === 'bn' ? 'bn' : 'en'
          }
          
          response = await strapiAPI.getArticles(filters)
        }
        
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
  }, [category, language, sortBy, currentPage, searchQuery])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [category, language, sortBy, searchQuery])
  
  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of articles list
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }
  
  // Filter out invalid articles
  const validArticles = articles
    .map(article => ({ raw: article, data: getArticleData(article) }))
    .filter(item => item.data !== null);
  
  return (
    <div>
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="text-muted-foreground mt-4">Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 inline-block">
            <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground">No articles match your current filters.</p>
            <p className="text-sm text-gray-500 mt-2">Try changing the category, language, or sort options.</p>
          </div>
        </div>
      ) : validArticles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 inline-block">
            <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-200">Invalid Article Data</h3>
            <p className="text-muted-foreground">Articles exist but contain incomplete or corrupted data.</p>
            <p className="text-sm text-gray-500 mt-2">Please check the content in your Strapi CMS.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Articles count info */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ARTICLES_PER_PAGE + 1} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalArticles)} of {totalArticles} articles
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {validArticles.map(({ raw, data }) => (
              <ArticleCard 
                key={raw.documentId} 
                article={data!} 
                imageHeight="h-64 md:h-72"
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page Numbers */}
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
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>
              
              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Page info for mobile */}
          {totalPages > 1 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </>
      )}
    </div>
  )
}
