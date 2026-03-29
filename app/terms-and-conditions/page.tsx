
'use client';

import React, { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import ArticleHTMLContent from '@/components/articles/ArticleHTMLContent';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

const TermsPage = () => {
  const [termsContent, setTermsContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await strapiAPI.getTermsAndConditions();
        setTermsContent(response?.Content || '');
        setLastUpdated(response?.updatedAt || null);
      } catch (error) {
        console.error('Failed to fetch terms and conditions:', error);
        setError('Failed to load Terms and Conditions. Please try again later.');
        setTermsContent('');
        setLastUpdated(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-altehaasgrotesk tracking-tight">
              Terms of Publication
            </h1>
            <p className="text-sm sm:text-base text-foreground/80 max-w-2xl mx-auto">
              Please read these terms carefully before you write any content
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-12 w-2/3 rounded-md" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
            <div className="space-y-3 mt-8">
              <Skeleton className="h-10 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            <div className="space-y-3 mt-8">
              <Skeleton className="h-10 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex gap-4 items-start">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">Unable to Load Content</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Content State */}
        {!isLoading && termsContent && (
          <div className="prose prose-sm sm:prose md:prose-base dark:prose-invert max-w-none">
            <ArticleHTMLContent content={termsContent} fontSize="medium" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !termsContent && !error && (
          <div className="rounded-lg border border-border/40 bg-muted/20 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                No Content Available
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Terms and conditions are not available at the moment. Please check back later.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Section */}
      <div className="border-t border-border/40 mt-12 sm:mt-16 md:mt-20">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-8">
            {/* Last Updated */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Last Updated
              </p>
              <p className="text-sm sm:text-base text-foreground">
                {lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Questions?
              </p>
              <p className="text-sm sm:text-base text-foreground">
                Contact us for clarifications about our terms<br/>
                Email: <a href="mailto:info@blog.dufs.org" className="text-primary hover:underline"> info@blog.dufs.org  </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
