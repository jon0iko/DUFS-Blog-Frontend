'use client'

import { useState, useEffect } from 'react'
import ArticleCard from '@/components/home/ArticleCard'
import { Article } from '@/types'
import { Button } from '@/components/ui/button'
import { strapiAPI } from '@/lib/api'
import { getArticleData } from '@/lib/strapi-helpers'

interface ArticlesListProps {
  category: string
  language: string
  sortBy: string
}

export default function ArticlesList({
  category,
  language,
  sortBy
}: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(8)
  
  // Helper function to sort articles
  const sortArticles = (articles: Article[], sortType: string): Article[] => {
    const sorted = [...articles]
    
    switch (sortType) {
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        })
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateA - dateB;
        })
      case 'popular':
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      default:
        return sorted
    }
  }
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        setVisibleCount(8)
        
        // Build filters for Strapi v5
        const filters: {
          page?: number;
          pageSize?: number;
          category?: string;
          language?: 'en' | 'bn' | 'both';
          sort?: string;
          storyState?: string;
        } = {
          page: 1,
          pageSize: 100, // Fetch more to allow client-side filtering
          sort: sortBy === 'recent' ? 'publishedAt:desc' : sortBy === 'oldest' ? 'publishedAt:asc' : 'viewCount:desc',
          storyState: 'published' // Only fetch published articles
        }
        
        if (category && category !== 'all') {
          filters.category = category
        }
        
        if (language && language !== 'all') {
          filters.language = language === 'bn' ? 'bn' : 'en'
        }
        
        // Strapi v5: getArticles returns ArticleResponse with data array
        const response = await strapiAPI.getArticles(filters)
        let fetchedArticles = response.data || []
        
        // Sort articles on client side
        fetchedArticles = sortArticles(fetchedArticles, sortBy)
        
        setArticles(fetchedArticles)
      } catch (error) {
        console.error('Failed to fetch articles:', error)
        setArticles([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchArticles()
  }, [category, language, sortBy])
  
  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 8)
  }
  
  // Filter out invalid articles and get only the visible articles
  const validArticles = articles
    .map(article => ({ raw: article, data: getArticleData(article) }))
    .filter(item => item.data !== null);
    
  const visibleArticles = validArticles.slice(0, visibleCount)
  const hasMore = visibleCount < validArticles.length
  
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {visibleArticles.map(({ raw, data }) => (
              <ArticleCard 
                key={raw.documentId} 
                article={data!} 
                imageHeight="h-64 md:h-72"
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-10 text-center">
              <Button 
                onClick={loadMore}
                variant="outline" 
                className="px-8 py-6 text-base"
              >
                Load More ({validArticles.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
