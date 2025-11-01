import React from "react";
import ArticleContent from "@/components/articles/ArticleContent";
import { serverStrapiAPI } from "@/lib/server-api";
import type { Article } from "@/types";

interface PageProps {
  params: {
    slug: string;
  };
}

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Fetch all published articles from Strapi
    const response = await serverStrapiAPI.getAllArticles(1, 100);
    const articles = Array.isArray(response.data) ? response.data : [response.data];

    return (articles || []).map((article: Article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    // Return empty array if fetch fails, will use ISR fallback
    return [];
  }
}

export default function ArticlePage({ params }: PageProps) {
  const { slug } = params;
  
  return <ArticleContent slug={slug} />;
}
