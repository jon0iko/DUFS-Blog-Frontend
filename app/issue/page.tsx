'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { strapiAPI } from '@/lib/api';
import { getArticleData, getStrapiMediaUrl } from '@/lib/strapi-helpers';
import { getFontClass } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Publication_Issue, Article } from '@/types';
import { ChevronLeft, FolderOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleCard from '@/components/home/ArticleCard';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function IssueInner() {
  const searchParams = useSearchParams();
  const issueId = useMemo(() => searchParams.get('id') || searchParams.get('issue') || '', [searchParams]);

  const [issue, setIssue] = useState<Publication_Issue | null>(null);
  const [pieces, setPieces] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;

    const fetchIssueAndPieces = async () => {
      setLoading(true);
      try {
        const [issueData, articlesRes] = await Promise.all([
          strapiAPI.getIssueWithPieces(issueId),
          strapiAPI.getArticlesByIssue(issueId)
        ]);
        
        if (issueData) {
          setIssue(issueData);
        }
        if (articlesRes && articlesRes.data) {
          setPieces(articlesRes.data);
          console.log('Fetched pieces for issue:', articlesRes.data);
        }
      } catch (err) {
        console.error('Failed to load issue or pieces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueAndPieces();
  }, [issueId]);

  if (!issueId) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">No Issue Specified</h1>
        <p className="text-muted-foreground mb-8">Please provide an issue ID to view its pieces.</p>
        <Link href="/publications" className="inline-flex items-center gap-2 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Publications
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-24">
        <div className="animate-pulse space-y-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Issue Not Found</h1>
        <Link href="/publications" className="inline-flex items-center gap-2 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Publications
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background">
      {/* Consistent background pattern with main site */}
      <div
        className="pointer-events-none absolute inset-0 select-none z-0 dark:hidden opacity-30"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden select-none z-0 dark:block opacity-30"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "1667px 1200px",
        }}
      />

      <div className="container relative z-10 pt-16 pb-24">
        {/* Navigation */}
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground mb-12 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Header Section */}
        <div className="mb-16">
          <div className="flex flex-col gap-6 md:gap-8 items-center justify-center text-center max-w-2xl mx-auto">
            {/* Publication Header */}
            {issue.publication && (
              <Link
                href={`/issues?pub=${issue.publication.documentId}`}
                className="inline-flex items-center gap-1.5 mb-3"
              >
                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={cn("text-sm text-muted-foreground hover:text-foreground transition-colors", getFontClass(issue.publication.TitleEnglish || ""))}>
                  {issue.publication.TitleEnglish}
                </span>
              </Link>
            )}

            {/* Cover Image */}
            {issue.CoverImage && (
              <div className="md:w-[220px] md:flex-shrink-0 h-64 md:h-80 rounded-lg border border-border overflow-hidden">
                <Image
                  src={getStrapiMediaUrl(issue.CoverImage)}
                  alt={issue.Title}
                  width={220}
                  height={320}
                  className="w-full h-full object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 220px"
                  priority
                />
              </div>
            )}
            
            {/* Text Content */}
            <div className="flex flex-col justify-center items-center">
              <time className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Published: {new Date(issue.PublishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
              <p className="text-foreground/90 text-base md:text-lg font-black leading-relaxed">
                This publication is available in print.<br></br> To read the complete issue, collect it from the DUFS Room.
              </p>
            </div>
          </div>
        </div>

        {/* Details / Index */}
        {issue.Details && (
          <div className="mb-0 py-12 border-t border-border">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8">Contents</h2>
            <div 
              className={`prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground max-w-none text-xl md:text-xl ${getFontClass(issue.Details)}`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(issue.Details, { gfm: true, breaks: false, async: false }) as string)
              }}
            />
          </div>
        )}

        {/* Digital Pieces */}
        {pieces && pieces.length > 0 && (
          <div className="py-12 border-t border-border">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8">Digital Pieces</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pieces.map((piece) => {
                const articleData = getArticleData(piece);
                if (!articleData) return null;
                
                return (
                  <ArticleCard key={piece.documentId} article={articleData} />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IssuePage() {
  return (
    <Suspense fallback={
      <div className="container py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    }>
      <IssueInner />
    </Suspense>
  );
}