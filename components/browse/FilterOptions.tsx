'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

interface FilterOptionsProps {
  language: string
  sortBy: string
  onFilterChange: (type: string, value: string) => void
}

export default function FilterOptions({ 
  language, 
  sortBy, 
  onFilterChange 
}: FilterOptionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Language Filter */}
      <div className="flex flex-col">
        <span className="text-xs font-medium mb-2 uppercase text-muted-foreground">
          Language
        </span>
        <div className="flex gap-2">
          <Button 
            variant={language === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onFilterChange('language', 'all')}
          >
            All
          </Button>
          <Button 
            variant={language === 'en' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onFilterChange('language', 'en')}
          >
            English
          </Button>
          <Button 
            variant={language === 'bn' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onFilterChange('language', 'bn')}
          >
            বাংলা
          </Button>
        </div>
      </div>

      {/* Sort By Filter */}
      <div className="flex flex-col">
        <span className="text-xs font-medium mb-2 uppercase text-muted-foreground">
          Sort By
        </span>
        <div className="flex gap-2">
          <Button 
            variant={sortBy === 'recent' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onFilterChange('sort', 'recent')}
          >
            Most Recent
          </Button>
          <Button 
            variant={sortBy === 'oldest' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onFilterChange('sort', 'oldest')}
          >
            Least Recent
          </Button>
          <Button 
            variant={sortBy === 'popular' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onFilterChange('sort', 'popular')}
          >
            Most Read
          </Button>
        </div>
      </div>
    </div>
  )
}
