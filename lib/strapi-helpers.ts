/**
 * Strapi Helper Functions
 * Utilities for transforming and normalizing Strapi data
 */

import { config } from './config';
import type { Article, Author, Category } from '@/types';

/**
 * Get full media URL from Strapi media object or path
 */
export function getMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath) return '/images/hero.jpg'; // Default fallback image
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${config.strapi.url}${mediaPath}`;
}

/**
 * Extract first image from article gallery or get featured image
 */
export function getArticleImage(article: Article): string {
  // Strapi v5 returns media directly or null
  if (article.featuredImage && typeof article.featuredImage === 'object' && 'url' in article.featuredImage) {
    return getMediaUrl(article.featuredImage.url);
  }
  if (article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0) {
    const firstImage = article.gallery[0];
    if (typeof firstImage === 'object' && 'url' in firstImage) {
      return getMediaUrl(firstImage.url);
    }
  }
  return '/images/placeholder.jpg';
}

/**
 * Get author name safely
 */
export function getAuthorName(author?: Author): string {
  if (!author) return 'Staff';
  // Handle both flat and nested structures for compatibility
  if (typeof author === 'object' && 'name' in author) {
    return (author as any).name || 'Staff';
  }
  return 'Staff';
}

/**
 * Get author avatar URL
 */
export function getAuthorAvatar(author?: Author): string | undefined {
  if (!author) return undefined;
  // Handle both flat and nested structures
  if (typeof author === 'object' && 'avatar' in author) {
    const avatar = (author as any).avatar;
    if (typeof avatar === 'string') {
      return getMediaUrl(avatar);
    }
    if (avatar && typeof avatar === 'object' && 'url' in avatar) {
      return getMediaUrl(avatar.url as string);
    }
  }
  return undefined;
}

/**
 * Get category name safely
 */
export function getCategoryName(category?: Category): string {
  if (!category) return 'Uncategorized';
  // Handle both flat and nested structures
  if (typeof category === 'object' && 'nameEn' in category) {
    const cat = category as any;
    return cat.nameEn || cat.name || 'Uncategorized';
  }
  return 'Uncategorized';
}

/**
 * Format publish date
 */
export function formatPublishDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
}

/**
 * Format publish date (Bengali option)
 */
export function formatPublishDateBn(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get reading time estimate
 */
export function estimateReadingTime(content: string): number {
  if (!content) return 1;
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
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
 * Safe access to nested article properties with defaults
 * Handles Strapi v5 flat response structure
 */
export function getArticleData(article: Article) {
  // Validate article structure
  if (!article || !article.title) {
    console.warn('Invalid article structure:', article);
    return {
      id: 0,
      title: 'Untitled',
      slug: '',
      excerpt: '',
      content: '',
      image: '/images/hero.jpg',
      category: 'Uncategorized',
      author: { name: 'Staff', avatar: undefined },
      publishedAt: new Date().toLocaleDateString('en-US'),
      language: 'en' as const,
      readTime: 1,
      viewCount: 0,
      likes: 0,
      tags: [],
      isFeatured: false,
      isEditorsPick: false,
      isHero: false,
    };
  }

  return {
    id: article.id,
    title: article.title || 'Untitled',
    slug: article.slug || '',
    excerpt: article.excerpt || '',
    content: article.content || '',
    image: getArticleImage(article),
    category: article.category && typeof article.category === 'object' && 'nameEn' in article.category
      ? article.category.nameEn || 'Uncategorized'
      : 'Uncategorized',
    author: {
      name: article.author && typeof article.author === 'object' && 'name' in article.author
        ? article.author.name
        : 'Staff',
      avatar: article.author && typeof article.author === 'object' && 'avatar' in article.author
        ? getMediaUrl(typeof article.author.avatar === 'string' ? article.author.avatar : undefined)
        : undefined,
    },
    publishedAt: formatPublishDate(article.publishedAt || new Date().toISOString()),
    language: article.language || 'en',
    readTime: article.readTime || estimateReadingTime(article.content),
    viewCount: article.viewCount || 0,
    likes: article.likes || 0,
    tags: Array.isArray(article.tags) 
      ? article.tags.map(tag => typeof tag === 'object' && 'name' in tag ? tag.name : '') 
      : [],
    isFeatured: article.isFeatured || false,
    isEditorsPick: article.isEditorsPick || false,
    isHero: article.isHero || false,
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
 * Create Strapi filters for common queries
 */
export function createStrapiFilters(filters: {
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isHero?: boolean;
  language?: string;
  category?: string;
  tag?: string;
  status?: string;
}): Record<string, string> {
  const strapiFilters: Record<string, string> = {};

  if (filters.isFeatured !== undefined) {
    strapiFilters['filters[isFeatured][$eq]'] = filters.isFeatured ? 'true' : 'false';
  }
  if (filters.isEditorsPick !== undefined) {
    strapiFilters['filters[isEditorsPick][$eq]'] = filters.isEditorsPick ? 'true' : 'false';
  }
  if (filters.isHero !== undefined) {
    strapiFilters['filters[isHero][$eq]'] = filters.isHero ? 'true' : 'false';
  }
  if (filters.language) {
    strapiFilters['filters[language][$eq]'] = filters.language;
  }
  if (filters.category) {
    strapiFilters['filters[category][slug][$eq]'] = filters.category;
  }
  if (filters.tag) {
    strapiFilters['filters[tags][slug][$in]'] = filters.tag;
  }
  if (filters.status) {
    // Note: Strapi uses 'storyState' not 'status'
    strapiFilters['filters[storyState][$eq]'] = filters.status;
  }

  return strapiFilters;
}

/**
 * Create populate string for including related data
 * Uses Strapi v5 syntax for nested populations
 */
export function createPopulateString(fields: string[]): string {
  // For Strapi v5, use dot notation for nested populations
  // Example: "author.avatar" becomes "populate=author.avatar"
  return fields.map(f => `populate=${encodeURIComponent(f)}`).join('&');
}
