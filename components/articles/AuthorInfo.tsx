'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthorProps {
  author: {
    name: string;
    avatar?: string;
  } | undefined;
}

export default function AuthorInfo({ author }: AuthorProps) {
  if (!author) return null;

  return (
    <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image 
          src={author.avatar || 'https://via.placeholder.com/80?text=DUFS'} 
          alt={author.name}
          className="rounded-full object-cover"
          fill
        />
      </div>
      <div>
        <h3 className="font-semibold text-lg">Written by {author.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Film critic and journalist specializing in South Asian cinema and film theory.
        </p>        <Link 
          href={`/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`} 
          className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block hover:underline"
        >
          View all articles
        </Link>
      </div>
    </div>
  );
}
