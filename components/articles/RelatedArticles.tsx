'use client'

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { featuredArticles, editorsChoiceArticles } from '@/data/dummy-data';

interface RelatedArticlesProps {
  currentArticleId: string;
  category: string;
}

export default function RelatedArticles({ currentArticleId, category }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch from an API based on category or tags
    // For now, we'll use the dummy data
    const allArticles = [...featuredArticles, ...editorsChoiceArticles];
    
    // Find articles in the same category, excluding the current one
    const filtered = allArticles
      .filter(article => article.id !== currentArticleId && article.category.toLowerCase() === category.toLowerCase())
      .slice(0, 3);
    
    // If we don't have enough articles in the same category, add some random ones
    if (filtered.length < 3) {
      const needed = 3 - filtered.length;
      const otherArticles = allArticles
        .filter(article => article.id !== currentArticleId && !filtered.some(a => a.id === article.id))
        .slice(0, needed);
      
      setRelatedArticles([...filtered, ...otherArticles]);
    } else {
      setRelatedArticles(filtered);
    }
  }, [currentArticleId, category]);

  if (relatedArticles.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
      <div className="space-y-4">
        {relatedArticles.map(article => (
          <div key={article.id} className="flex items-start gap-4">
            <div className="w-20 h-20 relative flex-shrink-0">
              <Image 
                src={article.imageSrc}
                alt={article.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <div>
              <Link 
                href={`/articles/${article.slug}`}
                className={cn(
                  "font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2",
                  article.isBengali && "font-kalpurush"
                )}
              >
                {article.title}
              </Link>
              <div className="text-xs text-gray-500 mt-1">
                {article.publishedAt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
