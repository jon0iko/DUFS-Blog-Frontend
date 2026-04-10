'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import BrowseContentSection from './BrowseContentSection';
import ErrorScreen from './ErrorScreen';
import type { Category } from '@/types';

interface BrowseContentSectionWrapperProps {
  onErrorChange?: (hasError: boolean) => void;
}

function CategoriesSkeleton() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="h-20 bg-gray-200 dark:bg-brand-black-90 rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

export default function BrowseContentSectionWrapper({
  onErrorChange,
}: BrowseContentSectionWrapperProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await strapiAPI.getCategories();
      setCategories(response.data || []);
      onErrorChange?.(false);
    } catch (err) {
      console.error('Failed to load categories:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMsg);
      onErrorChange?.(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <CategoriesSkeleton />;
  }

  if (error) {
    return (
      <ErrorScreen
        title="Unable to Load Articles"
        message="We encountered a connection problem while loading articles. Please check your internet connection and try again."
        onRetry={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
        showRetry={true}
      />
    );
  }

  if (!categories.length) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2">No Categories Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add categories in Strapi CMS to display articles
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <BrowseContentSection initialCategories={categories} />;
}
