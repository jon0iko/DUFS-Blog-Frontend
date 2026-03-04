import Link from 'next/link';
import Image from 'next/image';
import { serverStrapiAPI } from '@/lib/server-api';
import { Clapperboard, Film, Theater, Video, Camera, PlayCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStrapiMediaUrl } from '@/lib/strapi-helpers';
import { getFontClass } from '@/lib/fonts';
import ScrollReveal, { StaggerReveal } from '@/components/ui/ScrollReveal';

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

export default async function CategoriesSection() {
  try {
    const categoriesResponse = await serverStrapiAPI.getCategories();
    const categories = categoriesResponse.data || [];

    if (categories.length === 0) {
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
              const hasIllustration = !!category.Illustration?.url;
              
              return (
                <Link 
                  key={category.documentId} 
                  href={`/browse?category=${category.Slug}`}
                  className="group relative block w-full aspect-[3/1] md:aspect-[2.4/1] overflow-hidden border border-border bg-card transition-all duration-500 hover:border-foreground/50"
                >
                  {/* Background Content */}
                  {hasIllustration ? (
                    <div className="absolute inset-0">
                      <Image
                        src={getStrapiMediaUrl(category.Illustration)}
                        alt={category.Name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-foreground group-hover:bg-background transition-colors duration-500 flex items-center justify-center">
                       {/* Icon in background for texture */}
                       <div className="opacity-[0.03] group-hover:opacity-[0.05] transform scale-[3] text-background group-hover:text-foreground transition-colors duration-500">
                           {getCategoryIcon(category.Slug)}
                       </div>
                    </div>
                  )}

                  {/* Foreground Content */}
                  <div className={cn(
                    "absolute inset-0 p-5 flex flex-col justify-between z-10 transition-colors duration-500",
                    hasIllustration 
                      ? "text-white" 
                      : "text-background group-hover:text-foreground"
                  )}>
                    <div className="flex justify-between items-start">
                       {/* Icon */}
                       {/* <div className="opacity-100">
                          {getCategoryIcon(category.Slug)}
                       </div> */}
                       
                       <ArrowUpRight className={cn(
                         "w-6 h-6 transform translate-x-4 -translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100",
                         hasIllustration ? "text-white" : "text-foreground"
                       )} />
                    </div>
                    
                    <div>
                      <h3 className={cn("text-xl md:text-2xl font-bold uppercase tracking-wider mb-2", getFontClass(category.Name))}>
                        {category.Name}
                      </h3>
                      {category.articlesCount !== undefined && (
                        <p className={cn(
                          "text-xs font-mono uppercase tracking-widest opacity-60",
                           hasIllustration ? "text-white" : "text-background/70 group-hover:text-foreground/70"
                        )}>
                          {category.articlesCount} {category.articlesCount === 1 ? 'Entry' : 'Entries'}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </StaggerReveal>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load categories section:', error);
    return null;
  }
}
