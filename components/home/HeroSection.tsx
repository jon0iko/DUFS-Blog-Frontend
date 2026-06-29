'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import HeroCarousel from './HeroCarousel';
import type { Article } from '@/types';

function HeroSkeleton() {
  return (
    <section className="relative h-[81svh] md:h-[90vh] w-full overflow-hidden bg-white dark:bg-brand-black-90 flex items-center justify-center animate-pulse">
      <div className="w-full h-full" />
    </section>
  );
}

interface HeroSectionProps {
  onReadyStateChange?: (isReady: boolean) => void;
  /** Build-time hero articles, used for the first paint then revalidated client-side. */
  initialArticles?: Article[];
}

export default function HeroSection({ onReadyStateChange, initialArticles = [] }: HeroSectionProps) {
  const hasInitial = initialArticles.length > 0;
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchHeroArticles = async () => {
      try {
        // Only show the skeleton when we have nothing to display yet. With SSG
        // data we keep showing it and revalidate silently in the background.
        if (!hasInitial) setLoading(true);
        setError(null);
        const response = await strapiAPI.getHeroArticles();
        if (cancelled) return;

        if (!response.data || response.data.length === 0) {
          // Empty fresh data: only surface an error if we never had SSG data.
          if (!hasInitial) {
            setError('No hero articles found');
            setArticles([]);
            onReadyStateChange?.(true); // dismiss loader
          }
          return;
        }

        setArticles(response.data);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load hero articles:', err);
        // Keep the build-time hero on screen if the revalidation fails.
        if (!hasInitial) {
          setError(err instanceof Error ? err.message : 'Failed to load content');
          setArticles([]);
          onReadyStateChange?.(true); // dismiss loader
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHeroArticles();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReadyStateChange]);

  if (loading) {
    return <HeroSkeleton />;
  }

  if (error || articles.length === 0) {
    return (
      <section className="relative h-[81svh] md:h-[90vh] w-full overflow-hidden bg-brand-black-90 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Unable to Load</h2>
          <p className="text-gray-400">{'Please check your connection'}</p>
        </div>
      </section>
    );
  }

  return (
    <HeroCarousel
      articles={articles}
      onReadyStateChange={onReadyStateChange}
      initialReady={hasInitial}
    />
  );
}