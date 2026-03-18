'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { strapiAPI } from '@/lib/api';
import { getStrapiMediaUrl, getArticleData } from '@/lib/strapi-helpers';
import type { Publication_Issue, Article } from '@/types';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleCard from '@/components/home/ArticleCard';
import ArticleHTMLContent from '@/components/articles/ArticleHTMLContent';

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
    <div className="min-h-screen pb-24 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div
        className="pointer-events-none absolute -inset-52 select-none z-0 dark:hidden opacity-50"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="bg-pattern-dark pointer-events-none absolute -inset-52 hidden select-none z-0 dark:block opacity-50"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "1667px 1200px",
        }}
      />

      <div className="container relative z-10 pt-16">
        {/* Navigation */}
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Issues
        </button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start mb-16 bg-card p-8 rounded-2xl border border-border shadow-md">
          {issue.CoverImage && (
            <div className="relative w-full max-w-[280px] aspect-[3/4] flex-shrink-0 drop-shadow-2xl rounded-sm overflow-hidden">
              <Image
                src={getStrapiMediaUrl(issue.CoverImage)}
                alt={issue.Title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest mb-6 w-max border border-border">
              <BookOpen className="w-3.5 h-3.5" /> Published {new Date(issue.PublishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-foreground">
              {issue.Title}
            </h1>
            
            {/* Action Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
              <p className="text-foreground font-semibold text-base md:text-lg flex items-start gap-3">
                To read the complete publication and view all pieces, please collect your physical copy from the DUFS Room.
              </p>
            </div>
          </div>
        </div>

        {/* Details / Index */}
        {issue.Details && (
          <div className="mb-20 max-w-4xl mx-auto bg-card rounded-2xl p-8 md:p-12 border border-border shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 border-b border-border pb-4">Inside this Issue</h2>
            <div className="prose dark:prose-invert prose-lg max-w-none">
              <ArticleHTMLContent content={issue.Details} fontSize="medium" />
            </div>
          </div>
        )}

        {/* Selected Writings */}
        {pieces && pieces.length > 0 && (
          <div className="mt-16">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Selected Writings</h2>
              <p className="text-muted-foreground max-w-2xl">
                A glimpse into the contents.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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