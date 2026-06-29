import type { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';
import { getHeroArticlesBuildTime, getSiteUrl } from '@/lib/server-data';
import { getMediaUrlSized, getMediaSrcSet } from '@/lib/strapi-helpers';

export const metadata: Metadata = {
  title: 'DUFS Blog — Film Publication by Dhaka University Film Society',
  description:
    'Film analysis, criticism and essays from the Dhaka University Film Society. Explore reviews, retrospectives and our In Focus collection.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'DUFS Blog — Film Publication',
    description:
      'Film analysis, criticism and essays from the Dhaka University Film Society.',
    url: '/',
    siteName: 'DUFS Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DUFS Blog — Film Publication',
    description:
      'Film analysis, criticism and essays from the Dhaka University Film Society.',
  },
};

export default async function Home() {
  // Fetched at build time so the hero is part of the static HTML.
  const heroArticles = await getHeroArticlesBuildTime();

  // Preload the first hero image (the LCP element) using the exact responsive
  // variants the <img> will request, so it starts downloading with the HTML.
  const firstMedia = heroArticles[0]?.featuredImage;
  const heroPreloadHref = firstMedia ? getMediaUrlSized(firstMedia, 'large') : null;
  const heroPreloadSrcSet = firstMedia ? getMediaSrcSet(firstMedia) : undefined;

  const siteUrl = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Dhaka University Film Society',
        alternateName: 'DUFS',
        url: siteUrl,
        logo: `${siteUrl}/images/logoo.png`,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'DUFS Blog',
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
    ],
  };

  return (
    <>
      {heroPreloadHref && (
        <link
          rel="preload"
          as="image"
          href={heroPreloadHref}
          {...({
            imageSrcSet: heroPreloadSrcSet,
            imageSizes: '100vw',
            fetchPriority: 'high',
          } as Record<string, string>)}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialHeroArticles={heroArticles} />
    </>
  );
}
