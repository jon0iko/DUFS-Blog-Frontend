'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Article, Author } from '@/types';
import { Separator } from '@/components/ui/separator';
import { config } from '@/lib/config';
import { getFontClass } from '@/lib/fonts';

interface Props {
  author: Author;
  articles: Article[];
}

export default function AuthorClient({ author, articles }: Props) {
  const avatarUrl = author.Avatar?.url 
    ? config.strapi.url + author.Avatar.url
    : '/images/hero.jpg';

  return (
    <div className="bg-white dark:bg-brand-black-90">
      <div className="container mx-auto max-w-6xl py-10 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-12">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image 
              src={avatarUrl} 
              alt={author.Name || 'Author'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{author.Name}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Writer - Joined {new Date(author.createdAt).toLocaleDateString()}
            </p>
            {author.Bio && <p className="text-gray-700">{author.Bio}</p>}
          </div>
        </div>

        <Separator className="mb-10" />
        
        <h2 className="text-2xl font-bold mb-8">Articles by {author.Name}</h2>
        
        {articles.length === 0 ? (
          <p className="text-gray-600">This author has not published any articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const img = article.featuredImage?.url
                ? config.strapi.url + article.featuredImage.url
                : '/images/hero.jpg';
              const font = getFontClass(article.title || '');

              return (
                <div key={article.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-48 relative">
                    <Image src={img} alt={article.title || 'Article'} fill className="object-cover" unoptimized />
                  </div>
                  <div className="p-6">
                    <Link href={`/articles/${article.slug}`} className={font + ' text-xl font-semibold mb-2 block hover:text-blue-600'}>
                      {article.title}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
