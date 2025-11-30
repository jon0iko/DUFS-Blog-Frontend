'use client'
import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { getFontClass } from '@/lib/fonts';

interface ArticleCardData {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
    slug?: string;
  };
  publishedAt: string;
  language: 'en' | 'bn' | 'both';
}

interface ArticleCardProps {
  article: ArticleCardData;
  imageHeight?: string;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const titleFontClass = getFontClass(article.title);
  const excerptFontClass = getFontClass(article.excerpt);
  const categoryFontClass = getFontClass(article.category);

  return (
    <article className="flex flex-col h-full">
      <div className="relative w-full overflow-hidden group rounded-lg">
        <Link href={`/read-article?slug=${article.slug}`} className="block mt-3">
        <div className={`relative aspect-[4/3] rounded-xl overflow-hidden mb-4`}>
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-0 left-0 m-2">
            <span className={cn("bg-black text-white text-xs px-2 py-1 uppercase font-medium rounded-2xl", categoryFontClass)}>
              {article.category}
            </span>
          </div>
        </div>
        </Link>
        
        <Link href={`/read-article?slug=${article.slug}`} className="block mt-3">
          <h2 className={cn("text-lg md:text-xl font-bold line-clamp-2 group-hover:underline px-1", titleFontClass)}>
            {article.title}
          </h2>
          <p className={cn("mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 font-light px-1", excerptFontClass)}>
            {article.excerpt}
          </p>  
        </Link>
        <div className="mt-3 flex items-center text-xs text-gray-500 px-1">
          {article.author.slug ? (
            <Link 
              href={`/author?slug=${article.author.slug}`}
              className="hover:text-primary hover:underline transition-colors"
            >
              {article.author.name}
            </Link>
          ) : (
            <span>{article.author.name}</span>
          )}
          <span className="mx-2">•</span>
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </div>
      </div>
    </article>
  );
}