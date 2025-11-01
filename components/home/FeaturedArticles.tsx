import { serverStrapiAPI } from '@/lib/server-api';
import ArticleCard from './ArticleCard';
import { getArticleData } from '@/lib/strapi-helpers';
import type { Article } from '@/types';

export default async function FeaturedArticles() {
  try {
    const response = await serverStrapiAPI.getFeaturedArticles(4);
    const articles = Array.isArray(response.data) ? response.data : [response.data];

    if (!articles || articles.length === 0) {
      return null;
    }

    return (
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {(articles as Article[]).map((article) => {
              const articleData = getArticleData(article);
              return (
                <ArticleCard 
                  key={article.id} 
                  article={articleData} 
                  imageHeight="h-56 md:h-64"
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to load featured articles:', error);
    return null;
  }
}