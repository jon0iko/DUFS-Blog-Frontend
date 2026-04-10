import { config } from './config';
import { getToken } from './auth';
import {
  ArticleResponse,
  AuthorResponse,
  CategoryResponse,
  TagResponse,
  BannerResponse,
  NavigationResponse,
  IssueResponse,
  Article,
  Category,
  Author,
  Tag,
  SiteConfig,
  TermsAndConditions,
  Submission,
  Comment,
  Draft,
  DraftResponse,
  Publication,
  Publication_Issue
} from '@/types';
import { getAuthorAvatar } from './strapi-helpers';

/**
 * Bookmarked Article interface for account page
 */
export interface BookmarkedArticle {
  bookmarkDocumentId: string;
  articleId: number;
  articleDocumentId: string;
  title: string;
  slug: string;
  featuredImage?: string;
  authorName?: string;
  category?: string;
  language?: string;
  createdAt: string;
}

export interface UISocialLink {
  id: number;
  platform: string;
  href: string;
  icon?: string;
}

interface RawSocialLink {
  id?: number;
  Platform?: string;
  Link?: string;
  Logo?:
    | { url?: string }
    | { data?: { url?: string } | Array<{ url?: string }> }
    | Array<{ url?: string }>;
}

function resolveSocialLogoUrl(logo: RawSocialLink['Logo']): string | undefined {
  if (!logo) return undefined;

  if (Array.isArray(logo)) {
    const firstUrl = logo[0]?.url;
    if (!firstUrl) return undefined;
    return firstUrl.startsWith('http') ? firstUrl : `${config.strapi.url}${firstUrl}`;
  }

  const directUrl = (logo as { url?: string }).url;
  if (directUrl) {
    return directUrl.startsWith('http') ? directUrl : `${config.strapi.url}${directUrl}`;
  }

  const dataField = (logo as { data?: { url?: string } | Array<{ url?: string }> }).data;
  if (!dataField) return undefined;

  const nestedUrl = Array.isArray(dataField) ? dataField[0]?.url : dataField.url;
  if (!nestedUrl) return undefined;

  return nestedUrl.startsWith('http') ? nestedUrl : `${config.strapi.url}${nestedUrl}`;
}

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

  constructor() {
    this.baseURL = config.strapi.url;
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
   * Returns null for 404 errors (missing optional content)
   */
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

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
      
      // Handle 404 gracefully (optional content like banners, text-reel)
      if (response.status === 404) {
        console.debug(`Strapi resource not found (404): ${endpoint}`);
        return null as T;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Strapi API Error (${response.status}):`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // 204 No Content (e.g. DELETE) — return undefined rather than trying to parse an empty body
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Make user-authenticated requests to Strapi v5
   * Uses the user's JWT token from auth cookies
   */
  public async userRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const userToken = getToken();
    
    if (!userToken) {
      throw new Error('User not authenticated');
    }
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const reqConfig: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      cache: 'no-store',
      ...options,
    };

    try {
      const response = await fetch(url, reqConfig);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Strapi User API Error (${response.status}):`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Handle empty responses (e.g., 204 No Content or DELETE with no body)
      const contentType = response.headers.get('content-type');
      if (!contentType || response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('User API Request Error:', error);
      throw error;
    }
  }


  async getArticles(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    language?: 'en' | 'bn' | 'both';
    featured?: boolean;
    editorsPick?: boolean;
    sort?: string;
    populate?: string[];
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
   
    // Strapi v5: status=published is required to get published content
    searchParams.append('status', 'published');
   
    // Pagination
    if (params?.page) searchParams.append('pagination[page]', params.page.toString());
    if (params?.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
   
    // Filters
    if (params?.category) {
      searchParams.append('filters[category][Slug][$eq]', params.category);
    }
    if (params?.tag) {
      searchParams.append('filters[tags][slug][$in]', params.tag);
    }
    if (params?.language) {
      searchParams.append('filters[language][$eq]', params.language);
    }
    if (params?.editorsPick) {
      searchParams.append('filters[InFeatured][$eq]', 'true');
    }
   
    // Sorting
    const sort = params?.sort || 'BlogDate:desc';
    searchParams.append('sort', sort);

    // --- NEW: Top-Level Fields Selection ---
    // Grabbing the bare minimum needed for an article card/list view
    const defaultFields = ['title', 'slug', 'BlogDate', 'language', 'createdAt', 'updatedAt', 'publishedAt'];
    defaultFields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
   
    // --- NEW: Optimized Population ---
    if (params?.populate) {
      // If a custom populate array is passed, use it (escape hatch if a specific view needs more data)
      params.populate.forEach((field, index) => {
        searchParams.append(`populate[${index}]`, field);
      });
    } else {
      // Highly optimized default population mapping
      
      // 1. Featured Image
      searchParams.append('populate[featuredImage][fields][0]', 'url');
      searchParams.append('populate[featuredImage][fields][1]', 'alternativeText');
      
      // 2. Author & Avatar (Secure & Minimal)
      searchParams.append('populate[author][fields][0]', 'Name');
      searchParams.append('populate[author][fields][1]', 'slug');
      searchParams.append('populate[author][populate][users_permissions_user][fields][0]', 'id'); // Blocks sensitive data
      searchParams.append('populate[author][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');
      
      // 3. Category
      searchParams.append('populate[category][fields][0]', 'Name');
      searchParams.append('populate[category][fields][1]', 'Slug');
      searchParams.append('populate[category][fields][2]', 'nameEn');
      searchParams.append('populate[category][fields][3]', 'nameBn');
      
      // 4. Tags
      searchParams.append('populate[tags][fields][0]', 'name');
      searchParams.append('populate[tags][fields][1]', 'slug');
      
      // 5. Publication Issue
      searchParams.append('populate[publication_issue][fields][0]', 'id'); 
    }


    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
}

  /**
   * Get articles with MINIMAL data for card displays
   * Optimized for ArticleCard and RelatedArticleCard components
   * Only fetches: title, slug, featuredImage, category, author, date fields, language
   * Reduces payload by ~60% compared to full article fetch
   */
  async getArticlesMinimal(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    language?: 'en' | 'bn' | 'both';
    featured?: boolean;
    editorsPick?: boolean;
    sort?: string;
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5: status=published is required to get published content
    searchParams.append('status', 'published');
    
    // Pagination
    if (params?.page) searchParams.append('pagination[page]', params.page.toString());
    if (params?.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    // Filters - same as full version
    if (params?.category) {
      searchParams.append('filters[category][Slug][$eq]', params.category);
    }
    if (params?.tag) {
      searchParams.append('filters[tags][slug][$in]', params.tag);
    }
    if (params?.language) {
      searchParams.append('filters[language][$eq]', params.language);
    }
    if (params?.editorsPick) {
      searchParams.append('filters[InFeatured][$eq]', 'true');
    }
    
    // Sorting
    const sort = params?.sort || 'BlogDate:desc';
    searchParams.append('sort', sort);
    
    // Fields - only minimal fields for card display
    const fields = ['id', 'title', 'slug', 'language', 'BlogDate', 'publishedAt', 'viewCount', 'likes', 'publication_author_name'];
    fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
    
    // Populate only essentials: featured image, category, author, publication_issue
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[category]', 'true');
    searchParams.append('populate[author][fields][0]', 'Name');
    searchParams.append('populate[author][fields][1]', 'slug');
    searchParams.append('populate[publication_issue][fields][0]', 'Title');

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get a single article by slug
   * Strapi v5: Filter by slug to get the document
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
      const query = new URLSearchParams({
        'filters[slug][$eq]': slug,
        'status': 'published',
        
        // 1. Core Article Fields
        'fields[0]': 'title',
        'fields[1]': 'content',
        'fields[2]': 'publishedAt',
        'fields[3]': 'publication_author_name',
        'fields[4]': 'DisableComments',
        'fields[5]': 'slug',
        'fields[6]': 'BlogDate',
        'fields[7]': 'viewCount',
        'fields[8]': 'likes',
        'fields[9]': 'language',

        'populate[featuredImage][fields][0]': 'url',

        // 3. Category
        'populate[category][fields][0]': 'Name',
        'populate[category][fields][1]': 'Slug',
        'populate[category][fields][2]': 'nameEn',
        'populate[category][fields][3]': 'nameBn',

        // 4. Tags
        'populate[tags][fields][0]': 'name',

        // 5. Publication Issue Cover Image
        'populate[publication_issue][populate][CoverImage][fields][0]': 'url',

        // 6. Author Profile & Deep-Nested Avatar URL
        'populate[author][fields][0]': 'Name',
        'populate[author][fields][1]': 'slug',
        'populate[author][populate][users_permissions_user][fields][0]': 'username',
        'populate[author][populate][users_permissions_user][populate][Avatar][fields][0]': 'url'
      }).toString();

      const response = await this.request<ArticleResponse>(
        `${config.strapi.endpoints.articles}?${query}`
      );

      return response.data.length > 0 ? response.data[0] : null;
    }

  /**
   * Get a single article by documentId
   * Strapi v5: GET /api/articles/:documentId
   */
  /**
   * Get a single article by documentId
   * Strapi v5: GET /api/articles/:documentId
   * Note: This is an orphaned method. Use getArticleBySlug instead for active usage.
   */
  async getArticleByDocumentId(documentId: string): Promise<Article> {
    const searchParams = new URLSearchParams();
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    
    // Core article fields
    searchParams.append('fields[0]', 'title');
    searchParams.append('fields[1]', 'content');
    searchParams.append('fields[2]', 'slug');
    searchParams.append('fields[3]', 'BlogDate');
    searchParams.append('fields[4]', 'publishedAt');
    searchParams.append('fields[5]', 'viewCount');
    searchParams.append('fields[6]', 'likes');
    searchParams.append('fields[7]', 'language');
    
    // Minimal populate - only essentials for article display
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[category][fields][0]', 'Name');
    searchParams.append('populate[category][fields][1]', 'Slug');
    searchParams.append('populate[tags][fields][0]', 'name');
    searchParams.append('populate[publication_issue][populate][CoverImage][fields][0]', 'url');
    // Author with only avatar url (no full wildcard)
    searchParams.append('populate[author][fields][0]', 'Name');
    searchParams.append('populate[author][fields][1]', 'slug');
    searchParams.append('populate[author][populate][users_permissions_user][fields][0]', 'id');
    searchParams.append('populate[author][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');

    const response = await this.request<{ data: Article; meta: object }>(
      `${config.strapi.endpoints.articles}/${documentId}?${searchParams.toString()}`
    );

    return response.data;
  }



  /**
   * Get editor's choice articles (InFeatured = true)
   */
  async getEditorsChoiceArticles(limit: number = 4): Promise<ArticleResponse> {
    return this.getArticles({
      editorsPick: true,
      pageSize: limit,
      sort: 'BlogDate:desc'
    });
  }

  /**
   * Get hero article (InSlider = true)
   */
  async getHeroArticle(): Promise<Article | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[InSlider][$eq]', 'true');
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    
    // Minimal fields for hero display
    searchParams.append('fields[0]', 'title');
    searchParams.append('fields[1]', 'slug');
    searchParams.append('fields[2]', 'BlogDate');
    searchParams.append('fields[3]', 'publishedAt');
    
    // Populate only essentials: featured image and author with avatar
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[author][fields][0]', 'Name');
    searchParams.append('populate[author][fields][1]', 'slug');
    searchParams.append('populate[author][populate][users_permissions_user][fields][0]', 'id');
    searchParams.append('populate[author][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');

    const response = await this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get all hero articles (InSlider = true) for carousel
   * Optimized: Only fetches author.Name and author.users_permissions_user.Avatar.url
   * Restricts fields to prevent exposing personal user information (email, phone, bio, etc.)
   */
  async getHeroArticles(): Promise<ArticleResponse> {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[InSlider][$eq]', 'true');
      searchParams.append('status', 'published');
      searchParams.append('sort', 'updatedAt:desc');

      searchParams.append('fields[0]', 'title');
      searchParams.append('fields[1]', 'BlogDate');
      searchParams.append('fields[2]', 'createdAt');
      searchParams.append('fields[3]', 'updatedAt');
      searchParams.append('fields[4]', 'publishedAt');
      searchParams.append('fields[5]', 'slug');
      
      // Populate featuredImage - only url field
      searchParams.append('populate[featuredImage][fields][0]', 'url');
      
      // Populate author - only Name field
      searchParams.append('populate[author][fields][0]', 'Name');

      searchParams.append('populate[author][populate][users_permissions_user][fields][0]', 'id');
      
      // Populate Avatar relation and only get url field
      searchParams.append('populate[author][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');

      return this.request<ArticleResponse>(
        `${config.strapi.endpoints.articles}?${searchParams.toString()}`
      );
  }

  /**
   * Get featured articles (different from editors choice)
   */
  async getFeaturedArticles(limit: number = 12): Promise<ArticleResponse> {
    return this.getArticles({
      pageSize: limit,
      sort: 'BlogDate:desc',
      populate: ['featuredImage', 'author', 'category', 'tags', 'publication_issue']
    });
  }

  /**
   * Get text reel content for homepage marquee
   */
  async getTextReelContent(): Promise<string> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[Show][$eq]', 'true');
    const response = await this.request<any>(
      `${config.strapi.endpoints.textReel}?${searchParams.toString()}`
    );
    return response?.data?.Content ?? '';
  }

  /**
   * Get all publications
   */
  async getPublications(includeHidden: boolean = false): Promise<any> {
    const searchParams = new URLSearchParams();
    searchParams.append('populate[Image][fields][0]', 'url');
    
    if (!includeHidden) {
      searchParams.append('filters[Hide][$eq]', 'false');
    }

    return this.request<any>(
      `${config.strapi.endpoints.publications}?${searchParams.toString()}`
    );
  }

  /**
   * Get publications shown on home page
   */
  async getHomePublications(limit: number = 2): Promise<Publication[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[Hide][$eq]', 'false');
    searchParams.append('filters[ShowInHome][$eq]', 'true');
    searchParams.append('sort', 'updatedAt:desc');
    searchParams.append('pagination[pageSize]', limit.toString());
    // Only fetch Image.url field (not entire Image object)
    searchParams.append('populate[Image][fields][0]', 'url');

    const response = await this.request<any>(
      `${config.strapi.endpoints.publications}?${searchParams.toString()}`
    );

    return response.data || [];
  }

  /**
   * Get articles by category with pagination
   * Used for loading more articles in a specific category
   */
  async getArticlesByCategory(
    categorySlug: string,
    limit: number = 6,
    offset: number = 0
  ): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Filter by category slug
    searchParams.append('filters[category][Slug][$eq]', categorySlug);
    
    // Pagination
    searchParams.append('pagination[pageSize]', limit.toString());
    searchParams.append('pagination[start]', offset.toString());
    
    // Sort by most recent
    searchParams.append('sort', 'BlogDate:desc');
    
    // Minimal fields for card display
    const fields = ['id', 'title', 'slug', 'language', 'BlogDate', 'publishedAt', 'viewCount', 'likes'];
    fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
    
    // Populate only essentials: featured image and category
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[category][fields][0]', 'Name');
    searchParams.append('populate[category][fields][1]', 'Slug');

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get related articles based on category (faster, basic filtering)
   * Used as fallback when full recommendations aren't needed
   * Optimized with minimal field and populate for card display
   */
  async getRelatedArticles(
    currentArticleId: string,
    categorySlug: string,
    limit: number = 3
  ): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Filter by category and exclude current article
    searchParams.append('filters[category][Slug][$eq]', categorySlug);
    searchParams.append('filters[documentId][$ne]', currentArticleId);
    
    // Pagination
    searchParams.append('pagination[pageSize]', limit.toString());
    
    // Sort by most recent
    searchParams.append('sort', 'BlogDate:desc');
    
    // Fields - only minimal for card display
    const fields = ['id', 'title', 'slug', 'language', 'BlogDate', 'publishedAt', 'viewCount', 'likes'];
    fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
    
    // Populate only essentials for card display (minimal fields only)
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[category][fields][0]', 'Name');
    // author and publication_issue are not displayed in cards, so don't populate

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Get articles for intelligent recommendations (MINIMAL - no content field)
   * Fetches a larger pool for client-side ranking without heavy content payloads
   * Only fetches fields needed for: category match, tag overlap, recency, popularity, language
   */
  async getRecommendationsCandidates(
    currentArticleId: string,
    categorySlug: string,
    limit: number = 12
  ): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Fetch all articles regardless of category for diversity
    // Don't filter by category - let client-side ranking decide what's relevant
    searchParams.append('filters[documentId][$ne]', currentArticleId);
    
    // Fetch more than needed to implement smart time-based sampling
    // Will fetch 4 latest + 4 oldest + 4 from middle = 12 candidates
    searchParams.append('pagination[pageSize]', (limit * 3).toString());
    
    // Sort by published date (latest first) for smart sampling
    searchParams.append('sort', 'BlogDate:desc');
    
    // Fields - MINIMAL, exclude heavy content field
    // Include only: id, title, slug, language, dates, engagement, category metadata
    const fields = [
      'id',
      'title',
      'slug',
      'language',
      'BlogDate',
      'publishedAt',
      'viewCount',
      'likes'
    ];
    fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
    
    // Populate fields needed for scoring algorithm - only specific fields for minimal payload
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[author][fields][0]', 'Name');
    searchParams.append('populate[author][fields][1]', 'slug');
    searchParams.append('populate[category][fields][0]', 'Name');
    searchParams.append('populate[category][fields][1]', 'Slug');
    searchParams.append('populate[tags][fields][0]', 'name'); // Needed for tag overlap scoring

    const response = await this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );

    // Smart sampling: pick 4 latest, 4 oldest, 4 from middle
    if (response.data.length <= limit) {
      return response; // Return all if fewer than limit
    }

    const articles = response.data;
    const result: typeof articles = [];

    // 4 Latest (already sorted first)
    result.push(...articles.slice(0, 4));

    // 4 Oldest (from the end)
    if (articles.length >= 8) {
      result.push(...articles.slice(articles.length - 4));
    }

    // 4 From middle
    if (articles.length > 8) {
      const middleStart = Math.floor((articles.length - 8) / 2);
      const middleArticles = articles.slice(middleStart, middleStart + 4);
      result.push(...middleArticles);
    }

    // Remove duplicates and return up to `limit` articles
    const seen = new Set<string>();
    const unique = result.filter((article) => {
      if (seen.has(article.documentId)) return false;
      seen.add(article.documentId);
      return true;
    });

    return {
      ...response,
      data: unique.slice(0, limit),
    };
  }

  /**
   * Get articles by publication issue
   */
  async getArticlesByIssue(
    issueDocumentId: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Filter by issue relation (assuming the relation on Article is named publication_issue)
    searchParams.append('filters[publication_issue][documentId][$eq]', issueDocumentId);
    
    // Pagination
    searchParams.append('pagination[page]', page.toString());
    searchParams.append('pagination[pageSize]', pageSize.toString());
    
    // Sort by most recent
    searchParams.append('sort', 'BlogDate:desc');
    
    // Minimal fields for card display
    const fields = ['id', 'title', 'slug', 'language', 'BlogDate', 'publishedAt', 'viewCount', 'likes'];
    fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
    
    // Populate only essentials: featured image and category
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[category][fields][0]', 'Name');
    searchParams.append('populate[category][fields][1]', 'Slug');

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * Update article likes count
   * Strapi v5: PUT /api/articles/:documentId
   */
  async updateArticleLikes(documentId: string, likesCount: number): Promise<Article> {
    return this.request<{ data: Article; meta: object }>(
      `${config.strapi.endpoints.articles}/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          data: {
            likes: likesCount
          }
        })
      }
    ).then(response => response.data);
  }


  // ============================================
  // AUTHOR API METHODS
  // ============================================

  /**
   * Get all authors
   * Note: This is an orphaned method. Not currently used in the application.
   * Optimized: Only fetches necessary author fields with minimal population
   */
  async getAuthors(): Promise<AuthorResponse> {
    const searchParams = new URLSearchParams();
    // Only necessary author fields
    searchParams.append('fields[0]', 'Name');
    searchParams.append('fields[1]', 'slug');
    searchParams.append('fields[2]', 'Bio');
    searchParams.append('fields[3]', 'createdAt');
    
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
    // Only fetch necessary author fields
    searchParams.append('fields[0]', 'slug');
    searchParams.append('fields[1]', 'Name');
    searchParams.append('fields[2]', 'Bio');
    searchParams.append('fields[3]', 'createdAt');
    // Only Avatar url from user relation
    searchParams.append('populate[users_permissions_user][fields][0]', 'id');
    searchParams.append('populate[users_permissions_user][populate][Avatar][fields][0]', 'url');
    
    const response = await this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${searchParams.toString()}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Get articles by a specific author (by documentId)
   * Optimized: Only fetches minimal fields needed for article card display
   */
  async getAuthorArticles(authorDocumentId: string, page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Filter by author documentId
    searchParams.append('filters[author][documentId][$eq]', authorDocumentId);
    
    // Pagination
    searchParams.append('pagination[page]', page.toString());
    searchParams.append('pagination[pageSize]', pageSize.toString());
    
    // Sort
    searchParams.append('sort', 'BlogDate:desc');
    
    // Minimal fields for card display
    const fields = ['id', 'title', 'slug', 'BlogDate', 'publishedAt', 'viewCount', 'likes'];
    fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
    
    // Populate only essentials: featured image and category (for display)
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[category][fields][0]', 'Name');
    searchParams.append('populate[category][fields][1]', 'nameEn');

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

  /**
   * Create a new tag
   */
  async createTag(name: string): Promise<Tag> {
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const response = await this.request<{ data: Tag }>(
      config.strapi.endpoints.tags,
      {
        method: 'POST',
        body: JSON.stringify({
          data: { name, slug },
        }),
      }
    );

    return response.data;
  }

  /**
   * Create tag if it doesn't exist, or return existing tag
   */
  async getOrCreateTag(name: string): Promise<Tag> {
    // Generate slug for lookup
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if tag exists
    const existingTag = await this.getTagBySlug(slug);
    if (existingTag) {
      return existingTag;
    }

    // Create new tag
    return this.createTag(name);
  }

  /**
   * Delete a tag by ID
   */
  async deleteTag(id: number): Promise<void> {
    await this.request<void>(
      `${config.strapi.endpoints.tags}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }


  // ============================================
  // BANNER API METHODS
  // ============================================

  /**
   * Get active banners (considering date range and active status)
   */
  async getBannerContent(): Promise<BannerResponse> {
    const searchParams = new URLSearchParams();
    // searchParams.append('filters[isActive][$eq]', 'true');
    
    // const currentDate = new Date().toISOString();
    // searchParams.append('filters[$or][0][startDate][$null]', 'true');
    // searchParams.append('filters[$or][1][startDate][$lte]', currentDate);
    // searchParams.append('filters[$or][0][endDate][$null]', 'true');
    // searchParams.append('filters[$or][1][endDate][$gte]', currentDate);
    
    // searchParams.append('sort', 'priority:desc');
    //filter by active banners only
    searchParams.append('filters[Active][$eq]', 'true');
    
    const response = await this.request<BannerResponse>(
      `${config.strapi.endpoints.banners}?${searchParams.toString()}`
    );
    return response ?? { data: [] as any, meta: {} };
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
    
    return this.request<NavigationResponse>(
      `${config.strapi.endpoints.navigation}?${searchParams.toString()}`
    );
  }

  /**
   * Get active social links for shared layout usage (Sidebar/Footer)
   */
  async getSocialLinks(): Promise<UISocialLink[]> {
    const searchParams = new URLSearchParams();

    // Only populate the url field from Logo media to minimize payload
    searchParams.append('populate[Logo][fields][0]', 'url');

    const response = await this.request<{ data: RawSocialLink[]; meta: object }>(
      `${config.strapi.endpoints.socialLinks}?${searchParams.toString()}`
    );

    return response.data
      .map((item): UISocialLink | null => {
        const id = typeof item.id === 'number' ? item.id : 0;
        const platform = String(item.Platform ?? '').trim();
        const href = String(item.Link ?? '').trim();
        const icon = resolveSocialLogoUrl(item.Logo);

        if (!platform || !href) {
          return null;
        }

        return {
          id,
          platform,
          href,
          icon,
        };
      })
      .filter((item): item is UISocialLink => Boolean(item));
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

  /**
   * Get terms and conditions content (single type)
   * Strapi v5: GET /api/terms-and-conditions
   */
  async getTermsAndConditions(): Promise<TermsAndConditions | null> {
    try {
      const response = await this.request<{ data: TermsAndConditions; meta: object }>(
        '/api/terms-and-condition'
      );      
      return response.data || null;
    } catch (error) {
      console.warn('Terms and conditions not available:', error);
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
      content: submissionData.content,
      language: submissionData.language,
      category: submissionData.categoryId,
      tags: submissionData.tagIds,
      author: submissionData.authorId,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      BlogDate: null, // Will be set by admin later
      SubmitDate: new Date().toISOString(), // Current date/time when submitted
    };

    formData.append('data', JSON.stringify(dataPayload));

    if (featuredImage) {
      formData.append('files.featuredImage', featuredImage);
    }

    const headers: HeadersInit = {};

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
   * Search content across articles (title, content, author name, tags)
   * Uses multiple $or filters for comprehensive search
   */
  async searchArticles(query: string, options?: {
    page?: number;
    pageSize?: number;
    category?: string;
    language?: 'en' | 'bn' | 'both';
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Search across multiple fields using $or operator
    // Includes: title, titleBn, content, contentBn, author name, tags
    searchParams.append('filters[$or][0][title][$containsi]', query);
    searchParams.append('filters[$or][2][content][$containsi]', query);
    searchParams.append('filters[$or][4][author][Name][$containsi]', query);
    searchParams.append('filters[$or][5][tags][name][$containsi]', query);
    
    // Additional filters
    if (options?.category) {
      searchParams.append('filters[category][Slug][$eq]', options.category);
    }
    
    if (options?.language) {
      searchParams.append('filters[language][$eq]', options.language);
    }

    // Pagination
    searchParams.append('pagination[page]', (options?.page || 1).toString());
    searchParams.append('pagination[pageSize]', (options?.pageSize || 10).toString());

    // Strapi v5 draft/publish system - only get published articles
    searchParams.append('status', 'published');
    
    // Sort by relevance (most recent first as fallback)
    searchParams.append('sort', 'BlogDate:desc');

    // Populate only necessary fields for search result cards
      searchParams.append('fields[0]', 'title');
      searchParams.append('fields[1]', 'BlogDate');
      searchParams.append('fields[2]', 'createdAt');
      searchParams.append('fields[3]', 'updatedAt');
      searchParams.append('fields[4]', 'publishedAt');
      searchParams.append('fields[5]', 'slug');
    searchParams.append('populate[featuredImage][fields][0]', 'url');
    searchParams.append('populate[author][fields][0]', 'Name');
    searchParams.append('populate[author][fields][1]', 'slug');
    searchParams.append('populate[category][fields][0]', 'Name');
    searchParams.append('populate[category][fields][1]', 'Slug');
    searchParams.append('populate[tags][fields][0]', 'name');

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

  // ============================================
  // COMMENTS API METHODS
  // ============================================

  /**
   * Get comments for a specific article
   * Only fetches top-level comments (not replies) - replies are populated
   */
  async getCommentsByArticle(articleDocumentId: string): Promise<Comment[]> {
    try {
      const searchParams = new URLSearchParams();
      
      // Filter by article documentId and only top-level comments (no parent)
      searchParams.append('filters[article][documentId][$eq]', articleDocumentId);
      searchParams.append('filters[parentComment][$null]', 'true');
      searchParams.append('filters[$or][0][HideComment][$eq]', 'false');
      searchParams.append('filters[$or][1][HideComment][$null]', 'true');
      
      // Sort by date (newest first)
      searchParams.append('sort', 'CommentDateTime:desc');
      
      // Populate user with only necessary fields
      searchParams.append('populate[users_permissions_user][fields][0]', 'id');
      searchParams.append('populate[users_permissions_user][fields][1]', 'username');
      searchParams.append('populate[users_permissions_user][populate][Avatar][fields][0]', 'url');
      // Populate replies with only necessary fields
      searchParams.append('populate[replies][fields][0]', 'id');
      searchParams.append('populate[replies][fields][1]', 'Content');
      searchParams.append('populate[replies][fields][2]', 'CommentDateTime');
      searchParams.append('populate[replies][fields][3]', 'likeCount');
      searchParams.append('populate[replies][populate][users_permissions_user][fields][0]', 'id');
      searchParams.append('populate[replies][populate][users_permissions_user][fields][1]', 'username');
      searchParams.append('populate[replies][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');

      const response = await this.request<{ data: Comment[]; meta: object }>(
        `/api/comments?${searchParams.toString()}`
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Create a new comment on an article
   */
  async createComment(
    articleDocumentId: string,
    content: string,
    userId?: number
  ): Promise<Comment> {
    const commentData: Record<string, unknown> = {
      Content: content,
      CommentDateTime: new Date().toISOString(),
      article: { connect: [{ documentId: articleDocumentId }] }, // Strapi v5 relation connect by documentId
      isReplyable: true,
      likeCount: 0,
    };

    if (userId) {
      // Use connect syntax for user relation in Strapi v5
      commentData.users_permissions_user = { connect: [userId] };
    }

    const response = await this.request<{ data: Comment }>(
      '/api/comments',
      {
        method: 'POST',
        body: JSON.stringify({ data: commentData }),
      }
    );

    return response.data;
  }

  /**
   * Create a reply to an existing comment
   */
  async createCommentReply(
    parentCommentDocumentId: string,
    articleDocumentId: string,
    content: string,
    userId?: number
  ): Promise<Comment> {
    const replyData: Record<string, unknown> = {
      Content: content,
      CommentDateTime: new Date().toISOString(),
      parentComment: { connect: [{ documentId: parentCommentDocumentId }] }, // Strapi v5 relation connect by documentId
      article: { connect: [{ documentId: articleDocumentId }] }, // Strapi v5 relation connect by documentId
      isReplyable: false, // Replies are not replyable by default
      likeCount: 0,
    };

    if (userId) {
      // Use connect syntax for user relation in Strapi v5
      replyData.users_permissions_user = { connect: [userId] };
    }

    const response = await this.request<{ data: Comment }>(
      '/api/comments',
      {
        method: 'POST',
        body: JSON.stringify({ data: replyData }),
      }
    );

    return response.data;
  }

  /**
   * Update comment likes count
   */
  async updateCommentLikes(documentId: string, likeCount: number): Promise<Comment> {
    const response = await this.request<{ data: Comment }>(
      `/api/comments/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          data: { likeCount },
        }),
      }
    );

    return response.data;
  }

  /**
   * Delete a comment (by documentId)
   */
  async deleteComment(documentId: string): Promise<void> {
    await this.request(`/api/comments/${documentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // USER COMMENT LIKE API METHODS
  // ============================================

  async hasUserLikedComment(userId: number, commentId: number): Promise<{ liked: boolean; likeId?: string }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[user][id][$eq]', userId.toString());
      searchParams.append('filters[comment][id][$eq]', commentId.toString());

      const response = await this.request<{ data: Array<{ id: number; documentId: string }> }>(
        `/api/user-comment-likes?${searchParams.toString()}`
      );

      if (response.data && response.data.length > 0) {
        return { liked: true, likeId: response.data[0].documentId };
      }
      return { liked: false };
    } catch {
      return { liked: false };
    }
  }

  async likeComment(userId: number, commentId: number): Promise<{ success: boolean; likeId?: string }> {
    try {
      const now = new Date().toISOString();
      const response = await this.userRequest<{ data: { id: number; documentId: string } }>(
        '/api/user-comment-likes',
        {
          method: 'POST',
          body: JSON.stringify({
            data: {
              user: { connect: [userId] },
              comment: { connect: [commentId] },
              likedAt: now,
              publishedAt: now,
            },
          }),
        }
      );
      return { success: true, likeId: response.data.documentId };
    } catch {
      return { success: false };
    }
  }

  async unlikeComment(likeDocumentId: string): Promise<boolean> {
    try {
      await this.userRequest(`/api/user-comment-likes/${likeDocumentId}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // USER ARTICLE LIKE API METHODS
  // ============================================

  /**
   * Check if user has liked an article
   */
  async hasUserLikedArticle(userId: number, articleId: number): Promise<{ liked: boolean; likeId?: string }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[user][id][$eq]', userId.toString());
      searchParams.append('filters[article][id][$eq]', articleId.toString());

      const response = await this.request<{ data: Array<{ id: number; documentId: string }> }>(
        `/api/user-article-likes?${searchParams.toString()}`
      );

      if (response.data && response.data.length > 0) {
        return { liked: true, likeId: response.data[0].documentId };
      }
      return { liked: false };
    } catch (error) {
      console.error('Error checking user like:', error);
      return { liked: false };
    }
  }

  /**
   * Create a like for an article (user-specific)
   */
  async likeArticle(userId: number, articleId: number): Promise<{ success: boolean; likeId?: string }> {
    try {
      const response = await this.userRequest<{ data: { id: number; documentId: string } }>(
        '/api/user-article-likes',
        {
          method: 'POST',
          body: JSON.stringify({
            data: {
              user: { connect: [userId] },
              article: { connect: [articleId] },
            },
          }),
        }
      );
      return { success: true, likeId: response.data.documentId };
    } catch (error) {
      console.error('Error liking article:', error);
      return { success: false };
    }
  }

  /**
   * Remove a like from an article
   */
  async unlikeArticle(likeDocumentId: string): Promise<boolean> {
    try {
      await this.userRequest(`/api/user-article-likes/${likeDocumentId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error unliking article:', error);
      return false;
    }
  }

  // ============================================
  // BOOKMARK API METHODS
  // ============================================

  /**
   * Check if user has bookmarked an article
   */
  async hasUserBookmarkedArticle(userId: number, articleId: number): Promise<{ bookmarked: boolean; bookmarkId?: string }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[user][id][$eq]', userId.toString());
      searchParams.append('filters[article][id][$eq]', articleId.toString());

      const response = await this.request<{ data: Array<{ id: number; documentId: string }> }>(
        `/api/bookmarks?${searchParams.toString()}`
      );

      if (response.data && response.data.length > 0) {
        return { bookmarked: true, bookmarkId: response.data[0].documentId };
      }
      return { bookmarked: false };
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return { bookmarked: false };
    }
  }

  /**
   * Create a bookmark for an article
   */
  async bookmarkArticle(userId: number, articleId: string): Promise<{ success: boolean; bookmarkId?: string }> {
    try {
      const response = await this.userRequest<{ data: { id: number; documentId: string } }>(
        '/api/bookmarks',
        {
          method: 'POST',
          body: JSON.stringify({
            data: {
              user: { connect: [userId] },
              article: { connect: [articleId] },
            },
          }),
        }
      );
      return { success: true, bookmarkId: response.data.documentId };
    } catch (error) {
      console.error('Error bookmarking article:', error);
      return { success: false };
    }
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(bookmarkDocumentId: string): Promise<boolean> {
    try {
      await this.userRequest(`/api/bookmarks/${bookmarkDocumentId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  /**
   * Get all bookmarked articles for a user
   */
  async getUserBookmarks(userId: number): Promise<Article[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[user][id][$eq]', userId.toString());
      searchParams.append('populate[article][populate][0]', 'featuredImage');
      searchParams.append('populate[article][populate][1]', 'author');
      searchParams.append('populate[article][populate][2]', 'category');
      searchParams.append('sort', 'createdAt:desc');

      const response = await this.request<{ data: Array<{ id: number; documentId: string; article: Article }> }>(
        `/api/bookmarks?${searchParams.toString()}`
      );

      // Extract articles from bookmarks
      return response.data
        .filter(bookmark => bookmark.article)
        .map(bookmark => bookmark.article);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  /**
   * Get all bookmarks for a user with bookmark IDs for removal
   */
  async getBookmarksForUser(userId: number): Promise<BookmarkedArticle[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[user][id][$eq]', userId.toString());
      searchParams.append('populate[article][populate][0]', 'featuredImage');
      searchParams.append('populate[article][populate][1]', 'author');
      searchParams.append('populate[article][populate][2]', 'category');
      searchParams.append('sort', 'createdAt:desc');

      const response = await this.request<{ 
        data: Array<{ 
          id: number; 
          documentId: string; 
          createdAt: string;
          article: {
            id: number;
            documentId: string;
            title: string;
            slug: string;
            language?: string;
            featuredImage?: { url: string };
            author?: { Name: string };
            category?: { Name: string };
          };
        }> 
      }>(`/api/bookmarks?${searchParams.toString()}`);

      // Transform to BookmarkedArticle format
      return response.data
        .filter(bookmark => bookmark.article)
        .map(bookmark => ({
          bookmarkDocumentId: bookmark.documentId,
          articleId: bookmark.article.id,
          articleDocumentId: bookmark.article.documentId,
          title: bookmark.article.title,
          slug: bookmark.article.slug,
          featuredImage: bookmark.article.featuredImage?.url,
          authorName: bookmark.article.author?.Name,
          category: bookmark.article.category?.Name,
          language: bookmark.article.language,
          createdAt: bookmark.createdAt,
        }));
    } catch (error) {
      console.error('Error fetching bookmarks for user:', error);
      return [];
    }
  }

  /**
   * Get comment count for an article (without fetching all comments)
   */
  async getCommentCountForArticle(articleDocumentId: string): Promise<number> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('filters[article][documentId][$eq]', articleDocumentId);
      searchParams.append('pagination[pageSize]', '1');
      
      const response = await this.request<{ 
        data: Comment[]; 
        meta: { pagination: { total: number } } 
      }>(
        `/api/comments?${searchParams.toString()}`
      );

      return response.meta.pagination.total;
    } catch (error) {
      console.error('Error fetching comment count:', error);
      return 0;
    }
  }

  /**
   * Get comments for an article with pagination
   */
  async getCommentsByArticlePaginated(
    articleDocumentId: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<{ comments: Comment[]; total: number; hasMore: boolean }> {
    try {
      const searchParams = new URLSearchParams();
      
      // Filter by article documentId and only top-level comments
      searchParams.append('filters[article][documentId][$eq]', articleDocumentId);
      searchParams.append('filters[parentComment][$null]', 'true');
      searchParams.append('filters[$or][0][HideComment][$eq]', 'false');
      searchParams.append('filters[$or][1][HideComment][$null]', 'true');
      
      // Pagination
      searchParams.append('pagination[page]', page.toString());
      searchParams.append('pagination[pageSize]', pageSize.toString());
      
      // Sort by date (newest first)
      searchParams.append('sort', 'CommentDateTime:desc');
      
      // Populate user with only necessary fields
      searchParams.append('populate[users_permissions_user][fields][0]', 'id');
      searchParams.append('populate[users_permissions_user][fields][1]', 'username');
      searchParams.append('populate[users_permissions_user][populate][Avatar][fields][0]', 'url');
      // Populate replies with only necessary fields
      searchParams.append('populate[replies][fields][0]', 'id');
      searchParams.append('populate[replies][fields][1]', 'Content');
      searchParams.append('populate[replies][fields][2]', 'CommentDateTime');
      searchParams.append('populate[replies][fields][3]', 'likeCount');
      searchParams.append('populate[replies][populate][users_permissions_user][fields][0]', 'id');
      searchParams.append('populate[replies][populate][users_permissions_user][fields][1]', 'username');
      searchParams.append('populate[replies][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');

      const response = await this.request<{ 
        data: Comment[]; 
        meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } } 
      }>(
        `/api/comments?${searchParams.toString()}`
      );

      const { pagination } = response.meta;
      return {
        comments: response.data || [],
        total: pagination.total,
        hasMore: pagination.page < pagination.pageCount,
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], total: 0, hasMore: false };
    }
  }

  // ============================================
  // DRAFT API METHODS
  // ============================================

  /**
   * Get all drafts for the current user
   * Optimized: Only fetch necessary draft fields (no user relation needed)
   */
  async getDraftsForUser(userId: number): Promise<Draft[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[users_permissions_user][id][$eq]', userId.toString());
    searchParams.append('sort', 'updatedAt:desc');
    // Only fetch draft fields, no need to populate user relation
    searchParams.append('fields[0]', 'name');
    searchParams.append('fields[1]', 'content');
    searchParams.append('fields[2]', 'updatedAt');

    const response = await this.request<DraftResponse>(
      `/api/drafts?${searchParams.toString()}`
    );

    return response.data;
  }

  /**
   * Get a single draft by documentId
   */
  async getDraftById(documentId: string): Promise<Draft | null> {
    try {
      const response = await this.request<{ data: Draft }>(
        `/api/drafts/${documentId}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  /**
   * Create a new draft
   */
  async createDraft(name: string, content: string, userId: number): Promise<Draft> {
    const draftData = {
      name,
      content,
      users_permissions_user: userId,
    };

    const response = await this.request<{ data: Draft }>(
      '/api/drafts',
      {
        method: 'POST',
        body: JSON.stringify({ data: draftData }),
      }
    );

    return response.data;
  }

  /**
   * Update an existing draft
   */
  async updateDraft(documentId: string, name: string, content: string): Promise<Draft> {
    const response = await this.request<{ data: Draft }>(
      `/api/drafts/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          data: { name, content },
        }),
      }
    );

    return response.data;
  }

  /**
   * Delete a draft
   */
  async deleteDraft(documentId: string): Promise<void> {
    await this.request(`/api/drafts/${documentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // USER REQUEST REPORT API METHODS
  // ============================================

  /**
   * Create a new user request/report (e.g., article deletion request)
   * Works for both authenticated and unauthenticated users
   */
  async createUserRequestReport(data: {
    section: string;
    description: string;
    userId?: number; // Optional user ID for authenticated requests
  }): Promise<{ data: { id: number; documentId: string } }> {
    const payload: Record<string, unknown> = {
      Section: data.section,
      Description: data.description,
      Resolved: false,
    };

    // Add user relation if userId is provided
    if (data.userId) {
      payload.user = { connect: [data.userId] };
    }

    return this.request<{ data: { id: number; documentId: string } }>(
      '/api/user-request-reports',
      {
        method: 'POST',
        body: JSON.stringify({
          data: payload,
        }),
      }
    );
  }
  // ============================================
  // ISSUE API METHODS
  // ============================================

  /**
   * Get a publication by its documentId
   */
  async getPublicationByDocumentId(documentId: string): Promise<Publication | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('populate[Image][fields][0]', 'url');
    
    const response = await this.request<{ data: Publication; meta: object }>(
      `/api/publications/${documentId}?${searchParams.toString()}`
    );

    return response.data;
  }

  /**
   * Get all issues for a specific publication
   * Optimized: Only fetch necessary issue fields (CoverImage.url only, no publication)
   */
  async getIssuesByPublication(publicationDocumentId: string): Promise<IssueResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[publication][documentId][$eq]', publicationDocumentId);
    searchParams.append('sort', 'PublishedDate:desc');
    // Fetch only necessary fields
    searchParams.append('fields[0]', 'Title');
    searchParams.append('fields[1]', 'PublishedDate');
    // Populate only CoverImage url (not the full publication)
    searchParams.append('populate[CoverImage][fields][0]', 'url');

    return this.request<IssueResponse>(
      `/api/publication-issues?${searchParams.toString()}`
    );
  }

  /**
   * Get a specific issue with its pieces
   */
  async getIssueWithPieces(issueDocumentId: string): Promise<Publication_Issue | null> {
    const searchParams = new URLSearchParams();
    
    // Populate CoverImage
    searchParams.append('populate[CoverImage]', 'true');
    
    // Populate publication relation
    searchParams.append('populate[publication]', 'true');
    
    // Populate the relation pieces (which are Articles), and then their nested author and category
    searchParams.append('populate[pieces][populate][0]', 'featuredImage');
    searchParams.append('populate[pieces][populate][1]', 'author');
    searchParams.append('populate[pieces][populate][2]', 'category');
    
    const response = await this.request<{ data: Publication_Issue; meta: object }>(
      `/api/publication-issues/${issueDocumentId}?${searchParams.toString()}`
    );

    return response.data;
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
  
  // Use BlogDate if available, otherwise use publishedAt for fallback
  const dateToUse = strapiArticle.BlogDate || strapiArticle.publishedAt;
  
  return {
    id: strapiArticle.id.toString(),
    title: strapiArticle.title,
    isBengali: strapiArticle.language === 'bn',
    slug: strapiArticle.slug,
    content: strapiArticle.content,
    imageSrc: imageUrl,
    category: categoryName,
    author: {
      name: strapiArticle.publication_author_name || author?.Name || 'DUFS Blog',
      avatar: authorAvatar
    },
    publishedAt: dateToUse 
      ? new Date(dateToUse).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
    viewCount: strapiArticle.viewCount,
    tags: tags,
    InFeatured: strapiArticle.InFeatured
  };
};

/**
 * Apply date-aware sorting for user article lists.
 * For newest/oldest, sort by BlogDate first, then fallback to publishedAt.
 */
function appendUserArticleSort(searchParams: URLSearchParams, sort: string): void {
  const [sortField, sortDirection = 'desc'] = sort.split(':');

  if (sortField === 'BlogDate' || sortField === 'publishedAt') {
    searchParams.append('sort[0]', `BlogDate:${sortDirection}`);
    searchParams.append('sort[1]', `publishedAt:${sortDirection}`);
    searchParams.append('sort[2]', `createdAt:${sortDirection}`);
    return;
  }

  searchParams.append('sort', sort);
}

/**
 * Get articles by user ID (through author relation)
 * First finds the author associated with the user, then gets their articles
 */
export async function getUserArticles(
  userId: number,
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  sort: string = 'BlogDate:desc'
): Promise<{ articles: Article[]; total: number; pageCount: number }> {
  try {
    // First, find the author associated with this user
    const authorSearchParams = new URLSearchParams();
    authorSearchParams.append('filters[users_permissions_user][id][$eq]', userId.toString());
    
    const authorResponse = await strapiAPI.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${authorSearchParams.toString()}`
    );
    
    if (!authorResponse.data || authorResponse.data.length === 0) {
      // User doesn't have an author profile yet
      return { articles: [], total: 0, pageCount: 0 };
    }
    
    const author = authorResponse.data[0];
    
    // Now get articles by this author with pagination
    const articlesSearchParams = new URLSearchParams();
    articlesSearchParams.append('filters[author][documentId][$eq]', author.documentId);
    
    // Add search filter if provided
    if (searchQuery) {
      articlesSearchParams.append('filters[$or][0][title][$containsi]', searchQuery);
      articlesSearchParams.append('filters[$or][1][content][$containsi]', searchQuery);
    }
    
    appendUserArticleSort(articlesSearchParams, sort);
    articlesSearchParams.append('pagination[page]', page.toString());
    articlesSearchParams.append('pagination[pageSize]', pageSize.toString());
    
    // Minimal article fields
    const fields = ['id', 'title', 'slug', 'language', 'BlogDate', 'publishedAt', 'viewCount', 'likes', 'createdAt'];
    fields.forEach((field, index) => {
      articlesSearchParams.append(`fields[${index}]`, field);
    });
    
    // Populate only essentials: featured image, category only (no author, no tags)
    articlesSearchParams.append('populate[featuredImage][fields][0]', 'url');
    articlesSearchParams.append('populate[category][fields][0]', 'Name');
    articlesSearchParams.append('populate[category][fields][1]', 'nameEn');
    
    const articlesResponse = await strapiAPI.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${articlesSearchParams.toString()}`
    );
    
    return {
      articles: articlesResponse.data || [],
      total: articlesResponse.meta?.pagination?.total || 0,
      pageCount: articlesResponse.meta?.pagination?.pageCount || 0,
    };
  } catch (error) {
    console.error('Error fetching user articles:', error);
    return { articles: [], total: 0, pageCount: 0 };
  }
}

/**
 * Get user's articles with comment data populated (minimal - just comment ids)
 * This allows frontend to count comments without extra API calls
 * Returns articles with comments array populated with just id field
 */
export async function getUserArticlesWithComments(
  userId: number,
  page: number = 1,
  pageSize: number = 10,
  sort: string = 'BlogDate:desc'
): Promise<{ articles: Article[]; total: number; pageCount: number }> {
  try {
    // First, find the author associated with this user
    const authorSearchParams = new URLSearchParams();
    authorSearchParams.append('filters[users_permissions_user][id][$eq]', userId.toString());
    
    const authorResponse = await strapiAPI.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${authorSearchParams.toString()}`
    );
    
    if (!authorResponse.data || authorResponse.data.length === 0) {
      return { articles: [], total: 0, pageCount: 0 };
    }
    
    const author = authorResponse.data[0];
    
    // Get articles by this author WITH comments populated (minimal fields only)
    const articlesSearchParams = new URLSearchParams();
    articlesSearchParams.append('filters[author][documentId][$eq]', author.documentId);
    appendUserArticleSort(articlesSearchParams, sort);
    articlesSearchParams.append('pagination[page]', page.toString());
    articlesSearchParams.append('pagination[pageSize]', pageSize.toString());
    
    // Minimal article fields
    const fields = ['id', 'title', 'slug', 'language', 'BlogDate', 'publishedAt', 'viewCount', 'likes', 'createdAt'];
    fields.forEach((field, index) => {
      articlesSearchParams.append(`fields[${index}]`, field);
    });
    
    // Populate essentials + comments with minimal fields
    articlesSearchParams.append('populate[featuredImage][fields][0]', 'url');
    articlesSearchParams.append('populate[category][fields][0]', 'Name');
    articlesSearchParams.append('populate[category][fields][1]', 'nameEn');
    // Only need comment IDs for counting
    articlesSearchParams.append('populate[comments][fields][0]', 'id');
    
    const articlesResponse = await strapiAPI.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${articlesSearchParams.toString()}`
    );
    
    return {
      articles: articlesResponse.data || [],
      total: articlesResponse.meta?.pagination?.total || 0,
      pageCount: articlesResponse.meta?.pagination?.pageCount || 0,
    };
  } catch (error) {
    console.error('Error fetching user articles with comments:', error);
    return { articles: [], total: 0, pageCount: 0 };
  }
}

/**
 * Get article statistics for a user
 */
export async function getUserArticleStats(userId: number): Promise<{
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}> {
  try {
    // Fetch all articles (large page size) for stats calculation
    const { articles } = await getUserArticles(userId, 1, 1000);
    
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0);
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
    
    // Note: Comments count would need separate API calls per article
    // For now, we'll return 0 or implement later if needed
    const totalComments = 0;
    
    return {
      totalArticles,
      totalViews,
      totalLikes,
      totalComments,
    };
  } catch (error) {
    console.error('Error fetching user article stats:', error);
    return {
      totalArticles: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };
  }
}

/**
 * Create a user upload entry
 */
export async function createUserUploadFile(
  userId: number,
  fileId: number,
  filename: string
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    // First, find the author associated with this user
    const authorSearchParams = new URLSearchParams();
    authorSearchParams.append('filters[users_permissions_user][id][$eq]', userId.toString());
    
    const authorResponse = await strapiAPI.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${authorSearchParams.toString()}`
    );
    
    if (!authorResponse.data || authorResponse.data.length === 0) {
      return {
        success: false,
        error: 'Author profile not found. Please contact support.',
      };
    }
    
    const author = authorResponse.data[0];
    
    // Create user upload entry
    const response = await strapiAPI.userRequest<{ data: { id: number; documentId: string } }>(
      '/api/user-uploads',
      {
        method: 'POST',
        body: JSON.stringify({
          data: {
            Filename: filename,
            File: fileId,
            author: { connect: [author.id] },
            UploadTime: new Date().toISOString(),
          },
        }),
      }
    );
    
    return {
      success: true,
      documentId: response.data.documentId,
    };
  } catch (error) {
    console.error('Error creating user upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create upload entry',
    };
  }
}

/**
 * Create a user upload entry
 */
export async function createUserUpload(
  userId: number,
  fileId: number,
  filename: string
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    // First, find the author associated with this user
    const authorSearchParams = new URLSearchParams();
    authorSearchParams.append('filters[users_permissions_user][id][$eq]', userId.toString());
    
    const authorResponse = await strapiAPI.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${authorSearchParams.toString()}`
    );
    
    if (!authorResponse.data || authorResponse.data.length === 0) {
      return {
        success: false,
        error: 'Author profile not found. Please contact support.',
      };
    }
    
    const author = authorResponse.data[0];
    
    // Create user upload entry
    const response = await strapiAPI.userRequest<{ data: { id: number; documentId: string } }>(
      '/api/user-uploads',
      {
        method: 'POST',
        body: JSON.stringify({
          data: {
            Filename: filename,
            File: fileId,
            author: { connect: [author.id] },
            UploadTime: new Date().toISOString(),
          },
        }),
      }
    );
    
    return {
      success: true,
      documentId: response.data.documentId,
    };
  } catch (error) {
    console.error('Error creating user upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create upload entry',
    };
  }
}

export default strapiAPI; 
