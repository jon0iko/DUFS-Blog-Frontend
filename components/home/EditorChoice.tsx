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
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="container">
            <div className="flex justify-center mb-8">
              <h2 className="text-2xl font-semibold relative">
                <span className="relative z-10">Editor&apos;s Choice</span>
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gray-300 dark:bg-gray-700"></span>
              </h2>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No editor&apos;s choice articles found. Mark some articles in Strapi CMS.</p>
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
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="container">
            <div className="flex justify-center mb-8">
              <h2 className="text-2xl font-semibold relative">
                <span className="relative z-10">Editor&apos;s Choice</span>
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gray-300 dark:bg-gray-700"></span>
              </h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">editor&apos;s choice articles contain invalid data. Please check your CMS content.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="container">
          <div className="flex justify-center mb-8">
            <h2 className="text-2xl font-semibold relative">
              <span className="relative z-10">Editor&apos;s Choice</span>
              <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gray-300 dark:bg-gray-700"></span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {validArticles.map(({ raw, data }) => (
              <ArticleCard 
                key={raw.documentId} 
                article={data!} 
                imageHeight="h-48 md:h-56"
              />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load editors choice articles:', error);
    return (
      <section className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="container">
          <div className="flex justify-center mb-8">
            <h2 className="text-2xl font-semibold relative">
              <span className="relative z-10">Editor&apos;s Choice</span>
              <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gray-300 dark:bg-gray-700"></span>
            </h2>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300">Failed to load editor&apos;s choice articles. Please check your connection.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </section>
    );
  }
}