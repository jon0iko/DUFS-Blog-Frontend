"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getFontClass } from "@/lib/fonts";
import { useState } from "react";

interface ArticleCardData {
  id: number | string;
  title: string;
  slug: string;
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
  showcategoryenglish?: boolean;
}

export default function ArticleCard({
  article,
  forceBlackText = false,
}: ArticleCardProps) {
  const titleFontClass = getFontClass(article.title);
  const categoryFontClass = getFontClass(article.category);
  console.log("the category font for this article ",article.title, "is ", categoryFontClass);
  const authorfontclass = getFontClass(article.author.name);
  let isauthornamebn, iscategorynamebn;
  if (authorfontclass == 'font-kalpurush') {
    isauthornamebn = true;
  }
  else {
    isauthornamebn = false;
  }

  if (categoryFontClass == 'font-kalpurush') {
    iscategorynamebn = true;
  }
  else {
    iscategorynamebn = false;
  }

  return (
    <article className="flex flex-col h-full">
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="group">
          <Link
            href={`/read-article?slug=${article.slug}`}
            className="block mt-3"
          >
            <div
              className={cn("relative aspect-video rounded-xl overflow-hidden mb-4",
                forceBlackText ? 'drop-shadow-lg' : 'shadow-md'
              )}
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
                    "bg-black text-white px-2 tracking-tighter uppercase font-bold rounded-full",
                    categoryFontClass,
                    iscategorynamebn ? 'text-sm py-0' : 'text-xs py-1'
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
                "text-lg md:text-xl font-semibold line-clamp-3 group-hover:underline px-1 tracking-tight",
                forceBlackText ? "text-gray-900" : "text-foreground",
                titleFontClass,
              )}
            >
              {article.title}
            </h2>
            {/* <p
              className={cn(
                "mt-2 text-sm line-clamp-3 font-normal px-1",
                forceBlackText
                  ? "text-gray-600"
                  : "text-gray-600 dark:text-gray-300",
                excerptFontClass,
              )}
            >
              {article.excerpt}
            </p> */}
          </Link>
        </div>
        <div
          className={cn(
            "mt-1 flex items-center px-1",
            forceBlackText
              ? "text-gray-500"
              : "text-gray-500 dark:text-gray-300"
          )}
        >
          {article.author.slug ? (
            <Link
              href={`/author?slug=${article.author.slug}`}
              className={cn(
                "transition-colors",
                forceBlackText ? "hover:text-black" : "hover:text-foreground",
                authorfontclass,
                isauthornamebn ? 'text-base' : 'text-sm'
              )}
            >
              {article.author.name}
            </Link>
          ) : (
            <span className={`transition-colors ${authorfontclass}`}>
              {article.author.name}
            </span>
          )}
          <span className="mx-2">•</span>
          <time dateTime={article.publishedAt} className="text-sm">{article.publishedAt}</time>
        </div>
      </div>
    </article>
  );
}
