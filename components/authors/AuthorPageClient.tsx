'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { featuredArticles, editorsChoiceArticles } from '@/data/dummy-data';
import { Separator } from '@/components/ui/separator';

interface AuthorPageClientProps {
  slug: string;
}

interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  joinDate?: string;
}

export default function AuthorPageClient({ slug }: AuthorPageClientProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);  useEffect(() => {
    // In a real app, you'd fetch author data from an API
    console.log("Processing author slug:", slug);
    
    // Check for Bengali characters (Unicode range for Bengali: \u0980-\u09FF)
    const hasBengaliChars = /[\u0980-\u09FF]/.test(slug);
    
    // For Bengali names, use the slug directly for matching
    // For Latin names, format the slug to get the author name
    let authorName = slug;
    
    if (!hasBengaliChars && slug && slug.includes('-')) {
      try {
        authorName = slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      } catch (error) {
        console.error("Error formatting author slug:", error);
      }
    } else if (hasBengaliChars) {
      // For Bengali names, replace hyphens with spaces to get the author name
      authorName = slug.replace(/-/g, ' ');
    }
    
    console.log("Determined author name:", authorName);
    
    // Fetch the author's articles
    const allArticles = [...featuredArticles, ...editorsChoiceArticles];
    const authorArticles = allArticles.filter(article => {
      if (!article.author || !article.author.name) return false;
      
      // Special handling for Bengali author names
      if (hasBengaliChars) {
        // For Bengali names, either match the exact slug or the name with spaces
        const articleAuthorSlug = article.author.name.replace(/\s+/g, '-');
        return slug === articleAuthorSlug || article.author.name === authorName;
      }
      
      // For Latin names, use regular case-insensitive matching
      const articleAuthorSlug = article.author.name.toLowerCase().replace(/\s+/g, '-');
      if (articleAuthorSlug === slug) return true;
      
      return article.author.name.toLowerCase() === authorName.toLowerCase();
    });
    
    // Create a dummy author object based on first article
    if (authorArticles.length > 0) {
      const firstArticle = authorArticles[0];
      setAuthor({
        name: firstArticle.author.name,
        avatar: firstArticle.author.avatar || '/images/hero.jpg',
        bio: 'Writer and contributor at DUFS Blog with expertise in cinema, cultural studies and media analysis.',
        joinDate: 'January 2023',
      });
      
      setArticles(authorArticles);
    } else {
      // Create a default author if we don't have articles
      setAuthor({
        name: authorName,
        avatar: '/images/hero.jpg',
        bio: 'Writer and contributor at DUFS Blog.',
        joinDate: 'January 2023',
      });
    }
    
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-10 px-4 sm:px-6 animate-pulse">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-6"></div>
            <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto max-w-4xl py-10 px-4 sm:px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
        <p className="mb-8">The author you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl py-10 px-4 sm:px-6">
        {/* Author profile section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-12">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image 
              src={author.avatar || '/images/hero.jpg'} 
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1 text-center md:text-left">{author.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Writer • Joined {author.joinDate}
            </p>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
              {author.bio}
            </p>
          </div>
        </div>

        <Separator className="mb-10" />
        
        {/* Author's articles */}
        <h2 className="text-2xl font-bold mb-8">Articles by {author.name}</h2>
        
        {articles.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">This author hasn&apos;t published any articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={article.imageSrc}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <Link 
                    href={`/articles/${article.slug}`}
                    className={cn(
                      "text-xl font-semibold mb-2 block hover:text-blue-600 dark:hover:text-blue-400 transition",
                      article.isBengali && "font-kalpurush"
                    )}
                  >
                    {article.title}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                    {article.viewCount && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{article.viewCount.toLocaleString()} views</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination for future implementation */}
        {articles.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center space-x-1">
              <button
                disabled
                className="px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              >
                Previous
              </button>
              <button
                className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                1
              </button>
              <button
                disabled
                className="px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
