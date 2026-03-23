"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Author, Publication_Issue } from "@/types";
import { getFontClass } from "@/lib/fonts";
import { getStrapiMediaUrl } from "@/lib/strapi-helpers";
import { cn } from "@/lib/utils";

interface ArticleAuthorSectionProps {
  author?: Author | null;
  authorAvatar?: string;
  publicationAuthorName?: string;
  publicationIssue?: Publication_Issue;
}

export default function ArticleAuthorSection({
  author,
  authorAvatar,
  publicationAuthorName,
  publicationIssue,
}: ArticleAuthorSectionProps) {
  const displayName = publicationAuthorName || author?.Name;

  const PublicationIssueCard = () => (
    publicationIssue && (
      <Link 
        href={`/issue?id=${publicationIssue.documentId}`}
        className="block mt-8 group"
      >
        <div className="border border-border rounded-lg overflow-hidden hover:border-foreground transition-colors">
          <div className="flex gap-4">
            {/* Image on left */}
            {publicationIssue.CoverImage && (
              <div className="relative w-32 h-40 flex-shrink-0 bg-muted">
                <Image
                  src={getStrapiMediaUrl(publicationIssue.CoverImage)}
                  alt={publicationIssue.Title}
                  fill
                  className="object-contain object-center opacity-95 group-hover:opacity-100 transition-opacity p-2"
                />
              </div>
            )}
            
            {/* Text on right */}
            <div className="flex-1 p-4 flex flex-col justify-center">
              <p className="text-xs pl-1 font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Published In
              </p>
              <h4 className={cn(
                "font-semibold pl-1 text-foreground text-xl group-hover:text-primary transition-colors line-clamp-3",
                getFontClass(publicationIssue.Title)
              )}>
                {publicationIssue.Title}
              </h4>
            </div>
          </div>
        </div>
      </Link>
    )
  );

  // Publication author section (no profile, just a name)
  if (!author && publicationAuthorName) {
    return (
      <div className="mt-10">
        <div className="border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Written By
          </p>
          <h3
            className={cn(
              "text-xl font-bold text-foreground",
              getFontClass(publicationAuthorName),
            )}
          >
            {publicationAuthorName}
          </h3>
        </div>
        <PublicationIssueCard />
      </div>
    );
  }

  if (!author) {
    return null;
  }

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
              alt={displayName}
              fill
              className="object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/author?slug=${author.slug}`} className="block">
              <h3
                className={cn(
                  "text-lg font-bold text-foreground",
                  getFontClass(displayName),
                )}
              >
                {displayName}
              </h3>
            </Link>
          </div>
          {/* <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-full px-5"
            asChild
          >
            <Link href={`/author?slug=${author.slug}`}>Subscribe</Link>
          </Button> */}
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
              alt={displayName}
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
                  getFontClass(displayName),
                )}
              >
                {displayName}
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
          {/* <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-md px-5 mt-6 border-foreground shadow-lg dark:shadow-lg dark:shadow-accent/40"
            asChild
          >
            <Link href={`/author?slug=${author.slug}`}>Subscribe</Link>
          </Button> */}
        </div>
      </div>

      <PublicationIssueCard />
    </div>
  );
}
