'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import BrowseContentSection from './BrowseContentSection';
import type { Category } from '@/types';

function CategoriesSkeleton() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

export default function BrowseContentSectionWrapper() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await strapiAPI.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <CategoriesSkeleton />;
  }

  if (error || !categories.length) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2">No Categories Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'Add categories in Strapi CMS to display articles'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <BrowseContentSection initialCategories={categories} />;
}
