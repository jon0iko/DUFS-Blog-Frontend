import React from "react";
import { featuredArticles, editorsChoiceArticles } from "@/data/dummy-data";
import ArticleContent from "@/components/articles/ArticleContent";

interface PageProps {
  params: {
    slug: string;
  };
}

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  // In a real app, you would fetch all slugs from an API
  // For now, we extract them from our dummy data
  const allArticles = [...featuredArticles, ...editorsChoiceArticles];
  
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default function ArticlePage({ params }: PageProps) {
  const { slug } = params;
  
  return <ArticleContent slug={slug} />;
}
