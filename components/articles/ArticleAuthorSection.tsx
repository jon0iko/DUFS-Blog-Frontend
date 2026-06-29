"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { Author, Publication_Issue } from "@/types";
import { getFontClass } from "@/lib/fonts";
import { getStrapiMediaUrl } from "@/lib/strapi-helpers";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const displayName = publicationAuthorName || author?.Name;
  // Prefer the Author entity's Bio (matches the author page); fall back to the
  // linked user's self-written bio so bios added via /account always show.
  const bio = author?.Bio || author?.users_permissions_user?.Bio;
  const isbioinbangla = getFontClass(bio || "") === "font-kalpurush";

  // Is the logged-in reader the author of this piece? Used to nudge them to add
  // a bio when it's missing — the reader-facing card stays clean for everyone else.
  const linkedUserId = author?.users_permissions_user?.id;
  const isOwner =
    !!user && linkedUserId != null && user.id === linkedUserId;

  /**
   * Renders the bio when present, or — for the author viewing their own,
   * bio-less article — an inviting prompt to write one.
   */
  const BioOrPrompt = ({ variant }: { variant: "mobile" | "desktop" }) => {
    if (bio) {
      return (
        <p
          className={cn(
            "text-foreground/75 line-clamp-3",
            getFontClass(bio),
            isbioinbangla
              ? variant === "desktop"
                ? "text-lg"
                : "text-base"
              : variant === "desktop"
                ? "text-base"
                : "text-sm",
          )}
        >
          {bio}
        </p>
      );
    }

    if (isOwner) {
      return (
        <Link
          href="/account"
          className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          <PenLine className="w-3.5 h-3.5 flex-shrink-0" />
          Add a bio so readers can get to know you
        </Link>
      );
    }

    return null;
  };

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
        <div className="lg:hidden">
          <PublicationIssueCard />
        </div>
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
        <div className="flex items-start gap-3">
          <Link
            href={`/author?slug=${author.slug}`}
            className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-border block"
          >
            <Image
              src={authorAvatar || "/images/avatarPlaceholder.png"}
              alt={displayName!}
              fill
              className="object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/author?slug=${author.slug}`} className="block">
              <h3
                className={cn(
                  "text-lg font-bold text-foreground",
                  getFontClass(displayName!),
                )}
              >
                {displayName}
              </h3>
            </Link>
            <BioOrPrompt variant="mobile" />
          </div>
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
              alt={displayName!}
              fill
              className="object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Written by
            </p>
            <Link href={`/author?slug=${author.slug}`}>
              <h3
                className={cn(
                  "text-xl font-bold text-foreground hover:text-primary transition-colors",
                  getFontClass(displayName!),
                )}
              >
                {displayName}
              </h3>
            </Link>
            <BioOrPrompt variant="desktop" />
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <PublicationIssueCard />
      </div>
    </div>
  );
}
