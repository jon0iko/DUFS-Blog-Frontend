"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen, Tag } from "lucide-react";
import { Article } from "@/types";
import { getFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ArticleRightSidebarProps {
  article: Article;
}

export default function ArticleRightSidebar({ article }: ArticleRightSidebarProps) {
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
                  "w-full text-center py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 shadow-xl dark:shadow-xl dark:shadow-accent/30",
                  "bg-black text-white",
                  getFontClass(article.category.Name),
                )}
              >
                {article.category.Name}
              </div>
            </Link>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Click to explore more
            </p>
          </div>
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
