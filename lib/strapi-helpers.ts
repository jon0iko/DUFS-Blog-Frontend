/**
 * Strapi v5 Helper Functions
 * Utilities for transforming and normalizing Strapi v5 data
 * 
 * Key Changes in Strapi v5:
 * - Response format is FLATTENED (no nested attributes)
 * - Media fields are directly accessible (no .data wrapper)
 * - Relations are directly accessible (no .data wrapper)
 */

import { config } from './config';
import type { Article, Author, Category, StrapiMedia } from '@/types';

/**
 * Get full media URL from Strapi v5 media object or path
 */
export function getMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath) return '/images/placeholder.jpg';
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${config.strapi.url}${mediaPath}`;
}

/**
 * Get media URL from Strapi v5 media object
 */
export function getStrapiMediaUrl(media?: StrapiMedia | null): string {
  if (!media) return '/images/placeholder.jpg';
  return getMediaUrl(media.url);
}

/**
 * Extract first image from article gallery or get featured image
 */
export function getArticleImage(article: Article): string {
  // In Strapi v5, media is directly accessible (flattened)
  if (article.featuredImage) {
    return getStrapiMediaUrl(article.featuredImage);
  }
  return '/images/placeholder.jpg';
}

/**
 * Get author name safely (handles backend schema: Name with capital N)
 */
export function getAuthorName(author?: Author): string {
  if (!author) return 'Staff';
  // Backend schema uses capital N in "Name"
  return author.Name || 'Staff';
}

/**
 * Get author avatar URL
 */
export function getAuthorAvatar(author?: Author): string | undefined {
  if (!author) return '/images/avatarPlaceholder.png';
  // Avatar is stored on the linked users_permissions_user
  const userAvatar = author.users_permissions_user?.Avatar?.url;
  if (userAvatar) {
    return userAvatar.startsWith('http') ? userAvatar : `${config.strapi.url}${userAvatar}`;
  }
  // Fallback: direct Avatar field on the Author content type
  if (author.Avatar) {
    return getStrapiMediaUrl(author.Avatar);
  }
  return '/images/avatarPlaceholder.png';
}

/**
 * Get category name safely (handles backend schema with capital letters)
 */
export function getCategoryName(category?: Category): string {
  if (!category) return 'শ্রেণীবিহীন';
  // Backend schema uses: Name, nameEn, nameBn (with capitals)
  return category.Name || 'শ্রেণীবিহীন';
}

/**
 * Get category name in Bengali
 */
export function getCategoryNameBn(category?: Category): string {
  if (!category) return 'শ্রেণীবিহীন';
  return category.nameBn || 'শ্রেণীবিহীন';
}

export function getCategoryNameEn(category?: Category): string {
  if (!category) return 'Uncategorized';
  return category.nameEn || 'Uncategorized';
}

/**
 * Format publish date (English)
 */
export function formatPublishDate(dateString?: string): string {
  if (!dateString) return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
}

/**
 * Format publish date (Bengali)
 */
export function formatPublishDateBn(dateString?: string): string {
  if (!dateString) return new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get reading time estimate from content
 */
export function estimateReadingTime(content: string): number {
  if (!content) return 1;
  // Remove HTML tags and blocks content
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '');
  // Estimate 200 words per minute
  const words = plainText.split(/\s+/).length;
  return Math.ceil(words / 200) || 1;
}

/**
 * Truncate text to word limit
 */
export function truncateText(text: string, wordLimit: number = 30): string {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
}


/**
 * Get author slug safely
 */
export function getAuthorSlug(author?: Author): string | undefined {
  if (!author) return undefined;
  return author.slug;
}

/**
 * Safe access to article properties with defaults
 * Handles Strapi v5 flat response structure
 * Returns null if article is invalid (for proper error handling)
 */
export function getArticleData(article: Article | null | undefined) {
  console.log('getArticleData called with article:', article);

  // Validate article structure - return null for proper error handling
  if (!article || !article.title) {
    console.error('Invalid or missing article data');
    return null;
  }

  return {
    id: article.id,
    documentId: article.documentId,
    title: article.title,
    slug: article.slug || '',
    content: article.content || '',
    image: getArticleImage(article),
    category: getCategoryName(article.category),
    author: {
      name: article.publication_author_name || getAuthorName(article.author),
      avatar: getAuthorAvatar(article.author),
      slug: getAuthorSlug(article.author),
    },
    publishedAt: formatPublishDate(article.publishedAt),
    BlogDate: article.BlogDate ? formatPublishDate(article.BlogDate) : undefined,
    language: article.language || 'en',
    viewCount: article.viewCount || 0,
    likes: article.likes || 0,
    tags: article.tags?.map(tag => tag.name) || [],
    InFeatured: article.InFeatured || false,
    InSlider: article.InSlider || false,
    publication_issue: article.publication_issue ? { Title: article.publication_issue.Title, documentId: article.publication_issue.documentId } : undefined,
  };
}


export function getArticleDataEnglishcategory(article: Article | null | undefined) {
  // Validate article structure - return null for proper error handling
  if (!article || !article.title) {
    console.error('Invalid or missing article data');
    return null;
  }

  return {
    id: article.id,
    documentId: article.documentId,
    title: article.title,
    slug: article.slug || '',
    content: article.content || '',
    image: getArticleImage(article),
    category: getCategoryNameEn(article.category),
    author: {
      name: article.publication_author_name || getAuthorName(article.author),
      avatar: getAuthorAvatar(article.author),
      slug: getAuthorSlug(article.author),
    },
    publishedAt: formatPublishDate(article.publishedAt),
    BlogDate: article.BlogDate ? formatPublishDate(article.BlogDate) : undefined,
    language: article.language || 'en',
    viewCount: article.viewCount || 0,
    likes: article.likes || 0,
    tags: article.tags?.map(tag => tag.name) || [],
    InFeatured: article.InFeatured || false,
    InSlider: article.InSlider || false,
    publication_issue: article.publication_issue ? { Title: article.publication_issue.Title, documentId: article.publication_issue.documentId } : undefined,
  };
}

/**
 * Build query string for Strapi API
 */
export function buildQueryString(params: Record<string, string | string[] | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Create Strapi v5 filters for common queries
 * Note: Uses Strapi v5's built-in status=published for draft/publish
 * Note: Backend uses capital letters in some fields (Slug vs slug)
 */
export function createStrapiFilters(filters: {
  InFeatured?: boolean;
  InSlider?: boolean;
  language?: string;
  category?: string;
  tag?: string;
}): Record<string, string> {
  const strapiFilters: Record<string, string> = {};

  if (filters.InFeatured !== undefined) {
    strapiFilters['filters[InFeatured][$eq]'] = filters.InFeatured ? 'true' : 'false';
  }
  if (filters.InSlider !== undefined) {
    strapiFilters['filters[InSlider][$eq]'] = filters.InSlider ? 'true' : 'false';
  }
  if (filters.language) {
    strapiFilters['filters[language][$eq]'] = filters.language;
  }
  if (filters.category) {
    // Backend uses capital S in Slug
    strapiFilters['filters[category][Slug][$eq]'] = filters.category;
  }
  if (filters.tag) {
    strapiFilters['filters[tags][slug][$in]'] = filters.tag;
  }

  return strapiFilters;
}

/**
 * Create populate string for Strapi v5
 * Uses indexed populate syntax: populate[0]=field&populate[1]=field
 */
export function createPopulateString(fields: string[]): string {
  return fields.map((field, index) => `populate[${index}]=${encodeURIComponent(field)}`).join('&');
}
