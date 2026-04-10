'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import ArticleCard from './ArticleCard';
import { getArticleData } from '@/lib/strapi-helpers';
import { StaggerReveal } from '@/components/ui/ScrollReveal';
import type { Article } from '@/types';

function ArticleCardSkeleton() {
  return (
    <div className="bg-gray-200 dark:bg-brand-black-90 rounded-lg h-72 md:h-80 animate-pulse" />
  );
}

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await strapiAPI.getFeaturedArticles(12);
        setArticles(response.data || []);
      } catch (err) {
        console.error('Failed to load featured articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !articles.length) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2">No Featured Articles</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'Mark articles as featured in Strapi CMS to display them here'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const validArticles = articles
    .map(article => ({ raw: article, data: getArticleData(article) }))
    .filter(item => item.data !== null);

  if (!validArticles.length) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Invalid Featured Articles</h2>
            <p className="text-gray-600 dark:text-gray-400">Featured articles contain invalid data. Please check your CMS content.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container">
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" staggerDelay={0.1}>
          {validArticles.map(({ raw, data }) => (
            <ArticleCard 
              key={raw.documentId} 
              article={data!} 
              imageHeight="h-56 md:h-64"
            />
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}