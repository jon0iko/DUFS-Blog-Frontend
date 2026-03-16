/**
 * Server-side Strapi v5 API Client
 * For use in Next.js Server Components and API routes
 * Configured for NO CACHING - Always fetch fresh data from Strapi
 * 
 * Key Changes in Strapi v5:
 * - Response format is FLATTENED (no nested attributes)
 * - Use documentId to access specific documents
 * - Populate syntax: populate[0]=field&populate[1]=field
 * - Filter syntax: filters[field][$operator]=value
 */

import { config } from './config';
import type { 
  ArticleResponse, 
  AuthorResponse, 
  CategoryResponse, 
  BannerResponse, 
  NavigationResponse,
  Article,
  Author,
  Category
} from '@/types';

class ServerStrapiAPI {
  private baseURL: string;
  private apiToken: string;

  constructor() {
    this.baseURL = config.strapi.url;
    this.apiToken = config.strapi.apiToken;
  }

  /**
   * Make authenticated requests to Strapi v5 with Next.js caching
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
      // NO CACHING - Always fetch fresh data from Strapi
      cache: 'no-store',
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
   * Build populate query parameters for Strapi v5
   * Strapi v5: When you populate a relation, ALL its fields are automatically included
   * No need to specify nested fields like 'author.Avatar'
   */
  private buildPopulateString(fields: string[]): string {
    return fields.map((field, index) => `populate[${index}]=${field}`).join('&');
  }

  /**
   * Append article list populate params (featured image, category, tags, author with avatar)
   * Uses named-key syntax to allow deep populate of author.users_permissions_user.Avatar
   */
  private appendArticleListPopulate(params: URLSearchParams): void {
    params.append('populate[featuredImage]', 'true');
    params.append('populate[category]', 'true');
    params.append('populate[tags]', 'true');
    params.append('populate[author][populate][users_permissions_user][populate]', '*');
  }

  /**
   * Append article detail populate params (same as list + gallery, socialImage)
   */
  private appendArticleDetailPopulate(params: URLSearchParams): void {
    params.append('populate[featuredImage]', 'true');
    params.append('populate[gallery]', 'true');
    params.append('populate[category]', 'true');
    params.append('populate[tags]', 'true');
    params.append('populate[socialImage]', 'true');
    params.append('populate[author][populate][users_permissions_user][populate]', '*');
  }

  //Get 'Content' text field of single-type: 'text-reel-homepage'
  async getTextReelContent(): Promise<string> {
    const response = await this.request<{ data: { Content: string } }>(
      config.strapi.endpoints.textReel
    );
    return response.data?.Content ?? '';
  }
    
    

  /**
   * Get hero article (isHero = true)
   */
  async getHeroArticle(): Promise<Article | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isHero][$eq]', 'true');
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    
    this.appendArticleListPopulate(searchParams);

    const response = await this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get all hero articles (isHero = true) for carousel
   */
  async getHeroArticles(): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isHero][$eq]', 'true');
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    
    this.appendArticleListPopulate(searchParams);
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get featured articles (isFeatured = true)
   */
  async getFeaturedArticles(limit: number = 4): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isFeatured][$eq]', 'true');
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    searchParams.append('pagination[pageSize]', limit.toString());
    
    this.appendArticleListPopulate(searchParams);
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get editors choice articles (isEditorsPick = true)
   */
  async getEditorsChoiceArticles(limit: number = 4): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isEditorsPick][$eq]', 'true');
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    searchParams.append('pagination[pageSize]', limit.toString());
    
    this.appendArticleListPopulate(searchParams);
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get all published articles with pagination
   */
  async getAllArticles(page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    searchParams.append('pagination[page]', page.toString());
    searchParams.append('pagination[pageSize]', pageSize.toString());
    
    this.appendArticleListPopulate(searchParams);
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    this.appendArticleDetailPopulate(searchParams);
    
    const response = await this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get articles by category slug
   */
  async getArticlesByCategory(categorySlug: string, page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[category][Slug][$eq]', categorySlug); // Backend uses capital S in Slug
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    searchParams.append('pagination[page]', page.toString());
    searchParams.append('pagination[pageSize]', pageSize.toString());
    
    this.appendArticleListPopulate(searchParams);
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }


  /**
   * Get all active categories
   */
  async getCategories(): Promise<CategoryResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    searchParams.append('sort', 'sortOrder:asc');
    searchParams.append('populate', 'Illustration');
    
    return this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${searchParams.toString()}`
    );
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[Slug][$eq]', slug); // Backend uses capital S
    
    const response = await this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get active navigation items
   */
  async getNavigationItems(): Promise<NavigationResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    searchParams.append('sort', 'sortOrder:asc');
    
    return this.request<NavigationResponse>(
      `${config.strapi.endpoints.navigation}?${searchParams.toString()}`
    );
  }

  /**
   * Get active banners (considering date range)
   */
  async getActiveBanners(): Promise<BannerResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    searchParams.append('sort', 'priority:desc');
    
    const currentDate = new Date().toISOString();
    searchParams.append('filters[$or][0][startDate][$null]', 'true');
    searchParams.append('filters[$or][1][startDate][$lte]', currentDate);
    searchParams.append('filters[$or][0][endDate][$null]', 'true');
    searchParams.append('filters[$or][1][endDate][$gte]', currentDate);
    
    return this.request<BannerResponse>(
      `${config.strapi.endpoints.banners}?${searchParams.toString()}`
    );
  }

  /**
   * Get author by slug
   */
  async getAuthorBySlug(slug: string): Promise<Author | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    const populate = this.buildPopulateString(['Avatar']);
    const queryString = `${searchParams.toString()}&${populate}`;
    
    const response = await this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${queryString}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get all authors
   */
  async getAuthors(): Promise<AuthorResponse> {
    const searchParams = new URLSearchParams();
    
    const populate = this.buildPopulateString(['Avatar']);
    const queryString = `${searchParams.toString()}&${populate}`;
    
    return this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${queryString}`
    );
  }

  /**
   * Get articles by author documentId
   */
  async getArticlesByAuthor(authorDocumentId: string, page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[author][documentId][$eq]', authorDocumentId);
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    searchParams.append('sort', 'publishedAt:desc');
    searchParams.append('pagination[page]', page.toString());
    searchParams.append('pagination[pageSize]', pageSize.toString());
    
    this.appendArticleListPopulate(searchParams);
    
    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }
}

// Export singleton instance
export const serverStrapiAPI = new ServerStrapiAPI();

export default serverStrapiAPI;
