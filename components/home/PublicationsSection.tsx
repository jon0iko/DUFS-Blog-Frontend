'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
    filmStrip: string;
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
      filmStrip: 'bg-red-950/60',
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
      filmStrip: 'bg-amber-950/60',
    },
  },
];

// Decorative film-strip perforation strip
function FilmStrip({ color }: { color: string }) {
  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-7 flex flex-col justify-evenly items-center py-2 ${color} z-10`}
      aria-hidden="true"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="block w-3.5 h-2.5 rounded-[3px] bg-black/40"
        />
      ))}
    </div>
  );
}

export default function PublicationsSection() {
  return (
    <section className="relative py-20 px-4 bg-background dark:bg-background z-20">
    
      {/* Section header */}
      <div className="container mb-12">
        <div className="flex flex-col items-center gap-3">
          {/* Decorative rule */}
          {/* <div className="flex items-center gap-4 w-full max-w-sm">
            <span className="flex-1 h-px bg-border" />
            <BookOpen
              className="text-muted-foreground shrink-0"
              size={18}
              strokeWidth={1.5}
            />
            <span className="flex-1 h-px bg-border" />
          </div> */}

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground text-center uppercase">
            DUFS Publications
          </h2>
        </div>
      </div>

      {/* Cards grid */}
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicationCard({ publication: pub }: { publication: Publication }) {
  return (
    <Link
      href={pub.href}
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl
        border border-white/10
        bg-gradient-to-br ${pub.theme.gradient} ${pub.theme.gradientDark}
        shadow-2xl ${pub.theme.glow}
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:shadow-2xl
        ${pub.theme.borderHover}
        min-h-[480px] md:min-h-[520px]
        cursor-pointer
      `}
    >
      {/* Film strip on left edge */}
      <FilmStrip color={pub.theme.filmStrip} />

      {/* Film strip on right edge */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-7 flex flex-col justify-evenly items-center py-2 ${pub.theme.filmStrip} z-10`}
        aria-hidden="true"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="block w-3.5 h-2.5 rounded-[3px] bg-black/40"
          />
        ))}
      </div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: 'url(/images/GrainTexture.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Radial glow behind image — fades on hover */}
      <div
        className="absolute inset-0 z-[2] opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(255,255,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full pl-10 pr-10 pt-8 pb-8">
        {/* Badge */}
        <div className="mb-6">
          <span
            className={`inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${pub.theme.badge}`}
          >
            DUFS Publication
          </span>
        </div>

        {/* Image — floats in center, scales on hover */}
        <div className="flex justify-center items-center flex-1 mb-6">
          <div
            className="
              relative w-82 md:w-80 lg:w-85
              drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]
              transition-transform duration-500 ease-out
              group-hover:scale-105 group-hover:-translate-y-3
            "
          >
            <Image
              src={pub.image}
              alt={`${pub.titleEn} publication cover`}
              width={280}
              height={320}
              className="object-contain w-full h-auto"
              sizes="(max-width: 768px) 60vw, 30vw"
            />
          </div>
        </div>

        {/* Text block — slides up on hover */}
        <div className="text-center transition-transform duration-500 ease-out group-hover:-translate-y-1">
          {/* Bengali title */}
          <h3
            className={`font-kalpurush text-4xl font-bold leading-tight mb-1 ${pub.theme.accentText}`}
          >
            {pub.titleBn}
          </h3>

          {/* English subtitle */}
          <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            {pub.titleEn}
          </p>

          {/* Tagline */}
          <p className="text-white/70 text-sm font-kalpurush mb-3 leading-relaxed">
            {pub.tagline}
          </p>

          {/* Description — visible on hover */}
          <p className="text-white/0 group-hover:text-white/60 text-xs font-kalpurush leading-relaxed transition-all duration-500 ease-out mb-5 line-clamp-2">
            {pub.description}
          </p>

          {/* CTA */}
          <div className="flex justify-center items-center gap-3">
            <span
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                text-sm font-semibold
                transition-all duration-300
                ${pub.theme.btn}
                shadow-md group-hover:shadow-lg group-hover:translate-x-1
              `}
            >
              Read
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient for cinematic depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[3] bg-gradient-to-t from-black/40 to-transparent" />
    </Link>
  );
}
