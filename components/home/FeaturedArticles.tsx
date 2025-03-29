// File: src/components/home/FeaturedArticles.tsx

import { featuredArticles } from '@/data/dummy-data';
import ArticleCard from './ArticleCard';

export default function FeaturedArticles() {
  return (
    <section className="py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              imageHeight="h-56 md:h-64"
            />
          ))}
        </div>
      </div>
    </section>
  );
}