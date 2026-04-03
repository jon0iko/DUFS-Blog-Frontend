"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FolderOpen, Tag } from "lucide-react";
import { Article } from "@/types";
import { getFontClass } from "@/lib/fonts";
import { getStrapiMediaUrl } from "@/lib/strapi-helpers";
import { cn } from "@/lib/utils";

interface ArticleRightSidebarProps {
  article: Article;
  publicationIssue?: Article["publication_issue"];
}

export default function ArticleRightSidebar({ article, publicationIssue }: ArticleRightSidebarProps) {
  return (
    <aside className="hidden xl:block self-start sticky top-24">
      <div className="space-y-4">
        {/* Category */}
        {article.category && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Category</span>
            </div>
            <Link href={`/browse?category=${article.category.Slug}`} className="block">
              <div
                className={cn(
                  "w-full text-center py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-opacity opacity-80 hover:opacity-100 shadow-xl dark:shadow-xl",
                  "bg-black text-white",
                  getFontClass(article.category.Name),
                )}
              >
                {article.category.nameBn}
                {article.category.nameEn && (
                <span className="font-montserrat text-xs"> {" / "}{article.category.nameEn}</span>
              )}
              </div>
            </Link>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Click to explore more
            </p>
          </div>
        )}

        {/* Publication issue */}
        {publicationIssue && (
          <Link
            href={`/issue?id=${publicationIssue.documentId}`}
            className="block group"
          >
            <div className="border border-border rounded-lg overflow-hidden hover:border-foreground transition-colors">
              <div className="flex gap-3">
                {publicationIssue.CoverImage && (
                  <div className="relative w-20 h-28 flex-shrink-0 bg-muted">
                    <Image
                      src={getStrapiMediaUrl(publicationIssue.CoverImage)}
                      alt={publicationIssue.Title}
                      fill
                      className="object-contain object-center opacity-95 group-hover:opacity-100 transition-opacity p-1.5"
                    />
                  </div>
                )}

                <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                    Published In
                  </p>
                  <h4
                    className={cn(
                      "font-semibold pl-1 text-foreground text-sm group-hover:text-primary transition-colors line-clamp-3",
                      getFontClass(publicationIssue.Title),
                    )}
                  >
                    {publicationIssue.Title}
                  </h4>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/browse?search=${encodeURIComponent(tag.name)}&category=all`}
                >
                  <span className="inline-block text-xs px-2.5 py-1 rounded-md border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer">
                    #{tag.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
