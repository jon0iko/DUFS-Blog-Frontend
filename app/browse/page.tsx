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
  const [isLoading, setIsLoading] = useState(true)
  
  // Get URL parameters
  const searchQuery = searchParams.get('search') || ''
  const activeCategory = searchParams.get('category') || 'all'
  const language = searchParams.get('language') || 'all'
  const sortBy = searchParams.get('sort') || 'recent'
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Strapi v5: getCategories returns CategoryResponse with data array
        const response = await strapiAPI.getCategories()
        const fetchedCategories = response.data || []
        setCategories(fetchedCategories)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])
  
  // Handle category changes
  const handleCategoryChange = (slug: string) => {
    if (slug === activeCategory) return;
    
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') {
      params.set('category', 'all')
    } else {
      params.set('category', slug)
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

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

  // Handle completely resetting filters
  const handleResetAll = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('category', 'all')
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      
      <BrowseInteractiveBlocks 
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
        language={language}
        sortBy={sortBy}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
        onSearchSubmit={handleSearchSubmit}
        onResetAll={handleResetAll}
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

