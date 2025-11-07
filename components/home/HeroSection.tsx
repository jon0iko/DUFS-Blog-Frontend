import { serverStrapiAPI } from '@/lib/server-api';
import HeroCarousel from './HeroCarousel';

export default async function HeroSection() {
  try {
    // Fetch all hero articles from Strapi v5
    const heroArticlesResponse = await serverStrapiAPI.getHeroArticles();
    // console.log('Hero Articles Response:', heroArticlesResponse);
    
    if (!heroArticlesResponse.data || heroArticlesResponse.data.length === 0) {
      return (
        <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">No Hero Articles Found</h2>
            <p className="text-gray-400">Please mark an article as hero in the content manager</p>
          </div>
        </section>
      );
    }

    return <HeroCarousel articles={heroArticlesResponse.data} />;
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