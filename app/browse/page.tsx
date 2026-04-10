'use client'

import { Suspense, useState, useEffect, useTransition } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import LoadingScreen from '@/components/common/LoadingScreen'
import { strapiAPI } from '@/lib/api'
import { Category } from '@/types'
import BrowseInteractiveBlocks from '@/components/browse/BrowseInteractiveBlocks'

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
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
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }
  }, [activeCategory, searchParams, pathname, router])

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(type, value)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Clear search
  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Set search from top controls
  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      
      <BrowseInteractiveBlocks 
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        language={language}
        sortBy={sortBy}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
        onSearchSubmit={handleSearchSubmit}
      />
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

