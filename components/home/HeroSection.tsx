import Link from 'next/link';
import Image from 'next/image';
import { serverStrapiAPI } from '@/lib/server-api';
import { getArticleData, getArticleImage } from '@/lib/strapi-helpers';

export default async function HeroSection() {
  try {
    // Fetch hero article from Strapi v5 (returns Article | null)
    const heroArticle = await serverStrapiAPI.getHeroArticle();
    
    if (!heroArticle) {
      return (
        <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">No Hero Article Found</h2>
            <p className="text-gray-400">Please mark an article as hero in the content manager</p>
          </div>
        </section>
      );
    }

    const articleData = getArticleData(heroArticle);
    
    if (!articleData) {
      return (
        <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Invalid Article Data</h2>
            <p className="text-gray-400">The hero article data is incomplete or corrupted</p>
          </div>
        </section>
      );
    }

    const imageSrc = getArticleImage(heroArticle);
    console.log('Hero Article raw:', heroArticle);
    console.log('Hero Article Data:', articleData);

    return (
      <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        {/* Black and white background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={articleData.title}
            fill
            priority
            className="object-cover grayscale"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pl-6 pb-12">
            <div className="max-w-5xl">
              <Link href={`/articles/${articleData.slug}`}>
                <h1 className="font-kalpurush text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {articleData.title}
                </h1>
                <p className="text-lg md:text-xl text-white/80">
                  {articleData.excerpt}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load hero section:', error);
    return (
      <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-red-900 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Error Loading Hero Section</h2>
          <p className="text-gray-200">Failed to connect to the CMS. Please check your connection.</p>
          <p className="text-sm text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </section>
    );
  }
}