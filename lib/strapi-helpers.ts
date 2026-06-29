import { config } from './config';
import type { Article, Author, Category, StrapiMedia } from '@/types';
export function getMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath) return '/images/placeholder.jpg';
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${config.strapi.url}${mediaPath}`;
}

export function getStrapiMediaUrl(media?: StrapiMedia | null): string {
  if (!media) return '/images/placeholder.jpg';
  return getMediaUrl(media.url);
}

export type MediaSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'full';

// Strapi only generates a responsive format when the original is LARGER than the
// breakpoint, so "requested format → original" never 404s: if the format is
// missing, the original is already at/below that size.
export function getMediaUrlSized(media?: StrapiMedia | null, size: MediaSize = 'medium'): string {
  if (!media) return '/images/placeholder.jpg';
  if (size !== 'full') {
    const fmt = media.formats?.[size];
    if (fmt?.url) return getMediaUrl(fmt.url);
  }
  return getMediaUrl(media.url);
}

// Build a srcset from every variant Strapi actually produced (+ the original),
// so the browser can pick the lightest image that fits the device.
export function getMediaSrcSet(media?: StrapiMedia | null): string | undefined {
  if (!media) return undefined;
  const entries: string[] = [];
  const seen = new Set<number>();
  const push = (url?: string, width?: number) => {
    if (!url || !width || seen.has(width)) return;
    seen.add(width);
    entries.push(`${getMediaUrl(url)} ${width}w`);
  };
  const f = media.formats;
  if (f) {
    push(f.thumbnail?.url, f.thumbnail?.width);
    push(f.small?.url, f.small?.width);
    push(f.medium?.url, f.medium?.width);
    push(f.large?.url, f.large?.width);
  }
  push(media.url, media.width);
  return entries.length > 1 ? entries.join(', ') : undefined;
}

export function getMediaDimensions(media?: StrapiMedia | null): { width?: number; height?: number } {
  if (!media) return {};
  return { width: media.width, height: media.height };
}

export function getArticleImage(article: Article): string {
  if (article.featuredImage) {
    return getStrapiMediaUrl(article.featuredImage);
  }
  return '/images/placeholder.jpg';
}
export function getAuthorName(author?: Author, publicationAuthorName?: string): string {
  if (author?.Name && author.Name.trim()) return author.Name;
  if (publicationAuthorName && publicationAuthorName.trim()) return publicationAuthorName;
  return 'Staff';
}
export function getAuthorAvatar(author?: Author): string | undefined {
  if (!author) return '/images/avatarPlaceholder.png';
  const userAvatar = author.users_permissions_user?.Avatar?.url;
  if (userAvatar) {
    return userAvatar.startsWith('http') ? userAvatar : `${config.strapi.url}${userAvatar}`;
  }
  if (author.Avatar) {
    return getStrapiMediaUrl(author.Avatar);
  }
  return '/images/avatarPlaceholder.png';
}
export function getCategoryName(category?: Category): string {
  if (!category) return 'শ্রেণীবিহীন';
  return category.Name || 'শ্রেণীবিহীন';
}

export function getCategoryNameBn(category?: Category): string {
  if (!category) return 'শ্রেণীবিহীন';
  return category.nameBn || 'শ্রেণীবিহীন';
}

export function getCategoryNameEn(category?: Category): string {
  if (!category) return 'Uncategorized';
  return category.nameEn || 'Uncategorized';
}
function formatDate(dateString: string | undefined, locale: string, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString || new Date());
  return date.toLocaleDateString(locale, options);
}

export function formatPublishDate(dateString?: string): string {
  return formatDate(dateString, 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
}

export function formatPublishDateBn(dateString?: string): string {
  return formatDate(dateString, 'bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function estimateReadingTime(content: string): number {
  if (!content) return 1;
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '');
  const words = plainText.split(/\s+/).length;
  return Math.ceil(words / 200) || 1;
}

export function getAuthorSlug(author?: Author): string | undefined {
  return author?.slug;
}
export function getArticleData(article: Article | null | undefined, categoryNameFn = getCategoryName) {
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
    // Card-sized variant (≤750px) instead of the full-res original — the
    // browser still gets a sharp image at card dimensions for a fraction of the bytes.
    image: getMediaUrlSized(article.featuredImage, 'medium'),
    imageSrcSet: getMediaSrcSet(article.featuredImage),
    imageMedia: article.featuredImage ?? null,
    category: categoryNameFn(article.category),
    author: {
      name: getAuthorName(article.author, article.publication_author_name),
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
  return getArticleData(article, getCategoryNameEn);
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
