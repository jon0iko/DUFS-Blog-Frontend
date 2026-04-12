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
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // Mark component as mounted (client-side only) to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // 1. Fetch categories ONCE on mount
  useEffect(() => {
    let active = true;
    
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Strapi v5: getCategories returns CategoryResponse with data array
        const response = await strapiAPI.getCategories()
        if (active) {
          setCategories(response.data || [])
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        if (active) {
          setCategories([])
          setIsLoading(false)
        }
      }
    }
    
    fetchCategories()
    return () => { active = false }
  }, [])
  
  // 2. Validate URL once categories have loaded
  useEffect(() => {
    if (!isMounted || categories.length === 0) return;
    
    // Check if current URL category is valid
    const currentParam = searchParams.get('category');
    if (currentParam && currentParam !== 'all') {
      const categoryExists = categories.some(cat => cat.Slug === currentParam || cat.id.toString() === currentParam);
      
      if (!categoryExists) {
        // Invalid category! Clean the URL.
        const params = new URLSearchParams(searchParams.toString())
        params.delete('category')
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    }
  }, [categories, isMounted, pathname, router, searchParams])

  // Single source of truth from URL (after mount)
  const hasLoadedData = categories.length > 0;
  let activeCategory = 'all';
  
  if (isMounted) {
    const currentParam = searchParams.get('category');
    if (currentParam && currentParam !== 'all') {
      if (hasLoadedData) {
        const categoryExists = categories.some(cat => cat.Slug === currentParam || cat.id.toString() === currentParam);
        if (categoryExists) {
          activeCategory = currentParam;
        } // else it remains 'all' while the useEffect cleans the URL
      } else {
        // Optimistically show the category while data loads
        activeCategory = currentParam;
      }
    }
  }

  // Get filter values from URL params - only after mount
  const searchQuery = isMounted ? (searchParams.get('search') || '') : ''
  const language = isMounted ? (searchParams.get('language') || 'all') : 'all'
  const sortBy = isMounted ? (searchParams.get('sort') || 'recent') : 'recent'

  // Explicit event handler for category clicks (Instead of dual-state syncing)
  const handleSetCategory = (newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newCategory === 'all' || !newCategory) {
      params.delete('category')
    } else {
      params.set('category', newCategory)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(type, value)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // Clear search
  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // Set search from top controls
  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      
      {isMounted && (
        <BrowseInteractiveBlocks 
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={handleSetCategory}
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

