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
  
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <nav className="flex space-x-12 pb-2">
        {categories.map((category) => {
          const categorySlug = category.Slug || ''
          const categoryName = category.Name || ''
          const fontClass = getFontClass(categoryName)
          
          return (
            <button
              key={category.documentId}
              onClick={() => handleCategoryChange(categorySlug)}
              className={cn(
                "pb-6 pt-2 px-1 border-b-2 text-xl font-medium transition-colors whitespace-nowrap relative",
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
