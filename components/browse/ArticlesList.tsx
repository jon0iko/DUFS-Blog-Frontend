'use client'

import { useState, useEffect } from 'react'
import ArticleCard from '@/components/home/ArticleCard'
import { Article } from '@/types'
import { Button } from '@/components/ui/button'
import { strapiAPI } from '@/lib/api'

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
        return sorted.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        )
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
        
        // Build filters
        const filters: any = {
          page: 1,
          pageSize: 100, // Fetch more to allow client-side filtering
          sort: sortBy === 'recent' ? 'publishedAt:desc' : sortBy === 'oldest' ? 'publishedAt:asc' : 'viewCount:desc'
        }
        
        if (category && category !== 'all') {
          filters.category = category
        }
        
        if (language && language !== 'all') {
          filters.language = language === 'bn' ? 'bn' : 'en'
        }
        
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
  
  // Get only the visible articles
  const visibleArticles = articles.slice(0, visibleCount)
  const hasMore = visibleCount < articles.length
  
  return (
    <div>
      {visibleArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {visibleArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
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
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
