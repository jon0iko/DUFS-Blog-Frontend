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
  const [, startTransition] = useTransition()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // Get search query from URL - only after mount to prevent hydration mismatch
  const searchQuery = isMounted ? (searchParams.get('search') || '') : ''
  
  // Mark component as mounted (client-side only) to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Fetch categories and sync with URL on mount
  useEffect(() => {
    if (!isMounted) return
    
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Strapi v5: getCategories returns CategoryResponse with data array
        const response = await strapiAPI.getCategories()
        const fetchedCategories = response.data || []
        setCategories(fetchedCategories)
        
        // Set active category from URL if provided
        const categoryParam = searchParams.get('category')
        let newCategory = 'all'
        
        if (categoryParam && categoryParam !== 'all') {
          // Validate that the category exists
          const categoryExists = fetchedCategories.some(cat => cat.Slug === categoryParam || cat.id.toString() === categoryParam)
          if (categoryExists) {
            newCategory = categoryParam
          }
        }
        
        setActiveCategory(newCategory)
        
        // If URL had invalid category, clean it up to set to 'all'
        if (categoryParam && newCategory === 'all') {
          const params = new URLSearchParams(searchParams)
          params.delete('category')
          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
          })
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setActiveCategory('all')
        setCategories([])
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [isMounted])
  
  // Get filter values from URL params - only after mount
  const language = isMounted ? (searchParams.get('language') || 'all') : 'all'
  const sortBy = isMounted ? (searchParams.get('sort') || 'recent') : 'recent'

  // Sync activeCategory to URL when it changes (client-side only)
  useEffect(() => {
    if (!isMounted) return
    
    const params = new URLSearchParams(searchParams)
    const currentCategory = params.get('category')
    
    // If activeCategory is 'all', remove it from URL (clean URLs)
    if (activeCategory === 'all') {
      if (currentCategory !== null) {
        params.delete('category')
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`)
        })
      }
    } else if (activeCategory && activeCategory !== currentCategory) {
      // If activeCategory is set and different from URL, update it
      params.set('category', activeCategory)
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }
  }, [activeCategory, isMounted, pathname, router, searchParams])

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
      
      {isMounted && (
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
      )}
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

