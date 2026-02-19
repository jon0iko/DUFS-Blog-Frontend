import { serverStrapiAPI } from '@/lib/server-api';
import ArticleCard from './ArticleCard';
import { getArticleData } from '@/lib/strapi-helpers';

export default async function EditorChoice() {
  try {
    // Strapi v5: getEditorsChoiceArticles returns ArticleResponse with data array
    const response = await serverStrapiAPI.getEditorsChoiceArticles(4);
    const articles = response.data;

    if (!articles || articles.length === 0) {
      return (
        <section className="py-12 bg-secondary dark:bg-brand-black-90">
          <div className="container">
            <div className="flex justify-center mb-8">
              <h2 className="text-2xl font-semibold relative text-foreground">
                <span className="relative z-10">Editor&apos;s Choice</span>
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-border"></span>
              </h2>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No editor&apos;s choice articles found. Mark some articles in Strapi CMS.</p>
            </div>
          </div>
        </section>
      );
    }

    // Filter out invalid articles
    const validArticles = articles
      .map(article => ({ raw: article, data: getArticleData(article) }))
      .filter(item => item.data !== null);

    if (validArticles.length === 0) {
      return (
        <section className="py-12 bg-secondary dark:bg-brand-black-90">
          <div className="container">
            <div className="flex justify-center mb-8">
              <h2 className="text-2xl font-semibold relative text-foreground">
                <span className="relative z-10">Editor&apos;s Choice</span>
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-border"></span>
              </h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">editor&apos;s choice articles contain invalid data. Please check your CMS content.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative py-12 bg-secondary dark:bg-[#2b2827] mt-16 mb-8">
        {/* Paper texture overlay — light mode: full opacity white paper */}
        {/* Paper texture overlay — light mode */}
        <div
          className="absolute inset-0 pointer-events-none select-none z-[5]"
          style={{
            backgroundImage: 'url(/images/paper.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '500px',
            opacity: 1,
            
          }}
        />
        {/* Paper texture overlay — dark mode: subtle embossed grain via overlay blend */}
        {/* <div
          className="absolute inset-0 pointer-events-none select-none z-[5] hidden dark:block"
          style={{
            backgroundImage: 'url(/images/paper.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '600px',
            opacity: 1,
            mixBlendMode: 'overlay',
          }}
        /> */}
        {/* Torn paper edge — white top floats over section above, torn edge marks the boundary */}
        <div
          className="absolute left-0 right-0 w-full pointer-events-none select-none z-10"
          style={{ top: 0, transform: 'translateY(-75%)' }}
        >
          {/* Light mode */}
          <img
            src="/images/tornpaper.webp"
            alt=""
            aria-hidden="true"
            className="w-full block dark:hidden"
            style={{ height: 'clamp(120px, 18vw, 220px)' }}
          />
          {/* Dark mode */}
          <img
            src="/images/tornpaper_black.webp"
            alt=""
            aria-hidden="true"
            className="w-full hidden dark:block"
            style={{ height: 'clamp(120px, 18vw, 220px)' }}
          />
        </div>
        {/* Torn paper edge — bottom, flipped to face upward, blends into footer below */}
        <div
          className="absolute left-0 right-0 w-full pointer-events-none select-none z-10"
          style={{ bottom: 0, transform: 'translateY(75%) scaleY(-1) scaleX(-1)' }}
        >
          {/* Light mode */}
          <img
            src="/images/tornpaper.webp"
            alt=""
            aria-hidden="true"
            className="w-full block dark:hidden"
            style={{ height: 'clamp(120px, 18vw, 220px)' }}
          />
          {/* Dark mode */}
          <img
            src="/images/tornpaper_black.webp"
            alt=""
            aria-hidden="true"
            className="w-full hidden dark:block"
            style={{ height: 'clamp(120px, 18vw, 220px)' }}
          />
        </div>
        {/* <div 
        className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-overlay z-20"
        style={{
          backgroundImage: 'url(/images/GrainTexture.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px'
        }}
      /> */}
        <div className="container z-10 relative">
          <div className="flex justify-center mb-8">
            <h2 className="text-3xl font-black relative text-brand-black-90">
              <span className="relative z-10">DUFS Featured</span>
              {/* <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded-lg bg-brand-black-90"></span> */}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {validArticles.map(({ raw, data }) => (
              <ArticleCard 
                key={raw.documentId} 
                article={data!} 
                imageHeight="h-48 md:h-56"
                forceBlackText={true}
              />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load editors choice articles:', error);
    return (
      <section className="py-12 bg-secondary dark:bg-brand-black-90">
        <div className="container">
          <div className="flex justify-center mb-8">
            <h2 className="text-2xl font-semibold relative text-brand-black-90">
              <span className="relative z-10">Editor&apos;s Choice</span>
              <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-border"></span>
            </h2>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-8 text-center">
            <p className="text-brand-black-90">Failed to load editor&apos;s choice articles. Please check your connection.</p>
            <p className="text-sm text-muted-foreground mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </section>
    );
  }
}