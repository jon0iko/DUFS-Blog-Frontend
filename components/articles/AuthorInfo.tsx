'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthorProps {
  author: {
    name: string;
    avatar?: string;
    slug?: string;
    bio?: string;
  } | undefined;
}

export default function AuthorInfo({ author }: AuthorProps) {
  if (!author) return null;

  const authorSlug = author.slug || author.name.toLowerCase().replace(/\s+/g, '-');
  const avatarUrl = author.avatar || '/images/avatarPlaceholder.png';

  return (
    <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Link 
        href={`/author?slug=${authorSlug}`}
        className="relative w-16 h-16 flex-shrink-0"
      >
        <Image 
          src={avatarUrl} 
          alt={author.name}
          className="rounded-full object-cover hover:opacity-80 transition-opacity"
          fill
        />
      </Link>
      <div>
        <Link 
          href={`/author?slug=${authorSlug}`}
          className="font-semibold text-lg hover:text-primary transition-colors"
        >
          Written by {author.name}
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {author.bio || 'Film critic and journalist specializing in South Asian cinema and film theory.'}
        </p>
        <Link 
          href={`/author?slug=${authorSlug}`} 
          className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block hover:underline"
        >
          View all articles
        </Link>
      </div>
    </div>
  );
}
