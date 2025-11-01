import { serverStrapiAPI } from '@/lib/server-api';
import ArticleCard from './ArticleCard';
import { getArticleData } from '@/lib/strapi-helpers';
import type { Article } from '@/types';

export default async function EditorChoice() {
  try {
    const response = await serverStrapiAPI.getEditorsChoiceArticles(4);
    const articles = Array.isArray(response.data) ? response.data : [response.data];

    if (!articles || articles.length === 0) {
      return null;
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
            {(articles as Article[]).map((article) => {
              const articleData = getArticleData(article);
              return (
                <ArticleCard 
                  key={article.id} 
                  article={articleData} 
                  imageHeight="h-48 md:h-56"
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load editors choice articles:', error);
    return null;
  }
}