'use client'

import { cn } from '@/lib/utils'
import { categories as categoriesType } from '@/types'

interface CategoryTabsProps {
  categories: categoriesType[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export default function CategoryTabs({ 
  categories, 
  activeCategory, 
  setActiveCategory 
}: CategoryTabsProps) {
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }
  
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <nav className="flex space-x-12 pb-2">
        {categories.map((category) => {
          // Remove the leading slash from slug for comparison
          const categorySlug = category.slug.substring(1)
          
          return (
            <button
              key={category.slug}
              onClick={() => handleCategoryChange(categorySlug)}
              className={cn(
                "pb-6 pt-2 px-1 border-b-2 text-lg font-medium transition-colors whitespace-nowrap relative",
                activeCategory === categorySlug
                  ? "border-foreground text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              {category.Name}
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
