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
import { getFontClass } from '@/lib/fonts';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';//import DOMPurify from 'dompurify';


function IssuesInner() {
  const searchParams = useSearchParams();
  const pubId = useMemo(() => searchParams.get('pub') || '', [searchParams]);

  const [publication, setPublication] = useState<Publication | null>(null);
  const [issues, setIssues] = useState<Publication_Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const handleBack = () => {
    router.back();
  }

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
    <div className="min-h-screen relative bg-background">
      {/* Consistent background pattern with main site */}
      <div
        className="pointer-events-none absolute inset-0 select-none z-0 dark:hidden"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden select-none z-0 dark:block"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="container relative z-10 pt-8 pb-24">
        {/* Navigation */}
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Publication Header */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {/* Cover Image */}
            {publication.Image && (
              <div className="relative w-full max-w-[220px] md:max-w-[320px] h-auto flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={getStrapiMediaUrl(publication.Image)}
                  alt={publication.TitleEnglish}
                  width={320}
                  height={400}
                  className="w-full h-auto object-cover object-center"
                  sizes="(max-width: 768px) 220px, 320px"
                  priority
                />
              </div>
            )}

            {/* Text Content */}
            <div className="flex-1">
              <h1 
                className={`text-4xl md:text-6xl font-black tracking-tight mb-4 ${getFontClass(publication.TitleBangla)}`}
              >
                {publication.TitleBangla}
              </h1>
              <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-muted-foreground mb-6">
                {publication.TitleEnglish}
              </p>
              {publication.Description && (
                <div 
                  className={`text-foreground text-lg md:text-2xl prose prose-invert max-w-none ${getFontClass(publication.Description)}`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(marked.parse(publication.Description, { gfm: true, breaks: false, async: false }) as string)
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Issues Section */}
        <div className="py-8 border-t border-dashed border-foreground">
          {issues.length > 0 ? (
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight mb-8 ${getFontClass('Issues')}`}>Issues</h2>
          ) : <></>}

        {/* Issues Grid */}
        {issues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 justify-items-center sm:justify-items-start">
            {issues.map((issue) => (
              <Link 
                key={issue.documentId} 
                href={`/issue?id=${issue.documentId}`}
                className="group flex h-full w-full max-w-[260px] flex-col overflow-hidden rounded-lg border border-border bg-card/50 transition-all duration-300 hover:border-foreground/20"
              >
                {/* Cover Image */}
                <div className="relative h-[320px] w-full overflow-hidden bg-muted/70 p-2">
                  {issue.CoverImage ? (
                    <Image
                      src={getStrapiMediaUrl(issue.CoverImage)}
                      alt={issue.Title}
                      fill
                      className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 260px, (max-width: 1200px) 240px, 260px"
                    />
                  ) : publication.Image ? (
                    <Image
                      src={getStrapiMediaUrl(publication.Image)}
                      alt={publication.TitleEnglish}
                      fill
                      className="object-contain object-center opacity-80"
                      sizes="(max-width: 768px) 260px, (max-width: 1200px) 240px, 260px"
                    />
                  ) : null}
                </div>
                
                {/* Metadata */}
                <div className="flex flex-1 flex-col p-4">
                  <time className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {new Date(issue.PublishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </time>
                  <h3 className={`line-clamp-2 text-base pl-1 font-semibold text-foreground transition-colors group-hover:text-primary ${getFontClass(issue.Title)}`}>
                    {issue.Title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-8 rounded-lg ">
            <p className="text-foreground text-lg md:text-xl">Contents for this publication will be uploaded soon!</p>
          </div>
        )}
        </div>
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