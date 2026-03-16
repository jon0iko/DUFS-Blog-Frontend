import { useState, useEffect } from "react";
import { strapiAPI } from "@/lib/api";
import { Article } from "@/types";

interface UseArticleDataResult {
  article: Article | null;
  relatedArticles: Article[];
  loading: boolean;
  error: string | null;
}

export function useArticleData(slug: string): UseArticleDataResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);

        const articleData = await strapiAPI.getArticleBySlug(slug);

        if (!articleData) {
          setError("Article not found");
          setLoading(false);
          return;
        }

        setArticle(articleData);

        if (articleData.category?.Slug && articleData.documentId) {
          const relatedData = await strapiAPI.getRelatedArticles(
            articleData.documentId,
            articleData.category.Slug,
            4,
          );
          setRelatedArticles(relatedData.data || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticleData();
    }
  }, [slug]);

  return { article, relatedArticles, loading, error };
}
