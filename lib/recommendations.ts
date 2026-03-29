/**
 * Recommendation Engine for Article Discovery
 * Implements a sophisticated multi-factor ranking system for related articles
 * 
 * Factors considered:
 * - Category relevance (primary)
 * - Tag overlap (secondary)
 * - Reading time similarity (ternary)
 * - Recency boost (recent articles score higher)
 * - Popularity (view count & likes)
 * - Language match
 */

import { Article } from "@/types";

interface RecommendationScore {
  article: Article;
  score: number;
  reasons: string[]; // For debugging: why this article was recommended
}

/**
 * Calculate recommendation score for an article relative to the current article
 */
export function calculateRecommendationScore(
  candidate: Article,
  currentArticle: Article
): RecommendationScore {
  const reasons: string[] = [];
  let score = 0;

  // FACTOR 1: Category Match (40 points max)
  // Highest priority factor
  if (
    currentArticle.category?.Slug &&
    candidate.category?.Slug === currentArticle.category.Slug
  ) {
    score += 40;
    reasons.push("same_category");
  } else if (candidate.category?.Slug) {
    // Give partial credit for having a category (helps distinguish from no-category articles)
    score += 5;
    reasons.push("has_category");
  }

  // FACTOR 2: Tag Overlap (25 points max)
  // More tag matches = higher score
  if (currentArticle.tags && candidate.tags) {
    const currentTagIds = new Set(
      currentArticle.tags.map((t: any) => t.id)
    );
    const matchingTags = candidate.tags.filter((t: any) =>
      currentTagIds.has(t.id)
    ).length;

    if (matchingTags > 0) {
      // Awards up to 25 points based on tag overlap
      score += Math.min(25, matchingTags * 8);
      reasons.push(`${matchingTags}_tag_matches`);
    }
  }

  // FACTOR 3: Language Match (10 points max)
  // Recommend articles in the same language, but allow bilingual/cross-language discovery
  if (currentArticle.language === candidate.language) {
    score += 10;
    reasons.push("language_match");
  } else if (
    (currentArticle.language === "both" || candidate.language === "both") &&
    currentArticle.language !== candidate.language
  ) {
    score += 5;
    reasons.push("bilingual_compatible");
  }

  // FACTOR 4: Recency Boost (15 points max)
  // Recent articles are more relevant for discovery
  if (candidate.publishedAt) {
    const candidateDate = new Date(candidate.publishedAt).getTime();
    const currentDate = new Date(currentArticle.publishedAt || Date.now()).getTime();
    const daysDifference = (currentDate - candidateDate) / (1000 * 60 * 60 * 24);

    if (daysDifference < 7) {
      score += 15; // Published within last week
      reasons.push("very_recent");
    } else if (daysDifference < 30) {
      score += 10; // Within last month
      reasons.push("recent");
    } else if (daysDifference < 90) {
      score += 5; // Within 3 months
      reasons.push("moderately_recent");
    }
  }

  // FACTOR 5: Popularity Boost (10 points max)
  // Articles with more engagement are worth recommending
  const totalEngagement = (candidate.viewCount || 0) + (candidate.likes || 0);
  const avgEngagementScore = totalEngagement / 100; // Normalize
  score += Math.min(10, avgEngagementScore);

  if (totalEngagement > 100) {
    reasons.push("popular");
  }

  // FACTOR 6: Content Diversity Bonus (5 points)
  // Slight boost for articles from different authors (encourages discovery)
  if (
    currentArticle.author?.documentId &&
    candidate.author?.documentId &&
    candidate.author.documentId !== currentArticle.author.documentId
  ) {
    score += 5;
    reasons.push("different_author");
  }

  // Diversity for publication pieces
  if (
    currentArticle.publication_author_name &&
    candidate.publication_author_name &&
    candidate.publication_author_name !== currentArticle.publication_author_name
  ) {
    score += 3;
    reasons.push("different_publication_author");
  }

  return {
    article: candidate,
    score,
    reasons,
  };
}

/**
 * Get intelligent article recommendations with diversity across categories
 * Prioritizes same category but always includes other categories
 * Scores candidates and returns top recommendations
 */
export function getIntelligentRecommendations(
  currentArticle: Article,
  candidates: Article[],
  limit: number = 4
): Article[] {
  // Filter out the current article itself
  const filtered = candidates.filter((c) => c.documentId !== currentArticle.documentId);

  if (filtered.length === 0) return [];

  // Score all candidates (across all categories for diversity)
  const scored = filtered.map((article) =>
    calculateRecommendationScore(article, currentArticle)
  );

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  // Return top recommendations
  return scored.slice(0, limit).map((rec) => rec.article);
}

/**
 * Debug helper: Get scoring details for an article
 * Useful for understanding why a specific article was/wasn't recommended
 */
export function debugRecommendationScore(
  candidate: Article,
  currentArticle: Article
): RecommendationScore {
  return calculateRecommendationScore(candidate, currentArticle);
}

/**
 * Get diverse recommendations by interleaving different categories
 * Ensures variety while prioritizing same category through scoring
 * Returns top-scored articles from multiple categories in balanced fashion
 */
export function getDiverseRecommendations(
  currentArticle: Article,
  candidates: Article[],
  limit: number = 4
): Article[] {
  const filtered = candidates.filter((c) => c.documentId !== currentArticle.documentId);

  if (filtered.length === 0) return [];

  // Score all articles
  const scored = filtered.map((article) =>
    calculateRecommendationScore(article, currentArticle)
  );

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  // Group scored articles by category while maintaining order
  const byCategory = new Map<string, typeof scored>();
  for (const rec of scored) {
    const categorySlug = rec.article.category?.Slug || 'uncategorized';
    if (!byCategory.has(categorySlug)) {
      byCategory.set(categorySlug, []);
    }
    byCategory.get(categorySlug)!.push(rec);
  }

  // Interleave categories: pick top scorer from each category in round-robin
  // This ensures diversity while respecting the overall score ranking
  const result: Article[] = [];
  const categoryList = Array.from(byCategory.keys());
  let categoryIndex = 0;
  const articleIndices = new Map<string, number>(); // Track which article index we're at for each category

  while (result.length < limit && categoryList.length > 0) {
    const category = categoryList[categoryIndex % categoryList.length];
    const categoryArticles = byCategory.get(category)!;
    const currentIndex = articleIndices.get(category) || 0;

    if (currentIndex < categoryArticles.length) {
      result.push(categoryArticles[currentIndex].article);
      articleIndices.set(category, currentIndex + 1);
    } else {
      // This category is exhausted, remove it
      categoryList.splice(categoryIndex % categoryList.length, 1);
      if (categoryList.length === 0) break;
      categoryIndex--;
    }

    categoryIndex++;
  }

  return result;
}
