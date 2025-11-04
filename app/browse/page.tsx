'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import CategoryTabs from '@/components/browse/CategoryTabs'
import FilterOptions from '@/components/browse/FilterOptions'
import ArticlesList from '@/components/browse/ArticlesList'
import { strapiAPI } from '@/lib/api'
import { Category } from '@/types'

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Strapi v5: getCategories returns CategoryResponse with data array
        const response = await strapiAPI.getCategories()
        setCategories(response.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])
  
  // Get category from URL or default to first category
  const categoryParam = searchParams.get('category')
  // Backend uses capital S in Slug
  const defaultCategory = categories.length > 0 ? categories[0].Slug : ''
  const [activeCategory, setActiveCategory] = useState(categoryParam || defaultCategory)
  
  // Get filter values from URL params
  const language = searchParams.get('language') || 'all'
  const sortBy = searchParams.get('sort') || 'recent'

  // Update URL when parameters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    if (activeCategory !== categoryParam) {
      params.set('category', activeCategory)
    }
    
    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [activeCategory, categoryParam, pathname, router, searchParams])

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(type, value)
    router.push(`${pathname}?${params.toString()}`)
  }
  return (

    // if isLoadingCategories, show skeleton
    
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">BROWSE</h1>        <p className="text-lg text-muted-foreground">
          Browse articles by categories. Find film discussions you didn&apos;t know you were looking for.
        </p>
      </div>
      
      {/* Category Tabs */}
      <div className="border-t border-border pt-4 mb-4">
        <CategoryTabs 
          categories={categories} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
        />
      </div>
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
        category={activeCategory}
        language={language}
        sortBy={sortBy}
      />
    </div>
  )
}
