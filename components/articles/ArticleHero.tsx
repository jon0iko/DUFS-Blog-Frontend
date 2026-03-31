"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Eye, FolderOpen, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";
import { getFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ArticleHeroProps {
  article: Article;
  imageUrl: string;
  authorAvatar?: string;
  authorName?: string;
  publishedDate: string;
  shortPublishedDate: string;
  viewCount: number;
  isPublicationAuthor?: boolean;
}

export default function ArticleHero({
  article,
  imageUrl,
  authorAvatar,
  authorName,
  publishedDate,
  shortPublishedDate,
  viewCount,
  isPublicationAuthor = false,
}: ArticleHeroProps) {
  return (
    <>
      {/* ── MOBILE ARTICLE HEADER (below lg breakpoint) ── */}
      <div className={cn("lg:hidden bg-background px-4 pt-5", article.featuredImage && "min-h-[70vh]")}>
        {article.category && (
          <Link
            href={`/browse/?category=${article.category.Slug}`}
            className="inline-flex items-center gap-1.5 mb-3"
          >
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground transition-colors",
                getFontClass(article.category.Name),
              )}
            >
              {article.category.Name}
              {article.category.nameEn && (
                <span className="font-montserrat text-muted-foreground text-xs"> {"("}{article.category.nameEn}{")"}</span>
              )}
            </span>
          </Link>
        )}

        <h1
          className={cn(
            "text-4xl font-bold leading-snug text-foreground mb-4",
            getFontClass(article.title),
          )}
        >
          {article.title}
        </h1>

        {article.author && (
          <Link
            href={`/author?slug=${article.author.slug}`}
            className="flex items-center gap-2.5 mb-4"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
              <Image
                src={authorAvatar || "/images/avatarPlaceholder.png"}
                alt={article.author.Name}
                fill
                className="object-cover"
              />
            </div>
            <span
              className={cn(
                "text-sm font-semibold text-foreground truncate",
                getFontClass(article.publication_author_name || article.author.Name),
              )}
            >
              {article.publication_author_name || article.author.Name}
            </span>          </Link>
        )}

        {!article.author && authorName && (
          <div className="flex items-center gap-2.5 mb-4">
            <span
              className={cn(
                "text-sm font-semibold text-foreground",
                getFontClass(authorName),
              )}
            >
              {authorName}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground pb-4 mb-3">
          {(article.BlogDate || article.publishedAt) && shortPublishedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{shortPublishedDate}</span>
            </div>
          )}
          {(article.BlogDate || article.publishedAt) && (
            <span className="text-muted-foreground/40">•</span>
          )}
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{viewCount.toLocaleString()} views</span>
          </div>
        </div>

        {article.featuredImage && (
          <div className="lg:hidden w-full aspect-video relative bg-muted rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.featuredImage?.alternativeText || article.title}
              fill
              className="object-contain"
              priority
            />
            <div
              className="absolute inset-0 mix-blend-overlay opacity-15"
              style={{ backgroundImage: `url(/images/GrainTexture.webp)` }}
            />
          </div>
        )}
      </div>

      {/* ── DESKTOP CINEMATIC HERO (hidden on mobile) ── */}
      <div className="hidden lg:block relative h-[83vh] min-h-[510px] bg-black overflow-hidden">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="object-cover opacity-60"
          priority
        />

        <div
          className="absolute inset-0 mix-blend-overlay opacity-15"
          style={{ backgroundImage: `url(/images/GrainTexture.webp)` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="container max-w-7xl mx-auto px-4 pb-16">
            <div className="max-w-5xl">
              <h1
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight",
                  getFontClass(article.title),
                )}
              >
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-lg text-gray-300">
                {article.author && (
                  <Link
                    href={`/author?slug=${article.author.slug}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {authorAvatar && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                        <Image
                          src={authorAvatar}
                          alt={article.author.Name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span
                        className={cn(
                          "font-medium text-white hover:underline",
                          getFontClass(article.publication_author_name || article.author.Name),
                        )}
                      >
                        {article.publication_author_name || article.author.Name}
                      </span>
                    </div>
                  </Link>
                )}

                {!article.author && authorName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span
                      className={cn(
                        "font-medium text-white",
                        getFontClass(authorName),
                      )}
                    >
                      {authorName}
                    </span>
                  </div>
                )}

                {(article.BlogDate || article.publishedAt) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{publishedDate}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
