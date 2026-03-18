'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { strapiAPI } from '@/lib/api';
import { getStrapiMediaUrl } from '@/lib/strapi-helpers';
import type { Publication, Publication_Issue } from '@/types';
import { derivePublicationPalette } from '@/lib/publication-colors';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function IssuesInner() {
  const searchParams = useSearchParams();
  const pubId = useMemo(() => searchParams.get('pub') || '', [searchParams]);

  const [publication, setPublication] = useState<Publication | null>(null);
  const [issues, setIssues] = useState<Publication_Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubId) return;

    const fetchIssues = async () => {
      setLoading(true);
      try {
        const pubData = await strapiAPI.getPublicationByDocumentId(pubId);
        if (pubData) setPublication(pubData);

        const issuesRes = await strapiAPI.getIssuesByPublication(pubId);
        if (issuesRes.data) {
          setIssues(issuesRes.data);
        }
      } catch (err) {
        console.error('Failed to load issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [pubId]);

  if (!pubId) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">No Publication Specified</h1>
        <p className="text-muted-foreground mb-8">Please provide a publication ID to view its issues.</p>
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
          <Skeleton className="h-32 w-full max-w-2xl mx-auto rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Publication Not Found</h1>
        <Link href="/publications" className="inline-flex items-center gap-2 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Publications
        </Link>
      </div>
    );
  }

  const palette = derivePublicationPalette(publication.Color);

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
        <Link href="/publications" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Publications
        </Link>

        {/* Publication Header */}
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
          <span className="block w-12 h-1 mb-6 rounded-full" style={{ backgroundColor: palette.spineColor }} />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 font-kalpurush" style={{ color: palette.titleColor }}>
            {publication.TitleBangla}
          </h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
            {publication.TitleEnglish}
          </p>
          {publication.Description && (
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-medium">
              {publication.Description}
            </p>
          )}
        </div>

        {/* Issues Grid */}
        {issues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue) => (
              <Link 
                key={issue.documentId} 
                href={`/issue?id=${issue.documentId}`}
                className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden flex items-center justify-center p-6">
                  {issue.CoverImage ? (
                    <Image
                      src={getStrapiMediaUrl(issue.CoverImage)}
                      alt={issue.Title}
                      fill
                      className="object-contain object-center drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : publication.Image ? (
                    <Image
                      src={getStrapiMediaUrl(publication.Image)}
                      alt={publication.TitleEnglish}
                      fill
                      className="object-contain object-center drop-shadow-2xl opacity-80 p-4"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-bold tracking-widest text-muted-foreground mb-2">
                    {new Date(issue.PublishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {issue.Title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-primary">
                    View Issue Content <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
            <p className="text-muted-foreground">This publication does not have any issues uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={
      <div className="container py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    }>
      <IssuesInner />
    </Suspense>
  );
}