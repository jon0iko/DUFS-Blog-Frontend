'use client'
import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  imageHeight?: string; // allows for different sizes
}

export default function ArticleCard({ article, imageHeight = "h-48" }: ArticleCardProps) {
  const [isBengali, setIsBengali] = React.useState(false);

  React.useEffect(() => {
    setIsBengali(article.isBengali);
  }, [article.isBengali]);

  return (
    <article className="flex flex-col h-full">
      <div className="relative w-full overflow-hidden group rounded-sm">
        <div className={`relative w-full ${imageHeight}`}>
          <Image
            src={article.imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-0 left-0 m-2">
            <span className="bg-black text-white text-xs px-2 py-1 uppercase font-medium">
              {article.category}
            </span>
          </div>
        </div>
        
        <Link href={`/articles/${article.slug}`} className="block mt-3">
          {/* Use cn to optionally set a classname 'font-kalpurush' if the text is in bengali */}
          {/* <h2 className=" text-lg md:text-xl font-semibold line-clamp-2 group-hover:underline">
            {article.title}
          </h2> */}
          <h2 className={cn("text-lg md:text-xl font-semibold line-clamp-2 group-hover:underline", isBengali && "font-kalpurush")}>
            {article.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span>{article.author.name}</span>
            <span className="mx-2">•</span>
            <time dateTime={article.publishedAt}>{article.publishedAt}</time>
          </div>
        </Link>
      </div>
    </article>
  );
}