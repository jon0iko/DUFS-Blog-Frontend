'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import CategoryTabs from '@/components/browse/CategoryTabs'
import FilterOptions from '@/components/browse/FilterOptions'
import ArticlesList from '@/components/browse/ArticlesList'
import LoadingScreen from '@/components/common/LoadingScreen'
import { strapiAPI } from '@/lib/api'
import { Category } from '@/types'

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Get search query from URL
  const searchQuery = searchParams.get('search') || ''
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Strapi v5: getCategories returns CategoryResponse with data array
        const response = await strapiAPI.getCategories()
        const fetchedCategories = response.data || []
        setCategories(fetchedCategories)
        
        // Set active category from URL or default to 'all'
        const categoryParam = searchParams.get('category')
        if (categoryParam) {
          setActiveCategory(categoryParam)
        } else {
          // Default to 'all' to show all articles
          setActiveCategory('all')
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
        setIsLoading(false)
      }
    }
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Get filter values from URL params
  const language = searchParams.get('language') || 'all'
  const sortBy = searchParams.get('sort') || 'recent'

  // Update URL when category changes
  useEffect(() => {
    if (!activeCategory) return
    
    const params = new URLSearchParams(searchParams)
    const currentCategory = params.get('category')
    
    if (activeCategory !== currentCategory) {
      params.set('category', activeCategory)
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [activeCategory, searchParams, pathname, router])

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(type, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Clear search
  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      
      <div className="container py-8 px-4 md:px-6">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            {searchQuery ? 'SEARCH RESULTS' : 'BROWSE'}
          </h1>        
          {searchQuery ? (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-lg text-muted-foreground">
                Results for &quot;{searchQuery}&quot;
              </p>
              <button 
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear search
              </button>
            </div>
          ) : (
            <p className="text-lg text-muted-foreground">
              Browse articles by categories. Find film discussions you didn&apos;t know you were looking for.
            </p>
          )}
        </div>
      
        {/* Category Tabs - hide when searching */}
        {!searchQuery && (
          <div className="border-t border-border pt-4 mb-4">
            <CategoryTabs 
              categories={categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory}
            />
          </div>
        )}

        {/* Filter Options */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-8 mb-10 gap-6">
          <FilterOptions 
            language={language} 
            sortBy={sortBy}
            onFilterChange={handleFilterChange}
          />
        </div>
      
        {/* Articles Grid */}
        <ArticlesList 
          category={searchQuery ? 'all' : activeCategory}
          language={language}
          sortBy={sortBy}
          searchQuery={searchQuery}
        />
      </div>
    </>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="container py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  )
}

