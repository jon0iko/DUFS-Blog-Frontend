import Link from 'next/link';
import Image from 'next/image';
import { serverStrapiAPI } from '@/lib/server-api';
import { getArticleData, getArticleImage } from '@/lib/strapi-helpers';
import type { Article } from '@/types';

export default async function HeroSection() {
  try {
    // Fetch hero article from Strapi
    const response = await serverStrapiAPI.getHeroArticle();
    
    const articleList = Array.isArray(response.data) ? response.data : [response.data];
    
    if (!articleList || articleList.length === 0) {
      return null;
    }

    const heroArticle: Article = articleList[0];
    const articleData = getArticleData(heroArticle);
    const imageSrc = getArticleImage(heroArticle);

    console.log('Hero Section Article List:', articleList);
    console.log('Hero Section Article Data:', articleData);
    console.log('Hero Section Image Source:', imageSrc);

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
    return null;
  }
}