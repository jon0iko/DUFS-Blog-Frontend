import { config } from './config';
import {
  ArticleResponse,
  AuthorResponse,
  CategoryResponse,
  TagResponse,
  BannerResponse,
  NavigationResponse,
  Article,
  Category,
  Author,
  Tag,
  SiteConfig,
  Submission
} from '@/types';
import { getAuthorAvatar } from './strapi-helpers';

/**
 * Strapi v5 API Client for Client-Side Data Fetching
 * 
 * Key Changes in Strapi v5:
 * - Response format is FLATTENED (no nested attributes)
 * - Use documentId to access specific documents
 * - Populate syntax: populate[field]=*
 * - Filter syntax: filters[field][$operator]=value
 */
class StrapiAPI {
  private baseURL: string;
  private apiToken: string;

  constructor() {
    this.baseURL = config.strapi.url;
    this.apiToken = config.strapi.apiToken;
  }

  /**
   * Build populate query parameters for Strapi v5
   * Example: populate[0]=author&populate[1]=category
   */
  private buildPopulateParams(fields: string[]): URLSearchParams {
    const params = new URLSearchParams();
    fields.forEach((field, index) => {
      params.append(`populate[${index}]`, field);
    });
    return params;
  }

  /**
   * Make authenticated requests to Strapi v5
   * Configured for NO CACHING - Always fetch fresh data
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.apiToken}`;
    }

    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Disable caching - always fetch fresh data from Strapi
      cache: 'no-store',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Strapi API Error (${response.status}):`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }


  /**
   * Get articles with filters and pagination
   * Strapi v5 API: GET /api/articles
   */
  async getArticles(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    language?: 'en' | 'bn' | 'both';
    featured?: boolean;
    editorsPick?: boolean;
    storyState?: string;
    sort?: string;
    populate?: string[];
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Pagination
    if (params?.page) searchParams.append('pagination[page]', params.page.toString());
    if (params?.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    // Filters - Strapi v5 uses filters[field][$operator]=value
    if (params?.category) {
      searchParams.append('filters[category][Slug][$eq]', params.category);
    }
    if (params?.tag) {
      searchParams.append('filters[tags][slug][$in]', params.tag);
    }
    if (params?.language) {
      searchParams.append('filters[language][$eq]', params.language);
    }
    if (params?.featured) {
      searchParams.append('filters[isFeatured][$eq]', 'true');
    }
    if (params?.editorsPick) {
      searchParams.append('filters[isEditorsPick][$eq]', 'true');
    }
    if (params?.storyState) {
      searchParams.append('filters[storyState][$eq]', params.storyState);
    }
    
    // Sorting
    const sort = params?.sort || 'publishedAt:desc';
    searchParams.append('sort', sort);
    
    // Populate - default fields to populate
    const populate = params?.populate || ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get a single article by slug
   * Strapi v5: Filter by slug to get the document
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    // Populate all necessary fields for article detail page
    const populate = [
      'featuredImage',
      'gallery',
      'author',
      'category',
      'tags',
      'socialImage'
    ];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    const response = await this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );

    // Return first article or null
    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get a single article by documentId
   * Strapi v5: GET /api/articles/:documentId
   */
  async getArticleByDocumentId(documentId: string): Promise<Article> {
    const searchParams = new URLSearchParams();
    
    const populate = [
      'featuredImage',
      'gallery',
      'author',
      'category',
      'tags',
      'socialImage'
    ];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    const response = await this.request<{ data: Article; meta: object }>(
      `${config.strapi.endpoints.articles}/${documentId}?${searchParams.toString()}`
    );

    return response.data;
  }

  /**
   * Get featured articles (isFeatured = true)
   */
  async getFeaturedArticles(limit: number = 4): Promise<ArticleResponse> {
    return this.getArticles({
      featured: true,
      pageSize: limit,
      storyState: 'published',
      sort: 'publishedAt:desc'
    });
  }

  /**
   * Get editor's choice articles (isEditorsPick = true)
   */
  async getEditorsChoiceArticles(limit: number = 4): Promise<ArticleResponse> {
    return this.getArticles({
      editorsPick: true,
      pageSize: limit,
      storyState: 'published',
      sort: 'publishedAt:desc'
    });
  }

  /**
   * Get hero article (isHero = true)
   */
  async getHeroArticle(): Promise<Article | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isHero][$eq]', 'true');
    searchParams.append('filters[storyState][$eq]', 'published');
    
    const populate = ['featuredImage', 'author', 'category'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    const response = await this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get related articles based on category
   */
  async getRelatedArticles(
    currentArticleId: string,
    categorySlug: string,
    limit: number = 3
  ): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Filter by category and exclude current article
    searchParams.append('filters[category][Slug][$eq]', categorySlug);
    searchParams.append('filters[documentId][$ne]', currentArticleId);
    searchParams.append('filters[storyState][$eq]', 'published');
    
    // Pagination
    searchParams.append('pagination[pageSize]', limit.toString());
    
    // Sort by most recent
    searchParams.append('sort', 'publishedAt:desc');
    
    // Populate
    const populate = ['featuredImage', 'author', 'category'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }


  // ============================================
  // AUTHOR API METHODS
  // ============================================

  /**
   * Get all authors
   */
  async getAuthors(): Promise<AuthorResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('populate[0]', 'Avatar');
    
    return this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${searchParams.toString()}`
    );
  }

  /**
   * Get author by slug
   */
  async getAuthorBySlug(slug: string): Promise<Author | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    searchParams.append('populate[0]', 'Avatar');
    
    const response = await this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get articles by a specific author (by documentId)
   */
  async getAuthorArticles(authorDocumentId: string, page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Filter by author documentId
    searchParams.append('filters[author][documentId][$eq]', authorDocumentId);
    searchParams.append('filters[storyState][$eq]', 'published');
    
    // Pagination
    searchParams.append('pagination[page]', page.toString());
    searchParams.append('pagination[pageSize]', pageSize.toString());
    
    // Sort
    searchParams.append('sort', 'publishedAt:desc');
    
    // Populate
    const populate = ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }


  // ============================================
  // CATEGORY API METHODS
  // ============================================

  /**
   * Get all active categories
   */
  async getCategories(): Promise<CategoryResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    searchParams.append('sort', 'sortOrder:asc');
    
    return this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${searchParams.toString()}`
    );
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[Slug][$eq]', slug); // Note: Backend uses capital S in Slug
    
    const response = await this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  // ============================================
  // TAG API METHODS
  // ============================================

  /**
   * Get all tags
   */
  async getTags(): Promise<TagResponse> {
    return this.request<TagResponse>(config.strapi.endpoints.tags);
  }

  /**
   * Get tag by slug
   */
  async getTagBySlug(slug: string): Promise<Tag | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    const response = await this.request<TagResponse>(
      `${config.strapi.endpoints.tags}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }


  // ============================================
  // BANNER API METHODS
  // ============================================

  /**
   * Get active banners (considering date range and active status)
   */
  async getActiveBanners(): Promise<BannerResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    
    const currentDate = new Date().toISOString();
    searchParams.append('filters[$or][0][startDate][$null]', 'true');
    searchParams.append('filters[$or][1][startDate][$lte]', currentDate);
    searchParams.append('filters[$or][0][endDate][$null]', 'true');
    searchParams.append('filters[$or][1][endDate][$gte]', currentDate);
    
    searchParams.append('sort', 'priority:desc');
    
    return this.request<BannerResponse>(
      `${config.strapi.endpoints.banners}?${searchParams.toString()}`
    );
  }

  // ============================================
  // NAVIGATION API METHODS
  // ============================================

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

  // ============================================
  // SITE CONFIGURATION API METHODS
  // ============================================

  /**
   * Get site configuration (single type)
   * Note: Site config may not exist in your backend, adjust as needed
   */
  async getSiteConfig(): Promise<SiteConfig | null> {
    try {
      const searchParams = new URLSearchParams();
      const populate = ['logoLight', 'logoDark', 'favicon', 'defaultMetaImage', 'socialLinks'];
      populate.forEach((field, index) => {
        searchParams.append(`populate[${index}]`, field);
      });
      
      const response = await this.request<{ data: SiteConfig; meta: object }>(
        `${config.strapi.endpoints.siteConfig}?${searchParams.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.warn('Site config not available:', error);
      return null;
    }
  }


  // ============================================
  // SUBMISSION API METHODS
  // ============================================

  /**
   * Create a new submission
   */
  async createSubmission(submissionData: {
    title: string;
    excerpt: string;
    content: string;
    language: 'en' | 'bn' | 'both';
    categoryId: string; // documentId
    tagIds: string[]; // array of documentIds
    authorId: string; // documentId
  }, featuredImage?: File): Promise<{ data: Submission; meta: object }> {
    const formData = new FormData();
    
    // Prepare the data payload
    const dataPayload = {
      title: submissionData.title,
      excerpt: submissionData.excerpt,
      content: submissionData.content,
      language: submissionData.language,
      category: submissionData.categoryId,
      tags: submissionData.tagIds,
      author: submissionData.authorId,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    formData.append('data', JSON.stringify(dataPayload));

    if (featuredImage) {
      formData.append('files.featuredImage', featuredImage);
    }

    const headers: HeadersInit = {};
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return this.request<{ data: Submission; meta: object }>(config.strapi.endpoints.submissions, {
      method: 'POST',
      headers, // Don't set Content-Type for FormData
      body: formData
    });
  }

  // ============================================
  // SEARCH API METHODS
  // ============================================

  /**
   * Search content across articles
   */
  async searchContent(query: string, filters?: {
    contentType?: 'articles' | 'authors';
    category?: string;
    language?: 'en' | 'bn' | 'both';
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Search across multiple fields using $or operator
    searchParams.append('filters[$or][0][title][$containsi]', query);
    searchParams.append('filters[$or][1][excerpt][$containsi]', query);
    searchParams.append('filters[$or][2][content][$containsi]', query);
    
    if (filters?.category) {
      searchParams.append('filters[category][Slug][$eq]', filters.category);
    }
    
    if (filters?.language) {
      searchParams.append('filters[language][$eq]', filters.language);
    }

    // Only published articles
    searchParams.append('filters[storyState][$eq]', 'published');

    // Populate necessary fields
    const populate = ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  // ============================================
  // ANALYTICS METHODS
  // ============================================

  /**
   * Track article view (increment view count)
   * Note: This requires a custom endpoint in your Strapi backend
   */
  async trackArticleView(documentId: string): Promise<void> {
    try {
      await this.request(`/api/articles/${documentId}/view`, {
        method: 'POST'
      });
    } catch (error) {
      // Silently fail for analytics - don't break user experience
      console.warn('Failed to track article view:', error);
    }
  }
}

// Create and export a singleton instance
export const strapiAPI = new StrapiAPI();

/**
 * Utility: Transform Strapi v5 article to legacy format
 * For gradual migration of components that still use the old format
 */
export const transformStrapiArticleToLegacy = (strapiArticle: Article) => {
  // Handle featured image - in v5, it's already flattened
  const featuredImage = strapiArticle.featuredImage;
  const imageUrl = featuredImage?.url 
    ? (featuredImage.url.startsWith('http') ? featuredImage.url : `${config.strapi.url}${featuredImage.url}`)
    : '/images/hero.jpg';
  
  // Handle author - already flattened in v5, use helper for avatar
  const author = strapiArticle.author;
  const authorAvatar = author ? getAuthorAvatar(author) : undefined;
  
  // Handle category - already flattened in v5
  const category = strapiArticle.category;
  const categoryName = category?.Name || category?.nameEn || 'Blog';
  
  // Handle tags - already flattened in v5
  const tags = (strapiArticle.tags || []).map((tag: Tag) => tag.name);
  
  return {
    id: strapiArticle.id.toString(),
    title: strapiArticle.title,
    isBengali: strapiArticle.language === 'bn',
    slug: strapiArticle.slug,
    excerpt: strapiArticle.excerpt,
    content: strapiArticle.content,
    imageSrc: imageUrl,
    category: categoryName,
    author: {
      name: author?.Name || 'DUFS Blog',
      avatar: authorAvatar
    },
    publishedAt: strapiArticle.publishedAt 
      ? new Date(strapiArticle.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
    readTime: strapiArticle.readTime,
    viewCount: strapiArticle.viewCount,
    tags: tags,
    isFeatured: strapiArticle.isFeatured,
    isEditorsPick: strapiArticle.isEditorsPick
  };
};

export default strapiAPI; 
