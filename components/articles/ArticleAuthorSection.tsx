"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Author } from "@/types";
import { getFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ArticleAuthorSectionProps {
  author: Author;
  authorAvatar?: string;
}

export default function ArticleAuthorSection({
  author,
  authorAvatar,
}: ArticleAuthorSectionProps) {
  return (
    <div className="mt-10">
      {/* Mobile author section */}
      <div className="lg:hidden border-t border-border pt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Written By
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/author?slug=${author.slug}`}
            className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-border block"
          >
            <Image
              src={authorAvatar || "/images/avatarPlaceholder.png"}
              alt={author.Name}
              fill
              className="object-cover"
            />
          </Link>
          <Link href={`/author?slug=${author.slug}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-lg font-bold text-foreground",
                getFontClass(author.Name),
              )}
            >
              {author.Name}
            </h3>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-full px-5"
            asChild
          >
            <Link href={`/author?slug=${author.slug}`}>Subscribe</Link>
          </Button>
        </div>
      </div>

      {/* Desktop author section — Medium-like aesthetic */}
      <div className="hidden lg:block border-t border-b pb-8 border-border pt-8">
        <div className="flex items-start gap-5">
          <Link
            href={`/author?slug=${author.slug}`}
            className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-border hover:border-primary transition-colors block"
          >
            <Image
              src={authorAvatar || "/images/avatarPlaceholder.png"}
              alt={author.Name}
              fill
              className="object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
              Written by
            </p>
            <Link href={`/author?slug=${author.slug}`}>
              <h3
                className={cn(
                  "text-xl font-bold text-foreground hover:text-primary transition-colors",
                  getFontClass(author.Name),
                )}
              >
                {author.Name}
              </h3>
            </Link>
            {author.Bio && (
              <p
                className={cn(
                  "text-sm text-muted-foreground mt-2 line-clamp-3",
                  getFontClass(author.Bio),
                )}
              >
                {author.Bio}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-md px-5 mt-6 border-foreground shadow-lg dark:shadow-lg dark:shadow-accent/40"
            asChild
          >
            <Link href={`/author?slug=${author.slug}`}>Subscribe</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
