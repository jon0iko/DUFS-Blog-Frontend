import { serverStrapiAPI } from '@/lib/server-api';
import ArticleCard from './ArticleCard';
import { getArticleData } from '@/lib/strapi-helpers';

export default async function FeaturedArticles() {
  try {
    // Strapi v5: getFeaturedArticles returns ArticleResponse with data array
    const response = await serverStrapiAPI.getFeaturedArticles(12);
    const articles = response.data;

    if (!articles || articles.length === 0) {
      return (
        <section className="py-12">
          <div className="container">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <h2 className="text-xl font-bold mb-2">No Featured Articles</h2>
              <p className="text-gray-600 dark:text-gray-400">Mark some articles as featured in Strapi CMS to display them here.</p>
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
        <section className="py-12">
          <div className="container">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Invalid Featured Articles</h2>
              <p className="text-gray-600 dark:text-gray-400">Featured articles exist but contain invalid data. Please check your CMS content.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {validArticles.map(({ raw, data }) => (
              <ArticleCard 
                key={raw.documentId} 
                article={data!} 
                imageHeight="h-56 md:h-64"
              />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load featured articles:', error);
    return (
      <section className="py-12">
        <div className="container">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2 text-red-900 dark:text-red-200">Error Loading Featured Articles</h2>
            <p className="text-gray-700 dark:text-gray-300">Failed to connect to the server. Please check your connection.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </section>
    );
  }
}