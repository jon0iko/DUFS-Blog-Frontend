'use client'

import { useState, useEffect } from 'react'
import ArticleCard from '@/components/home/ArticleCard'
import { featuredArticles, editorsChoiceArticles } from '@/data/dummy-data'
import { Article } from '@/types'
import { Button } from '@/components/ui/button'

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
        // For demo, we'll just randomize since we don't have real read counts
        return sorted.sort(() => Math.random() - 0.5)
      default:
        return sorted
    }
  }
  
  useEffect(() => {
    // Reset visible count when filters change
    setVisibleCount(8)
    
    // Combine both featured and editors choice articles for browsing
    let filtered = [...featuredArticles, ...editorsChoiceArticles]
    
    // Filter by category if not "all"
    if (category) {
      filtered = filtered.filter(article => 
        article.category.toLowerCase() === category.toLowerCase() || 
        category.toLowerCase() === 'all'
      )
    }
    
    // Filter by language
    if (language !== 'all') {
      filtered = filtered.filter(article => 
        (language === 'bn' && article.isBengali) || 
        (language === 'en' && !article.isBengali)
      )
    }
    
    // Sort articles
    filtered = sortArticles(filtered, sortBy)
    
    // Update filtered articles
    setArticles(filtered)
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
