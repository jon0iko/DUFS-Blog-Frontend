"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getFontClass } from "@/lib/fonts";

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
  language: "en" | "bn" | "both";
}

interface ArticleCardProps {
  article: ArticleCardData;
  imageHeight?: string;
  forceBlackText?: boolean;
}

export default function ArticleCard({
  article,
  forceBlackText = false,
}: ArticleCardProps) {
  const titleFontClass = getFontClass(article.title);
  const excerptFontClass = getFontClass(article.excerpt);
  const categoryFontClass = getFontClass(article.category);
  const authorfontclass = getFontClass(article.author.name);

  return (
    <article className="flex flex-col h-full">
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="group">
          <Link
            href={`/read-article?slug=${article.slug}`}
            className="block mt-3"
          >
            <div
              className={`relative aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-md shadow`}
            >
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute top-0 left-0 m-2">
                <span
                  className={cn(
                    "bg-black text-white text-xs px-2 py-1 uppercase font-medium rounded-2xl",
                    categoryFontClass,
                  )}
                >
                  {article.category}
                </span>
              </div>
            </div>
          </Link>

          <Link
            href={`/read-article?slug=${article.slug}`}
            className="block mt-3"
          >
            <h2
              className={cn(
                "text-lg md:text-xl font-semibold line-clamp-2 group-hover:underline px-1 tracking-tight",
                forceBlackText ? "text-gray-900" : "text-foreground",
                titleFontClass,
              )}
            >
              {article.title}
            </h2>
            <p
              className={cn(
                "mt-2 text-sm line-clamp-3 font-normal px-1",
                forceBlackText
                  ? "text-gray-600"
                  : "text-gray-600 dark:text-gray-300",
                excerptFontClass,
              )}
            >
              {article.excerpt}
            </p>
          </Link>
        </div>
        <div
          className={cn(
            "mt-3 flex items-center text-xs px-1",
            forceBlackText
              ? "text-gray-500"
              : "text-gray-500 dark:text-gray-400",
          )}
        >
          {article.author.slug ? (
            <Link
              href={`/author?slug=${article.author.slug}`}
              className={cn(
                "hover:text-primary hover:underline transition-colors",
                authorfontclass,
              )}
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
