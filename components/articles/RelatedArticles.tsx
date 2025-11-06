'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { config } from '@/lib/config';
import { ArrowRight } from 'lucide-react';

interface RelatedArticlesProps {
  articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-serif font-bold">Related Stories</h2>
        <div className="h-px flex-1 ml-6 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map(article => {
          const imageUrl = article.featuredImage?.url
            ? (article.featuredImage.url.startsWith('http')
                ? article.featuredImage.url
                : `${config.strapi.url}${article.featuredImage.url}`)
            : '/images/hero.jpg';

          return (
            <Link 
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                <Image 
                  src={imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div>
                {article.category && (
                  <span 
                    className="inline-block text-xs font-medium mb-2 px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black"
                  
                  >
                    {article.category.Name}
                  </span>
                )}
                
                <h3 className={cn(
                  "font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition line-clamp-2",
                  article.language === 'bn' && "font-kalpurush"
                )}>
                  {article.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center text-sm text-primary font-medium">
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
