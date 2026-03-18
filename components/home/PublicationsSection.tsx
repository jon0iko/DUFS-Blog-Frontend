'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Publication } from '@/types';
import { getStrapiMediaUrl } from '@/lib/strapi-helpers';
import { derivePublicationPalette } from '../../lib/publication-colors';
import { gsap } from '@/lib/gsap';

interface PublicationsSectionProps {
  publications: Publication[];
  showViewAll?: boolean;
}

/* ─── Journal Spine ─────────────────────────────────────────────────────── */
// function JournalSpine({
//   titleEn,
//   spineColor,
// }: {
//   titleEn: string;
//   spineColor: string;
// }) {
//   return (
//     <div
//       className="absolute left-0 top-0 bottom-0 w-8 md:w-9 flex flex-col justify-between items-center py-4 md:py-5 z-20 rounded-tl-none rounded-bl-none"
//       style={{ backgroundColor: spineColor }}
//       aria-hidden="true"
//     >
//       <span className="block w-1.5 h-1.5 rounded-full bg-white/35" />
//       <span
//         className="text-white/50 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase whitespace-nowrap"
//         style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
//       >
//         {titleEn}
//       </span>
//       <span className="block w-1.5 h-1.5 rounded-full bg-white/35" />
//     </div>
//   );
// }

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function PublicationsSection({
  publications,
  showViewAll = false,
}: PublicationsSectionProps) {
  if (publications.length === 0) {
    return <div className="h-16 md:h-24" />;
  }

  return (
    <section className="relative py-16 md:py-24 px-4 bg-background z-20">
      <div className="container mb-10 md:mb-14">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground text-center uppercase">
            DUFS Publications
          </h2>
          <span className="mt-1 block w-8 h-px bg-border" />
        </div>
      </div>

      <div className="container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 lg:gap-9">
          {publications.map((pub, index) => {
            const isLastOdd =
              publications.length % 2 !== 0 &&
              index === publications.length - 1;
            return isLastOdd ? (
              <div
                key={pub.documentId}
                className="md:col-span-2 md:w-[calc(50%-0.875rem)] lg:w-[calc(50%-1.125rem)] md:mx-auto"
              >
                <PublicationCard publication={pub} />
              </div>
            ) : (
              <PublicationCard key={pub.documentId} publication={pub} />
            );
          })}
        </div>

        {showViewAll ? (
          <div className="mt-8 md:mt-10 flex justify-center">
            <Link
              href="/publications"
              className="inline-flex items-center gap-2 rounded-md border border-foreground/20 px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
function PublicationCard({ publication: pub }: { publication: Publication }) {
  const palette = derivePublicationPalette(pub.Color);
  const imageUrl = getStrapiMediaUrl(pub.Image);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion and mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || !containerRef.current) return;

    // Desktop animations only
    if (!isMobile && containerRef.current) {
      const container = containerRef.current;
      
      // Create timeline for hover animations
      const hoverTimeline = gsap.timeline({ paused: true });

      // Image scale down and fade
      if (imageRef.current) {
        hoverTimeline.to(imageRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.5,
          ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }, 0);
      }

      // Title move down slightly
      if (titleRef.current) {
        hoverTimeline.to(titleRef.current, {
          y: -8,
          duration: 0.5,
          ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }, 0);
      }

      // Highlight fade out
      if (highlightRef.current) {
        hoverTimeline.to(highlightRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        }, 0);
      }

      // Button fade and move in
      if (buttonRef.current) {
        const button = buttonRef.current.querySelector('span');
        if (button) {
          hoverTimeline.fromTo(button, {
            y: 16,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }, 0.1);
        }
      }

      // Add hover listeners
      container.addEventListener('mouseenter', () => {
        hoverTimeline.play();
      });

      container.addEventListener('mouseleave', () => {
        hoverTimeline.reverse();
      });

      return () => {
        container.removeEventListener('mouseenter', () => {});
        container.removeEventListener('mouseleave', () => {});
      };
    }
  }, []);
  return (
    <div
      className="w-full h-full"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '420px' }}
    >
      <Link
        href={`/publications`}
        className="group block w-full h-full"
      >
        {/* Mobile View */}
        <div 
          className="md:hidden relative flex flex-col overflow-hidden rounded-lg select-none mx-auto w-full max-w-[340px] max-h-[350px] shadow-xl border"
          style={{
            backgroundImage: `linear-gradient(140deg, ${palette.gradientStart}, ${palette.gradientMid}, ${palette.gradientEnd})`,
            borderColor: palette.borderColor,
          }}
        >
          {/* <JournalSpine titleEn={pub.TitleEnglish} spineColor={palette.spineColor} /> */}

           <div
            className="absolute inset-0 pointer-events-none z-[1] opacity-[0.1] mix-blend-overlay"
            style={{
              backgroundImage: 'url(/images/GrainTexture.webp)',
              backgroundRepeat: 'repeat',
              backgroundSize: '256px 256px',
            }}
          />

          {/* Radial Highlight Behind Image */}
          {/* <div
            className="absolute inset-0 z-[2] opacity-50 transition-opacity duration-700 pointer-events-none group-hover:opacity-0"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            }}
          /> */}
          
          <div className="relative flex-1 flex flex-col">
            {/* Mobile Highlight */}
            <div
              className="absolute inset-0 z-[1] opacity-40 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.12) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-4 pb-2">
              <div className="relative w-full h-[260px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]">
                <Image
                  src={imageUrl}
                  alt={`${pub.TitleEnglish} cover`}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 80vw, 32vw"
                />
              </div>
            </div>
            
            <div className="relative z-20 flex flex-col items-center text-center px-4 pb-6">
              <span className="block w-6 h-px bg-white/30 mb-2" />
              <h3 className="font-kalpurush text-2xl font-bold leading-tight mb-0.5 text-white">
                {pub.TitleBangla}
              </h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.25em]">
                {pub.TitleEnglish}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div
          ref={containerRef}
          className="hidden md:flex md:flex-col relative overflow-hidden rounded-lg select-none h-[540px] shadow-xl border transition-all duration-300 group-hover:shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(140deg, ${palette.gradientStart}, ${palette.gradientMid}, ${palette.gradientEnd})`,
            borderColor: palette.borderColor,
          }}
        >
          {/* <JournalSpine titleEn={pub.TitleEnglish} spineColor={palette.spineColor} /> */}

          {/* Base Light Grain */}
          <div
            className="absolute inset-0 pointer-events-none z-[1] opacity-[0.25] mix-blend-overlay"
            style={{
              backgroundImage: 'url(/images/GrainTexture.webp)',
              backgroundRepeat: 'repeat',
              backgroundSize: '256px 256px',
            }}
          />

          {/* Radial Highlight Behind Image */}
          <div
            ref={highlightRef}
            className="absolute inset-0 z-[2] opacity-50 transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            }}
          />

          {/* Hover Heavy Grain Overlay */}
          <div
            className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
            style={{
              background: palette.overlayColor || 'rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.5] mix-blend-overlay"
              style={{
                backgroundImage: 'url(/images/GrainTexture.webp)',
                backgroundRepeat: 'repeat',
                backgroundSize: '150px 150px',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 80%)',
              }}
            />
          </div>

          {/* Content Area */}
          <div className="relative z-20 flex-1 flex flex-col h-full">
            
            {/* Image & Button Area */}
            <div className="flex-1 flex items-center justify-center px-8 py-8 overflow-hidden relative">
              {/* Image */}
              <div ref={imageRef} className="relative w-full h-full max-h-[340px] drop-shadow-[0_24px_52px_rgba(0,0,0,0.88)] flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={`${pub.TitleEnglish} cover`}
                  fill
                  className="object-contain object-center"
                  sizes="32vw"
                />
              </div>

              {/* Hover Button */}
              <div ref={buttonRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-colors active:scale-[0.98] bg-white text-black opacity-0 group-hover:opacity-100 delay-[50ms] ease-out hover:bg-white/90">
                  Read Publication
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Title Area */}
            <div ref={titleRef} className="relative z-30 flex flex-col items-center text-center px-4 pb-8">
              <span className="block w-8 h-px bg-white/30 mb-3" />
              <h3
                className="font-kalpurush text-3xl lg:text-4xl font-bold leading-tight mb-1 text-white"
              >
                {pub.TitleBangla}
              </h3>
              <p className="text-white/60 text-[12px] font-bold uppercase tracking-[0.28em]">
                {pub.TitleEnglish}
              </p>
            </div>
            
          </div>
        </div>
      </Link>
    </div>
  );
}

