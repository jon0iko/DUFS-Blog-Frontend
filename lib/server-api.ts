/**
 * Server-side Strapi API Client
 * For use in Next.js Server Components and API routes
 * Optimized for ISR (Incremental Static Regeneration)
 */

import { config } from './config';
import { createPopulateString, createStrapiFilters } from './strapi-helpers';
import type { ArticleResponse, SingleArticleResponse, AuthorResponse, CategoryResponse, BannerResponse, NavigationResponse } from '@/types';

// Cache for revalidation
const CACHE_REVALIDATE_TIME = 3600; // 1 hour in seconds

class ServerStrapiAPI {
  private baseURL: string;
  private apiToken: string;

  constructor() {
    this.baseURL = config.strapi.url;
    this.apiToken = config.strapi.apiToken;
  }

  /**
   * Make authenticated requests to Strapi
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      next: {
        revalidate: CACHE_REVALIDATE_TIME,
        ...options.next,
      },
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Strapi Error Response (${response.status}):`, errorBody);
        throw new Error(`Strapi API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get hero article (isHero = true)
   */
  async getHeroArticle(): Promise<SingleArticleResponse> {
    const filters = createStrapiFilters({ isHero: true, status: 'published' });
    const populate = createPopulateString(['featuredImage']);
    const queryString = `${new URLSearchParams(filters).toString()}&${populate}&sort=publishedAt:desc`;
    
    return this.request<SingleArticleResponse>(
      `${config.strapi.endpoints.articles}?${queryString}`
    );
  }

  /**
   * Get featured articles (isFeatured = true)
   */
  async getFeaturedArticles(limit: number = 4): Promise<ArticleResponse> {
    const filters = createStrapiFilters({ isFeatured: true, status: 'published' });
    const populate = createPopulateString(['featuredImage']);
    const queryString = `${new URLSearchParams(filters).toString()}&${populate}&sort=publishedAt:desc&pagination[pageSize]=${limit}`;
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${queryString}`
    );
  }

  /**
   * Get editors choice articles (isEditorsPick = true)
   */
  async getEditorsChoiceArticles(limit: number = 4): Promise<ArticleResponse> {
    const filters = createStrapiFilters({ isEditorsPick: true, status: 'published' });
    const populate = createPopulateString(['featuredImage']);
    const queryString = `${new URLSearchParams(filters).toString()}&${populate}&sort=publishedAt:desc&pagination[pageSize]=${limit}`;
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${queryString}`
    );
  }

  /**
   * Get all published articles with pagination
   */
  async getAllArticles(page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    const filters = createStrapiFilters({ status: 'published' });
    const populate = createPopulateString(['featuredImage']);
    const queryString = `${new URLSearchParams(filters).toString()}&${populate}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${queryString}`
    );
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    const populate = createPopulateString(['featuredImage', 'gallery', 'socialImage']);
    const queryString = `filters[slug][$eq]=${slug}&${populate}`;
    
    return this.request<SingleArticleResponse>(
      `${config.strapi.endpoints.articles}?${queryString}`
    );
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(categorySlug: string, limit: number = 12): Promise<ArticleResponse> {
    const filters = createStrapiFilters({ category: categorySlug, status: 'published' });
    const populate = createPopulateString(['featuredImage']);
    const queryString = `${new URLSearchParams(filters).toString()}&${populate}&sort=publishedAt:desc&pagination[pageSize]=${limit}`;
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${queryString}`
    );
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<CategoryResponse> {
    const queryString = `filters[isActive][$eq]=true&sort=sortOrder:asc`;
    
    return this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${queryString}`
    );
  }

  /**
   * Get navigation items
   */
  async getNavigationItems(): Promise<NavigationResponse> {
    const queryString = `filters[isActive][$eq]=true&sort=sortOrder:asc`;
    
    return this.request<NavigationResponse>(
      `${config.strapi.endpoints.navigation}?${queryString}`
    );
  }

  /**
   * Get active banners
   */
  async getActiveBanners(): Promise<BannerResponse> {
    const currentDate = new Date().toISOString();
    const filters = `filters[isActive][$eq]=true&filters[startDate][$lte]=${currentDate}&filters[endDate][$gte]=${currentDate}`;
    
    return this.request<BannerResponse>(
      `${config.strapi.endpoints.banners}?${filters}&sort=priority:desc`
    );
  }

  /**
   * Get author by slug
   */
  async getAuthorBySlug(slug: string): Promise<AuthorResponse> {
    const populate = createPopulateString(['avatar']);
    const queryString = `filters[slug][$eq]=${slug}&${populate}`;
    
    return this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${queryString}`
    );
  }

  /**
   * Get all active authors
   */
  async getAuthors(): Promise<AuthorResponse> {
    const populate = createPopulateString(['avatar']);
    const queryString = `filters[isActive][$eq]=true&${populate}`;
    
    return this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${queryString}`
    );
  }
}

// Export singleton instance
export const serverStrapiAPI = new ServerStrapiAPI();

export default serverStrapiAPI;
