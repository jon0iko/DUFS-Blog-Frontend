'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { strapiAPI } from '@/lib/api';
import { Clapperboard, Film, Theater, Video, Camera, PlayCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStrapiMediaUrl } from '@/lib/strapi-helpers';
import { getFontClass } from '@/lib/fonts';
import ScrollReveal, { StaggerReveal } from '@/components/ui/ScrollReveal';
import type { Category } from '@/types';

// Map common category slugs to icons
const getCategoryIcon = (slug: string) => {
  const iconProps = { className: "w-8 h-8 md:w-10 md:h-10 transition-transform duration-500 group-hover:scale-110" };
  
  if (slug.includes('review')) return <Clapperboard {...iconProps} />;
  if (slug.includes('festival')) return <Theater {...iconProps} />;
  if (slug.includes('interview')) return <Video {...iconProps} />;
  if (slug.includes('history')) return <Film {...iconProps} />;
  if (slug.includes('tech')) return <Camera {...iconProps} />;
  
  return <PlayCircle {...iconProps} />;
};

function CategoriesSkeleton() {
  return (
    <section className="py-12 md:py-14 bg-background">
      <div className="container">
        <div className="h-40 bg-gray-200 dark:bg-brand-black-90 rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await strapiAPI.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <CategoriesSkeleton />;
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="py-12 md:py-14 bg-background">
      <div className="container">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4" duration={0.7}>
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-foreground">
              BROWSE CONTENT
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl font-light">
              Explore our collection of film analysis, reviews, and publications.
            </p>
          </div>
          <Link 
            href="/browse" 
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest hover:underline decoration-1 underline-offset-4 transition-all"
          >
            View all
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.09} start="top 88%">
          {categories.map((category) => {
            return (
              <Link 
                key={category.documentId} 
                href={`/browse?category=${category.Slug}`}
                className="group relative block w-full aspect-[3/1] md:aspect-[2.4/1] overflow-hidden border border-border bg-card transition-all duration-500 hover:border-foreground/50"
              >
                {/* Background - Gradient fallback */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-background/10 group-hover:from-foreground/20 group-hover:to-background/20 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.05] transform scale-[3] text-background group-hover:text-foreground transition-colors duration-500">
                  {getCategoryIcon(category.Slug)}
                </div>

                {/* Foreground Content */}
                <div className={cn(
                  "absolute inset-0 p-5 flex flex-col justify-between z-10 transition-colors duration-500",
                  "text-foreground"
                )}>
                  <div className="flex justify-between items-start">
                     {/* Icon */}
                     {/* <div className="opacity-100">
                        {getCategoryIcon(category.Slug)}
                     </div> */}
                     
                     <ArrowUpRight className={cn(
                       "w-6 h-6 transform translate-x-4 -translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100",
                       "text-foreground"
                     )} />
                  </div>
                  
                  <div>
                    <h3 className={cn("text-xl md:text-2xl font-bold uppercase tracking-wider mb-2", getFontClass(category.Name))}>
                      {category.Name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}
