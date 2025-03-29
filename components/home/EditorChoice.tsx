// File: src/components/home/EditorChoice.tsx

import { editorsChoiceArticles } from '@/data/dummy-data';
import ArticleCard from './ArticleCard';

export default function EditorChoice() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="flex justify-center mb-8">
          <h2 className="text-2xl font-semibold relative">
            <span className="relative z-10">Editor's Choice</span>
            <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gray-300 dark:bg-gray-700"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {editorsChoiceArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              imageHeight="h-48 md:h-56"
            />
          ))}
        </div>
      </div>
    </section>
  );
}