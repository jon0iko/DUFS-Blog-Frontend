'use client'

import { cn } from '@/lib/utils'
import { Category } from '@/types'
import { getFontClass } from '@/lib/fonts'

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export default function CategoryTabs({ 
  categories, 
  activeCategory, 
  setActiveCategory 
}: CategoryTabsProps) {
  
  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug)
  }
  
  // Create "All" category option
  const allCategory = {
    documentId: 'all',
    Slug: 'all',
    Name: 'All'
  }
  
  // Combine "All" with other categories
  const allCategories = [allCategory, ...categories]
  
  return (
    <div>
      <nav className="flex flex-wrap gap-x-6 gap-y-3 md:gap-x-10">
        {allCategories.map((category) => {
          const categorySlug = category.Slug || ''
          const categoryName = category.Name || ''
          const fontClass = getFontClass(categoryName)
          
          return (
            <button
              key={category.documentId}
              onClick={() => handleCategoryChange(categorySlug)}
              className={cn(
                "pb-2 pt-2 px-1 border-b-2 text-lg md:text-xl font-medium transition-colors relative",
                fontClass,
                activeCategory === categorySlug
                  ? "border-foreground text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              {categoryName}
              {activeCategory === categorySlug && (
                <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-foreground" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
