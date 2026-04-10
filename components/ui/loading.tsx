import React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';
import { Loader2 } from 'lucide-react';

// Generic loading spinner
export function LoadingSpinner({ size = 'default', className = '' }: { 
  size?: 'sm' | 'default' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Full page loading
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Article card skeleton
export function ArticleCardSkeleton() {
  return (
    <Card className="h-full">
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-2 left-2">
          <Skeleton className="w-16 h-5" />
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-1/2 h-4" />
        <div className="flex items-center space-x-2 pt-2">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-1 h-1 rounded-full" />
          <Skeleton className="w-20 h-3" />
        </div>
      </CardContent>
    </Card>
  );
}

// Article content skeleton
export function ArticleContentSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero section skeleton */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="container mx-auto max-w-5xl">
            <div className="max-w-3xl space-y-4">
              <Skeleton className="w-24 h-6" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-3/4 h-8" />
              <div className="flex items-center space-x-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-1 h-1 rounded-full" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="container mx-auto max-w-5xl py-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <Skeleton className="w-32 h-6" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-8" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="w-40 h-6" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="w-16 h-16" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Author profile skeleton
export function AuthorProfileSkeleton() {
  return (
    <div className="container py-12 px-4 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Author header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1 text-center md:text-left space-y-4">
            <Skeleton className="w-48 h-8 mx-auto md:mx-0" />
            <div className="space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-4" />
            </div>
            <div className="flex justify-center md:justify-start space-x-2">
              <Skeleton className="w-24 h-8" />
              <Skeleton className="w-32 h-8" />
            </div>
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Browse page skeleton
export function BrowsePageSkeleton() {
  return (
    <div className="container py-8 px-4 md:px-6 animate-pulse">
      {/* Header */}
      <div className="mb-8 max-w-3xl space-y-4">
        <Skeleton className="w-48 h-10" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-3/4 h-6" />
      </div>

      {/* Category tabs */}
      <div className="border-t border-border pt-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-8" />
          ))}
        </div>
      </div>

      {/* Filter options */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-8 mb-10 gap-6">
        <div className="flex gap-4">
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Home page skeleton
export function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero section skeleton */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pl-6 pb-12">
            <div className="max-w-5xl space-y-4">
              <Skeleton className="w-full h-12 md:h-16" />
              <Skeleton className="w-3/4 h-6 md:h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured articles skeleton */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* More posts button skeleton */}
      <div className="text-center py-8">
        <Skeleton className="w-48 h-12 mx-auto" />
      </div>

      {/* Editor's choice skeleton */}
      <section className="py-12 bg-gray-50 dark:bg-brand-black-90">
        <div className="container">
          <Skeleton className="w-48 h-8 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Navigation skeleton
export function NavigationSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="w-16 h-4" />
      ))}
    </div>
  );
}

// Comment section skeleton
export function CommentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="w-32 h-6" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      ))}
    </div>
  );
}

// Inline loading for buttons
export function ButtonLoading({ children, isLoading, ...props }: {
  children: React.ReactNode;
  isLoading: boolean;
  [key: string]: any;
}) {
  return (
    <button disabled={isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
} 