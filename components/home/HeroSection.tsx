'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import HeroCarousel from './HeroCarousel';
import type { Article } from '@/types';

function HeroSkeleton() {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-white dark:bg-brand-black-90 flex items-center justify-center animate-pulse">
      <div className="w-full h-full" />
    </section>
  );
}

export default function HeroSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await strapiAPI.getHeroArticles();
        
        if (!response.data || response.data.length === 0) {
          setError('No hero articles found');
          setArticles([]);
          return;
        }
        
        setArticles(response.data);
      } catch (err) {
        console.error('Failed to load hero articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroArticles();
  }, []);

  if (loading) {
    return <HeroSkeleton />;
  }

  if (error || articles.length === 0) {
    return (
      <section className="relative h-[80vh] w-full overflow-hidden bg-brand-black-90 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Unable to Load</h2>
          <p className="text-gray-400">{'Please check your connection'}</p>
        </div>
      </section>
    );
  }

  return <HeroCarousel articles={articles} />;
}