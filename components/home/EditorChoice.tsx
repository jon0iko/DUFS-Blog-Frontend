'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import ArticleCard from './ArticleCard';
import { getArticleData } from '@/lib/strapi-helpers';
import ScrollReveal, { StaggerReveal } from '@/components/ui/ScrollReveal';
import type { Article } from '@/types';

function ArticleCardSkeleton() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 md:h-72 animate-pulse" />
  );
}

export default function EditorChoice() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await strapiAPI.getEditorsChoiceArticles(4);
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
      <section className="relative py-12 bg-secondary dark:bg-[#2b2827] mt-16 mb-8">
        <div className="container z-10 relative">
          <div className="flex justify-center mb-8">
            <h2 className="text-3xl md:text-3xl lg:text-4xl font-black text-brand-black-90">Featured</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !articles.length) {
    return (
      <section className="py-12 bg-secondary dark:bg-brand-black-90">
        <div className="container">
          <div className="flex justify-center mb-8">
            <h2 className="text-2xl font-semibold relative text-brand-black-90">
              <span className="relative z-10">Featured</span>
              <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-border"></span>
            </h2>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">{error || 'No Featured articles found'}</p>
          </div>
        </div>
      </section>
    );
  }

  const validArticles = articles
    .map(article => ({ raw: article, data: getArticleData(article) }))
    .filter(item => item.data !== null);

  if (!validArticles.length) {
    return null;
  }

  return (
    <section className="relative py-12 bg-secondary dark:bg-[#2b2827] mt-16 mb-8">
      {/* Paper texture overlay — light mode: full opacity white paper */}
      {/* Paper texture overlay — light mode */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-[5]"
        style={{
          backgroundImage: 'url(/images/paper.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '500px',
          opacity: 1,
          
        }}
      />
      {/* Paper texture overlay — dark mode: subtle embossed grain via overlay blend */}
      {/* <div
        className="absolute inset-0 pointer-events-none select-none z-[5] hidden dark:block"
        style={{
          backgroundImage: 'url(/images/paper.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '600px',
          opacity: 1,
          mixBlendMode: 'overlay',
        }}
      /> */}
      {/* Torn paper edge — white top floats over section above, torn edge marks the boundary */}
      <div
        className="absolute left-0 right-0 w-full pointer-events-none select-none z-10"
        style={{ top: 0, transform: 'translateY(-75%)' }}
      >
        {/* Light mode */}
        <img
          src="/images/tornpaper.webp"
          alt=""
          aria-hidden="true"
          className="w-full block dark:hidden"
          style={{ height: 'clamp(120px, 18vw, 220px)' }}
        />
        {/* Dark mode */}
        <img
          src="/images/tornpaper_black.webp"
          alt=""
          aria-hidden="true"
          className="w-full hidden dark:block"
          style={{ height: 'clamp(120px, 18vw, 220px)' }}
        />
      </div>
      {/* Torn paper edge — bottom, flipped to face upward, blends into footer below */}
      <div
        className="absolute left-0 right-0 w-full pointer-events-none select-none z-10"
        style={{ bottom: 0, transform: 'translateY(75%) scaleY(-1) scaleX(-1)' }}
      >
        {/* Light mode */}
        <img
          src="/images/tornpaper.webp"
          alt=""
          aria-hidden="true"
          className="w-full block dark:hidden"
          style={{ height: 'clamp(120px, 18vw, 220px)' }}
        />
        {/* Dark mode */}
        <img
          src="/images/tornpaper_black.webp"
          alt=""
          aria-hidden="true"
          className="w-full hidden dark:block"
          style={{ height: 'clamp(120px, 18vw, 220px)' }}
        />
      </div>
      {/* <div 
      className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-overlay z-20"
      style={{
        backgroundImage: 'url(/images/GrainTexture.webp)',
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px'
      }}
    /> */}
      <div className="container z-10 relative">
        <ScrollReveal className="flex justify-center mb-8" duration={0.6}>
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-black relative text-brand-black-90">
            <span className="relative z-10">Featured</span>
          </h2>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" staggerDelay={0.1}>
          {validArticles.map(({ raw, data }) => (
            <ArticleCard 
              key={raw.documentId} 
              article={data!} 
              imageHeight="h-48 md:h-56"
              forceBlackText={true}
            />
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}