'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { strapiAPI } from '@/lib/api';
import { getArticleData, getStrapiMediaUrl } from '@/lib/strapi-helpers';
import { getFontClass, getFontClassMono, isPureBengaliText } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Publication_Issue, Article } from '@/types';
import { ChevronLeft, FolderOpen, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleCard from '@/components/home/ArticleCard';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';//import DOMPurify from 'dompurify';

// Collapsible section component
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 pl-1 pr-3 flex items-center justify-between group hover:bg-foreground/10 dark:hover:bg-muted/50 transition-colors"
      >
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-left">{title}</h2>
        <ChevronDown
          className={cn(
            "w-7 h-7 text-foreground transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>
      {isOpen && <div className="pb-6">{children}</div>}
    </div>
  );
}

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

  // Collect metadata fields to display
  const metadataFields = useMemo(() => {
    if (!issue) return [];
    const fields: Array<{ label: string; value: string }> = [];
    
    if (issue.Year) fields.push({ label: 'Year', value: issue.Year });
    if (issue.PublishedDate) {
      const date = new Date(issue.PublishedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      fields.push({ label: 'Date', value: date });
    }
    if (issue.Editor) fields.push({ label: 'Editor', value: issue.Editor });
    if (issue.CoverDesigner) fields.push({ label: 'Cover Designer', value: issue.CoverDesigner });
    if (issue.Designer) fields.push({ label: 'Designer', value: issue.Designer });
    if (issue.Imprint) fields.push({ label: 'Imprint', value: issue.Imprint });
    if (issue.PageNumber) fields.push({ label: 'Pages', value: issue.PageNumber });
    if (issue.Price) fields.push({ label: 'Price', value: issue.Price });
    
    return fields;
  }, [issue]);

  // Helper to get font size based on text language
  const getFontSize = (text: string): string => {
    return isPureBengaliText(text) ? 'text-base md:text-lg' : 'text-sm md:text-base';
  };

  const gefontSizeSection = (text: string): string => {
    return isPureBengaliText(text) ? 'text-lg md:text-xl' : 'text-base md:text-lg';
  }



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
      {/* Consistent background pattern */}
      <div
        className="pointer-events-none absolute inset-0 select-none z-0 dark:hidden opacity-50"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden select-none z-0 dark:block opacity-50"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "1667px 1200px",
        }}
      />

      <div className="container relative z-10 pt-4 md:pt-8 pb-24">
        {/* Navigation */}
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground mb-4 md:mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* ZONE 1: Hero - Cover Reveal */}
        <div className="mb-8">
          {/* Two-column layout for md and up */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:items-start">
            {/* Left column (40% on lg) - Cover with drop shadow */}
            <div className="lg:col-span-2 flex flex-col items-center">
              {/* Publication Category - Centered above cover */}
              {issue.publication && (
                <Link
                  href={`/issues?pub=${issue.publication.documentId}`}
                  className="mb-6"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <FolderOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                    <span className={cn("text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors", getFontClass(issue.publication.TitleEnglish || ""))}>
                      {issue.publication.TitleEnglish}
                    </span>
                  </div>
                </Link>
              )}

              {issue.CoverImage && (
                <div className="w-4/5 md:w-3/5 lg:w-3/5 mb-6 rounded-lg border border-border overflow-hidden transition-transform duration-300 hover:scale-105" 
                     style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                  <Image
                    src={getStrapiMediaUrl(issue.CoverImage)}
                    alt={issue.Title}
                    width={350}
                    height={400}
                    className="w-auto h-auto object-cover"
                    priority
                  />
                </div>
              )}
              
              {/* Publication label below cover */}
              

              {/* Press stamp style CTA */}
              <div className="text-center py-3 px-4 rounded"
                   style={{ 
                     fontWeight: 600,
                     letterSpacing: '0.05em'
                   }}>
                <p className="text-xs text-foreground/70">COLLECT FROM</p>
                <Link href='https://maps.app.goo.gl/rnMDozdXV11Xpg327' className="text-lg underline hover:no-underline font-black text-foreground" target="_blank" rel="noopener noreferrer">DUFS ROOM</Link>
              </div>
            </div>

            {/* Right column (60% on lg) - Title, divider, metadata */}
            <div className="lg:col-span-3 flex flex-col lg:mt-24">
              {/* Issue title */}
              <h1 className={cn(
                "text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-foreground",
                getFontClass(issue.Title || "")
              )}>
                {issue.Title}
              </h1>

              {/* Thin divider */}
              <div className="w-12 h-1 bg-border mb-8" />

              {/* Metadata colophon - Two column layout */}
              {metadataFields.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {metadataFields.map((field) => (
                      <div key={field.label}>
                        <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          {field.label}
                        </dt>
                        <dd className={cn("font-bold text-foreground", getFontClassMono(field.value), getFontSize(field.value))}>
                          {field.value}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ZONE 2: Editorial (if present) */}
        {issue.Editorial && (
          <CollapsibleSection title="Editorial">
            <div 
              className={`prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground max-w-none px-3 ${gefontSizeSection(issue.Editorial)} ${getFontClass(issue.Editorial)}`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(issue.Editorial, { gfm: true, breaks: false, async: false }) as string)
              }}
            />
          </CollapsibleSection>
        )}

        {/* ZONE 3: Table of Contents (if present) */}
        {issue.TableOfContents && (
          <CollapsibleSection title="Contents">
            <div 
              className={`prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground max-w-none px-3 ${getFontClass(issue.TableOfContents)} ${gefontSizeSection(issue.TableOfContents)}`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(issue.TableOfContents, { gfm: true, breaks: false, async: false }) as string)
              }}
            />
          </CollapsibleSection>
        )}

        {/* ZONE 4: Digital Pieces */}
        {pieces && pieces.length > 0 && (
          <div className="border-t border-border pt-12">
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

        {/* Final Banner: Closing CTA with blurred background */}
        {issue.CoverImage && (
          <div className="mt-24 rounded-lg overflow-hidden relative">
            {/* Content overlay */}
            <div className="relative z-10 px-6 md:px-12 pt-12 md:pt-16 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                Want to read the whole publication?
              </h3>
              <p className="text-lg md:text-xl font-bold text-foreground/90">
                Collect your copy from the{" "}
                <Link href='https://maps.app.goo.gl/rnMDozdXV11Xpg327' className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                  DUFS Room
                </Link>
              </p>
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