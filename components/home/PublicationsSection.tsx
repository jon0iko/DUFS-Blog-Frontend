'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Publication {
  id: string;
  titleBn: string;
  titleEn: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
  theme: {
    gradient: string;
    gradientDark: string;
    accentText: string;
    badge: string;
    btn: string;
    glow: string;
    borderHover: string;
    spineColor: string;
    overlayColor: string;
  };
}

const publications: Publication[] = [
  {
    id: 'agontuk',
    titleBn: 'আগন্তুক',
    titleEn: 'Agontuk',
    tagline: 'চলচ্চিত্র আলোচনার সংকলন পত্রিকা',
    description:
      '',
    image: '/images/agontuk.webp',
    href: '/browse?publication=agontuk',
    theme: {
      gradient: 'from-[#6b0d0d] via-[#8b1a1a] to-[#3d0606]',
      gradientDark: 'dark:from-[#3d0606] dark:via-[#5a0f0f] dark:to-[#1a0202]',
      accentText: 'text-red-200',
      badge:
        'bg-red-200/15 text-red-100 border border-red-300/25 backdrop-blur-sm',
      btn: 'bg-red-100 text-red-950 hover:bg-white hover:text-red-900',
      glow: 'hover:shadow-red-900/60',
      borderHover: 'hover:border-red-500/60',
      spineColor: 'bg-red-950/70',
      overlayColor: 'rgba(60,4,4,0.72)',
    },
  },
  {
    id: 'flashback',
    titleBn: 'ফ্ল্যাশব্যাক',
    titleEn: 'Flashback',
    tagline: 'পূর্ব ইউরোপীয় চলচ্চিত্র সংকলন',
    description:
      '',
    image: '/images/flashback.webp',
    href: '/browse?publication=flashback',
    theme: {
      gradient: 'from-[#1c1208] via-[#2e1e0a] to-[#0d0a05]',
      gradientDark: 'dark:from-[#0d0a05] dark:via-[#1c1208] dark:to-[#050402]',
      accentText: 'text-amber-200',
      badge:
        'bg-amber-200/15 text-amber-100 border border-amber-300/25 backdrop-blur-sm',
      btn: 'bg-amber-100 text-stone-950 hover:bg-white hover:text-amber-900',
      glow: 'hover:shadow-amber-900/50',
      borderHover: 'hover:border-amber-600/60',
      spineColor: 'bg-amber-950/70',
      overlayColor: 'rgba(28,18,4,0.75)',
    },
  },
  // {
  //   id: 'flashback',
  //   titleBn: 'ফ্ল্যাশব্যাক',
  //   titleEn: 'Flashback',
  //   tagline: 'পূর্ব ইউরোপীয় চলচ্চিত্র সংকলন',
  //   description:
  //     '',
  //   image: '/images/flashback.webp',
  //   href: '/browse?publication=flashback',
  //   theme: {
  //     gradient: 'from-[#1c1208] via-[#2e1e0a] to-[#0d0a05]',
  //     gradientDark: 'dark:from-[#0d0a05] dark:via-[#1c1208] dark:to-[#050402]',
  //     accentText: 'text-amber-200',
  //     badge:
  //       'bg-amber-200/15 text-amber-100 border border-amber-300/25 backdrop-blur-sm',
  //     btn: 'bg-amber-100 text-stone-950 hover:bg-white hover:text-amber-900',
  //     glow: 'hover:shadow-amber-900/50',
  //     borderHover: 'hover:border-amber-600/60',
  //     spineColor: 'bg-amber-950/70',
  //     overlayColor: 'rgba(28,18,4,0.75)',
  //   },
  // },
  // {
  //   id: 'agontuk',
  //   titleBn: 'আগন্তুক',
  //   titleEn: 'Agontuk',
  //   tagline: 'চলচ্চিত্র আলোচনার সংকলন পত্রিকা',
  //   description:
  //     '',
  //   image: '/images/agontuk.webp',
  //   href: '/browse?publication=agontuk',
  //   theme: {
  //     gradient: 'from-[#6b0d0d] via-[#8b1a1a] to-[#3d0606]',
  //     gradientDark: 'dark:from-[#3d0606] dark:via-[#5a0f0f] dark:to-[#1a0202]',
  //     accentText: 'text-red-200',
  //     badge:
  //       'bg-red-200/15 text-red-100 border border-red-300/25 backdrop-blur-sm',
  //     btn: 'bg-red-100 text-red-950 hover:bg-white hover:text-red-900',
  //     glow: 'hover:shadow-red-900/60',
  //     borderHover: 'hover:border-red-500/60',
  //     spineColor: 'bg-red-950/70',
  //     overlayColor: 'rgba(60,4,4,0.72)',
  //   },
  // },
];

/* ─── Journal Spine ─────────────────────────────────────────────────────── */
function JournalSpine({
  titleEn,
  spineClass,
}: {
  titleEn: string;
  spineClass: string;
}) {
  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-8 md:w-9 flex flex-col justify-between items-center py-4 md:py-5 ${spineClass} z-20 border-r border-white/10`}
      aria-hidden="true"
    >
      <span className="block w-1.5 h-1.5 rounded-full bg-white/35" />
      <span
        className="text-white/45 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {titleEn}
      </span>
      <span className="block w-1.5 h-1.5 rounded-full bg-white/35" />
    </div>
  );
}

/* ─── Section ────────────32───────────────────────────────────────────────── */
export default function PublicationsSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 bg-background z-20">
      {/* Section header */}
      <div className="container mb-10 md:mb-14">
        <div className="flex flex-col items-center gap-2">
          {/* <p className="text-[14px] uppercase tracking-[0.35em] text-muted-foreground font-semibold">
            DUFS
          </p> */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground text-center uppercase">
            DUFS Publications
          </h2>
          <span className="mt-1 block w-8 h-px bg-border" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 lg:gap-9">
          {publications.map((pub, index) => {
            const isLastOdd =
              publications.length % 2 !== 0 &&
              index === publications.length - 1;
            return isLastOdd ? (
              <div
                key={pub.id}
                className="md:col-span-2 md:w-[calc(50%-0.875rem)] lg:w-[calc(50%-1.125rem)] md:mx-auto"
              >
                <PublicationCard publication={pub} />
              </div>
            ) : (
              <PublicationCard key={pub.id} publication={pub} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
function PublicationCard({ publication: pub }: { publication: Publication }) {
  const router = useRouter();
  // Mobile two-step tap state
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dismiss when tapping outside on mobile
  useEffect(() => {
    if (!revealed) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setRevealed(false);
      }
    };
    document.addEventListener('touchstart', handler, { passive: true });
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('mousedown', handler);
    };
  }, [revealed]);

  const handleMobileTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only intercept on touch/hover-none devices
      if (!window.matchMedia('(hover: none)').matches) return;
      if (!revealed) {
        e.preventDefault();
        e.stopPropagation();
        setRevealed(true);
      }
    },
    [revealed],
  );

  return (
    <div ref={cardRef} className="w-full">
      {/*
       * Outer wrapper is a div so we can intercept the first tap on mobile.
       * On desktop it behaves like a normal link.
       */}
      <div
        role="link"
        tabIndex={0}
        onClick={handleMobileTap}
        onKeyDown={(e) => e.key === 'Enter' && router.push(pub.href)}
        className={`
          group relative overflow-hidden rounded-2xl
          border border-white/10
          bg-gradient-to-br ${pub.theme.gradient} 
          shadow-xl ${pub.theme.glow}
          transition-all duration-500 ease-out
          hover:-translate-y-1.5 hover:shadow-2xl
          ${pub.theme.borderHover}
          cursor-pointer select-none
          /* Mobile: auto height, grows with content */
          flex flex-col
          /* Desktop: taller vertical card */
          md:h-[540px]
        `}
      >
        {/* ── Always-present decorative layers ── */}
        <JournalSpine titleEn={pub.titleEn} spineClass={pub.theme.spineColor} />

        {/* Grain base */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/GrainTexture.webp)',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute inset-0 z-[2] opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 55% 38%, rgba(255,255,255,0.09) 0%, transparent 70%)',
          }}
        />

        {/* ══ IMAGE AREA ════════════════════════════════════════════════ */}
        {/* Mobile: fixed height so image is never clipped; Desktop: flex-1 fills remaining space */}
        <div className="relative h-[260px] sm:h-[300px] md:h-auto md:flex-1 flex items-center justify-center pl-10 md:pl-11 pr-6 pt-3 pb-3">
          {/* Image */}
          <div
            className="
              drop-shadow-[0_24px_52px_rgba(0,0,0,0.88)]
              w-52 sm:w-60
              md:w-[85%]
              transition-transform duration-500 ease-out
              group-hover:scale-[1.07] group-hover:-translate-y-4
            "
          >
            <Image
              src={pub.image}
              alt={`${pub.titleEn} cover`}
              width={360}
              height={430}
              className="object-contain w-full h-auto"
              sizes="(max-width: 768px) 50vw, 32vw"
            />
          </div>

        </div>

        {/* ══ ALWAYS-VISIBLE TITLE BLOCK (bottom strip) ═════════════════════ */}
        <div className="relative z-[8] flex flex-col items-center text-center pl-10 md:pl-11 pr-5 pb-4 ">
          {/* Separator */}
          <span className="block w-8 h-px bg-white/15 mb-2" />

          {/* Bengali title */}
          <h3
            className={`font-kalpurush text-3xl sm:text-4xl md:text-3xl lg:text-4xl font-bold leading-tight mb-0.5 ${pub.theme.accentText}`}
          >
            {pub.titleBn}
          </h3>

          {/* English subtitle */}
          <p className="text-white/40 text-[12px] font-bold uppercase tracking-[0.28em] mb-3.5">
            {pub.titleEn}
          </p>

          {/* Tagline: visible on mobile, hidden on desktop (shown in hover overlay) */}
          {/* <p className="md:hidden text-white/60 text-xs font-kalpurush leading-relaxed mb-4 line-clamp-2 max-w-[260px]">
            {pub.tagline}
          </p> */}

          {/* Read CTA — mobile always visible, desktop inside hover overlay */}
          <Link
            href={pub.href}
            onClick={(e) => e.stopPropagation()}
            className={`
              md:hidden
              inline-flex items-center gap-2 px-5 py-2.5 rounded-full
              text-sm font-semibold shadow-md
              transition-all duration-300
              ${pub.theme.btn}
            `}
          >
            Read
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* ── Desktop hover overlay — full card (right of spine) ── */}
        <div
          className="
            hidden md:flex
            absolute left-9 right-0 top-0 bottom-0 z-[18]
            flex-col items-center justify-center px-8 gap-0
            opacity-0 group-hover:opacity-100
            translate-y-3 group-hover:translate-y-0
            transition-all duration-500 ease-out
          "
          style={{
            backdropFilter: 'blur(10px) saturate(0.75)',
            WebkitBackdropFilter: 'blur(10px) saturate(0.75)',
            background: pub.theme.overlayColor,
          }}
        >
          {/* Grain on overlay */}
          <div
            className="absolute inset-0 opacity-[0.5] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: 'url(/images/GrainTexture.webp)',
              backgroundRepeat: 'repeat',
              backgroundSize: '192px 192px',
            }}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center flex flex-col items-center">
            <h3
              className={`
                font-kalpurush text-5xl lg:text-6xl font-bold leading-tight mb-1
                ${pub.theme.accentText} drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]
                translate-y-3 group-hover:translate-y-0
                transition-transform duration-500 delay-[60ms]
              `}
            >
              {pub.titleBn}
            </h3>
            <p
              className="
                text-white/45 text-[9px] font-bold uppercase tracking-[0.32em] mb-4
                translate-y-3 group-hover:translate-y-0
                transition-transform duration-500 delay-[90ms]
              "
            >
              {pub.titleEn}
            </p>
            <p
              className="
                text-white/75 text-sm font-kalpurush leading-relaxed mb-7
                max-w-[210px] mx-auto
                translate-y-3 group-hover:translate-y-0
                transition-transform duration-500 delay-[120ms]
              "
            >
              {pub.tagline}
            </p>
            <Link
              href={pub.href}
              onClick={(e) => e.stopPropagation()}
              className={`
                inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                text-sm font-semibold shadow-lg
                transition-all duration-300 hover:scale-105 active:scale-95
                ${pub.theme.btn}
                translate-y-3 group-hover:translate-y-0
                transition-transform duration-500 delay-[150ms]
              `}
            >
              Read Publication
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ══ MOBILE tap-to-reveal overlay ═══════════════════════════════ */}
        {/*
          First tap on mobile fades this in over the whole card.
          Shows title + tagline prominently + big Read CTA.
          Dismiss button (X) closes without navigating.
          The Read button navigates.
        */}
        <div
          className={`
            md:hidden
            absolute inset-0 z-[30]
            flex flex-col items-center justify-center px-8 pb-4
            transition-all duration-400 ease-out
            ${revealed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          style={{
            backdropFilter: revealed ? 'blur(12px) saturate(0.7)' : 'none',
            WebkitBackdropFilter: revealed ? 'blur(12px) saturate(0.7)' : 'none',
            background: pub.theme.overlayColor,
          }}
        >
          {/* Grain layer */}
          <div
            className="absolute inset-0 opacity-[0.55] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: 'url(/images/GrainTexture.webp)',
              backgroundRepeat: 'repeat',
              backgroundSize: '192px 192px',
            }}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)',
            }}
          />

          {/* Dismiss X */}
          <button
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setRevealed(false);
            }}
            aria-label="Close"
          >
            <X size={14} />
          </button>

          {/* Content */}
          <div className="relative z-10 text-center">
            <h3
              className={`
                font-kalpurush text-5xl font-bold leading-tight mb-1
                ${pub.theme.accentText} drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]
                ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                transition-all duration-400 delay-75
              `}
            >
              {pub.titleBn}
            </h3>
            <p
              className={`
                text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mb-4
                ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                transition-all duration-400 delay-100
              `}
            >
              {pub.titleEn}
            </p>
            <p
              className={`
                text-white/72 text-sm font-kalpurush leading-relaxed mb-7 max-w-[240px] mx-auto
                ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                transition-all duration-400 delay-[130ms]
              `}
            >
              {pub.tagline}
            </p>

            {/* Big Read CTA — navigates on tap */}
            <Link
              href={pub.href}
              className={`
                inline-flex items-center justify-center gap-2.5 w-full max-w-[200px] mx-auto
                py-3.5 rounded-full text-base font-bold shadow-lg
                transition-all duration-300 active:scale-95
                ${pub.theme.btn}
                ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                transition-all duration-400 delay-[160ms]
              `}
              onClick={(e) => e.stopPropagation()}
            >
              Read Publication
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Bottom depth gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-[3] bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    </div>
  );
}
