import { useState, useEffect, useMemo } from "react";
import { strapiAPI } from "@/lib/api";
import { Article } from "@/types";
import { getIntelligentRecommendations, getDiverseRecommendations } from "@/lib/recommendations";

interface UseArticleDataResult {
  article: Article | null;
  relatedArticles: Article[];
  loading: boolean;
  error: string | null;
}

export function useArticleData(slug: string): UseArticleDataResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [candidates, setCandidates] = useState<Article[]>([]);
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

        // Fetch recommendation candidates using smart sampling strategy
        if (articleData.category?.Slug && articleData.documentId) {
          try {
            // getRecommendationsCandidates now uses smart sampling:
            // Fetches 4 latest + 4 oldest + 4 from middle for better diversity
            const candidatesData = await strapiAPI.getRecommendationsCandidates(
              articleData.documentId,
              articleData.category.Slug,
              12, // Will use smart sampling to pick 12 from different time periods
            );
            setCandidates(candidatesData.data || []);
          } catch (err) {
            console.warn("Failed to fetch recommendation candidates:", err);
            setCandidates([]);
          }
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

  // Memoize diverse recommendations to avoid recalculation on every render
  // Uses intelligent scoring to rank candidates, then interleaves categories for diversity
  const relatedArticles = useMemo(() => {
    if (!article || candidates.length === 0) return [];

    // Use getDiverseRecommendations to ensure cross-category diversity
    // This function scores all articles and interleaves them by category
    // Ensures we always get 4 articles even if current category has few options
    return getDiverseRecommendations(article, candidates, 4);
  }, [article, candidates]);

  return { article, relatedArticles, loading, error };
}
