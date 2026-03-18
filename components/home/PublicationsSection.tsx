import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Publication } from '@/types';
import { getStrapiMediaUrl } from '@/lib/strapi-helpers';
import { derivePublicationPalette } from '../../lib/publication-colors';

interface PublicationsSectionProps {
  publications: Publication[];
  showViewAll?: boolean;
}

/* ─── Journal Spine ─────────────────────────────────────────────────────── */
function JournalSpine({
  titleEn,
  spineColor,
}: {
  titleEn: string;
  spineColor: string;
}) {
  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-8 md:w-9 flex flex-col justify-between items-center py-4 md:py-5 z-20 rounded-tl-none rounded-bl-none"
      style={{ backgroundColor: spineColor }}
      aria-hidden="true"
    >
      <span className="block w-1.5 h-1.5 rounded-full bg-white/35" />
      <span
        className="text-white/50 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {titleEn}
      </span>
      <span className="block w-1.5 h-1.5 rounded-full bg-white/35" />
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function PublicationsSection({
  publications,
  showViewAll = false,
}: PublicationsSectionProps) {
  if (publications.length === 0) {
    return null;
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
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
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

  return (
    <div
      className="w-full"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '420px' }}
    >
      <Link
        href="/publications"
        className="group relative block md:hidden overflow-hidden rounded-2xl border border-white/15 bg-black/70 shadow-md"
      >
        <div className="relative h-[250px] bg-black/45">
          <Image
            src={imageUrl}
            alt={`${pub.TitleEnglish} cover`}
            fill
            loading="lazy"
            quality={60}
            className="object-contain object-center px-3 pt-3 pb-1 transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />
        </div>

        <div className="relative -mt-16 px-4 pb-4">
          <div className="rounded-xl border border-white/15 bg-black/70 p-4">
            <h3 className="font-kalpurush text-3xl font-bold leading-tight text-white/90">
              {pub.TitleBangla}
            </h3>
            <p className="text-white/45 text-xs font-bold uppercase tracking-[0.22em] mt-2 mb-4">
              {pub.TitleEnglish}
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm bg-white/90 text-black">
              Read Publication
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>

      <div
        className="hidden md:flex md:flex-col group relative overflow-hidden rounded-tr-2xl rounded-br-2xl select-none h-[540px]"
        style={{
          backgroundImage: `linear-gradient(140deg, ${palette.gradientStart}, ${palette.gradientMid}, ${palette.gradientEnd})`,
          borderColor: palette.borderColor,
        }}
      >
        <JournalSpine titleEn={pub.TitleEnglish} spineColor={palette.spineColor} />

        {/* <div
          className="absolute inset-0 pointer-events-none z-[1] opacity-[0.15] mix-blend-overlay rounded-tr-2xl rounded-br-2xl"
          style={{
            backgroundImage: 'url(/images/GrainTexture.webp)',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            marginLeft: '32px',
          }}
        /> */}

        <div
          className="absolute inset-0 z-[2] opacity-25 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 62% 52% at 55% 38%, rgba(255,255,255,0.08) 0%, transparent 72%)',
          }}
        />

        <div className="relative flex-1 flex items-center justify-center pl-8 md:pl-9 pr-6 py-0 overflow-hidden">
          <div className="drop-shadow-[0_24px_52px_rgba(0,0,0,0.88)] w-full h-full will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={`${pub.TitleEnglish} cover`}
              width={360}
              height={430}
              className="object-contain object-center w-full h-full"
              sizes="32vw"
            />
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center text-center pl-8 md:pl-9 pr-5 pb-4">
          <span className="block w-8 h-px bg-white/15 mb-2" />
          <h3
            className="font-kalpurush text-3xl lg:text-4xl font-bold leading-tight mb-0.5"
            style={{ color: palette.titleColor }}
          >
            {pub.TitleBangla}
          </h3>
          <p className="text-white/45 text-[12px] font-bold uppercase tracking-[0.28em] mb-3.5">
            {pub.TitleEnglish}
          </p>
        </div>

        <div
          className="hidden md:flex absolute left-8 md:left-9 right-6 top-0 bottom-20 z-[18] flex-col items-center justify-center px-8 gap-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-500 ease-out"
          style={{
            backdropFilter: 'blur(7px) saturate(0.82)',
            WebkitBackdropFilter: 'blur(7px) saturate(0.82)',
            background: palette.overlayColor,
          }}
        >
          {/* <div
            className="absolute inset-0 opacity-[0.5] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: 'url(/images/GrainTexture.webp)',
              backgroundRepeat: 'repeat',
              backgroundSize: '192px 192px',
            }}
          /> */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)',
            }}
          />

          <div className="relative z-10 text-center flex flex-col items-center">
            <Link
              href="/publications"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 active:scale-[0.98] bg-white/90 text-black translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-[80ms] ease-out"
            >
              Read Publication
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
