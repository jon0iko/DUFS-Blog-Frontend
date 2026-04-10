'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { config } from '@/lib/config';
import { ArrowRight, Clock, Eye, Heart } from 'lucide-react';
import { getFontClass, getfontsizeBN, isBengaliText } from '@/lib/fonts';

interface RelatedArticlesProps {
  articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="mb-10">
        {/* Mobile heading */}
        <div className="md:hidden">
          <div className="flex items-center justify-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommended For You</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        
        {/* Desktop heading with visual flourish */}
        <div className="hidden md:block">
          <div className="flex items-center gap-4 mb-1">
            <h2 className="text-4xl font-black tracking-tight text-foreground">Related Articles</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border via-border to-transparent" />
          </div>
          </div>
      </div>
      
      {/* Grid Layout - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-5">
        {articles.map((article, index) => {
          const imageUrl = article.featuredImage?.url
            ? (article.featuredImage.url.startsWith('http')
                ? article.featuredImage.url
                : `${config.strapi.url}${article.featuredImage.url}`)
            : '/images/placeholder.jpg';

          const publishedDate = (article.BlogDate || article.publishedAt)
            ? new Date(article.BlogDate! || article.publishedAt!).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : '';

          const isBengali = isBengaliText(article.title);

          return (
            <Link 
              key={article.documentId}
              href={`/read-article?slug=${article.slug}`}
              className="group flex flex-col h-full"
            >
              {/* Image Container with Overlay */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-accent/10">
                <Image 
                  src={imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={index === 0} // Prioritize first image load
                />
                
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category Badge - Always visible for context */}
                {article.category && (
                  <div className="absolute top-3 left-3 z-10">
                    <span 
                      className={cn(
                        "inline-block text-xs font-bold px-2.5 py-1 bg-black text-white rounded-full uppercase tracking-wider",
                        getFontClass(article.category.Name)
                      )}
                    >
                      {article.category.Name}
                    </span>
                  </div>
                )}

                {/* Featured Badge */}
              </div>

              {/* Content Container */}
              <div className="flex flex-col flex-grow">
                {/* Title */}
                <h3 className={cn(
                  "font-bold text-base md:text-lg leading-tight mb-2 group-hover:text-primary transition line-clamp-2",
                  isBengali ? "font-kalpurush text-lg" : ""
                )}>
                  {article.title}
                </h3>

                {/* Author Name */}
                {(article.author?.Name || article.publication_author_name) && (
                  
                  <p className={`${getfontsizeBN(article.author?.Name || article.publication_author_name!, 'text-xs')} text-muted-foreground mb-2 font-medium line-clamp-1 ${getFontClass(article.author?.Name || article.publication_author_name!)}`}>
                  <span className='font-montserrat text-xs'>By</span>  {article.author?.Name || article.publication_author_name}
                  </p>
                )}

                {/* Metadata Row - Compact and informative */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3 pb-3 border-b border-border/40">
                  {/* Published Date - Only show if BlogDate is set */}
                  {(article.BlogDate || article.publishedAt) && (
                    <>
                      <time dateTime={article.BlogDate || article.publishedAt} className="whitespace-nowrap">
                        {publishedDate}
                      </time>
                      
                      {/* Divider */}
                      <span className="text-border/60">•</span>
                    </>
                  )}
                  
                  {/* View Count */}
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground/60" />
                    <span>{(article.viewCount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Engagement Stats - Optional, subtle */}
                {(article.likes || 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-primary/70 mb-3">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{article.likes} likes</span>
                  </div>
                )}

                {/* CTA - Grows to fill remaining space */}
                <div className="mt-2 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Optional: Explore More CTA */}
      <div className="mt-10 text-center">
        <Link 
          href="/browse"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          Explore All Articles
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
