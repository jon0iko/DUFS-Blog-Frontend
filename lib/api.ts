import { config } from './config';
import { getToken } from './auth';
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
  Submission,
  Comment,
  Draft,
  DraftResponse
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
  excerpt?: string;
  featuredImage?: string;
  authorName?: string;
  category?: string;
  language?: string;
  createdAt: string;
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
  public async request<T>(
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('User API Request Error:', error);
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
    sort?: string;
    populate?: string[];
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    // Strapi v5: status=published is required to get published content (draft/publish system)
    searchParams.append('status', 'published');
    
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
    
    // Sorting
    const sort = params?.sort || 'publishedAt:desc';
    searchParams.append('sort', sort);
    
    // Populate - default fields to populate
    const populate = params?.populate || ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    console.log(`${config.strapi.endpoints.articles}?${searchParams.toString()}`)

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
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    
    // Populate all necessary fields for article detail page
    searchParams.append('populate[featuredImage]', 'true');
    searchParams.append('populate[gallery]', 'true');
    searchParams.append('populate[category]', 'true');
    searchParams.append('populate[tags]', 'true');
    searchParams.append('populate[socialImage]', 'true');
    // Deep-populate author.users_permissions_user so Avatar is included
    searchParams.append('populate[author][populate][users_permissions_user][populate]', '*');

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
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    
    searchParams.append('populate[featuredImage]', 'true');
    searchParams.append('populate[gallery]', 'true');
    searchParams.append('populate[category]', 'true');
    searchParams.append('populate[tags]', 'true');
    searchParams.append('populate[socialImage]', 'true');
    // Deep-populate author.users_permissions_user so Avatar is included
    searchParams.append('populate[author][populate][users_permissions_user][populate]', '*');

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
      sort: 'publishedAt:desc'
    });
  }

  /**
   * Get hero article (isHero = true)
   */
  async getHeroArticle(): Promise<Article | null> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isHero][$eq]', 'true');
    searchParams.append('status', 'published'); // Strapi v5 draft/publish system
    
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
    searchParams.append('sort', 'publishedAt:desc');
    
    // Populate fields
    const populate = ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
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
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Filter by category and exclude current article
    searchParams.append('filters[category][Slug][$eq]', categorySlug);
    searchParams.append('filters[documentId][$ne]', currentArticleId);
    
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
    
    // Strapi v5 draft/publish system
    searchParams.append('status', 'published');
    
    // Filter by author documentId
    searchParams.append('filters[author][documentId][$eq]', authorDocumentId);
    
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
   * Search content across articles (title, excerpt, content, author name, tags)
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
    // Includes: title, titleBn, excerpt, excerptBn, content, contentBn, author name, tags
    searchParams.append('filters[$or][0][title][$containsi]', query);
    searchParams.append('filters[$or][1][titleBn][$containsi]', query);
    searchParams.append('filters[$or][2][excerpt][$containsi]', query);
    searchParams.append('filters[$or][3][excerptBn][$containsi]', query);
    searchParams.append('filters[$or][4][content][$containsi]', query);
    searchParams.append('filters[$or][5][contentBn][$containsi]', query);
    searchParams.append('filters[$or][6][author][Name][$containsi]', query);
    searchParams.append('filters[$or][7][tags][name][$containsi]', query);
    
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
    searchParams.append('sort', 'publishedAt:desc');

    // Populate necessary fields
    const populate = ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  /**
   * @deprecated Use searchArticles instead
   */
  async searchContent(query: string, filters?: {
    contentType?: 'articles' | 'authors';
    category?: string;
    language?: 'en' | 'bn' | 'both';
  }): Promise<ArticleResponse> {
    return this.searchArticles(query, {
      category: filters?.category,
      language: filters?.language,
    });
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
      
      // Populate user with all fields including avatar
      searchParams.append('populate[users_permissions_user][populate]', '*');
      // Populate replies and their users with avatars
      searchParams.append('populate[replies][populate][users_permissions_user][populate]', '*');

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
  async bookmarkArticle(userId: number, articleId: number): Promise<{ success: boolean; bookmarkId?: string }> {
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
            excerpt?: string;
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
          excerpt: bookmark.article.excerpt,
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
      
      // Populate user with all fields including avatar
      searchParams.append('populate[users_permissions_user][populate]', '*');
      // Populate replies and their users with avatars
      searchParams.append('populate[replies][populate][users_permissions_user][populate]', '*');

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
   */
  async getDraftsForUser(userId: number): Promise<Draft[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[users_permissions_user][id][$eq]', userId.toString());
    searchParams.append('sort', 'updatedAt:desc');
    searchParams.append('populate[0]', 'users_permissions_user');

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
   */
  async createUserRequestReport(data: {
    section: string;
    description: string;
  }): Promise<{ data: { id: number; documentId: string } }> {
    return this.userRequest<{ data: { id: number; documentId: string } }>(
      '/api/user-request-reports',
      {
        method: 'POST',
        body: JSON.stringify({
          data: {
            Section: data.section,
            Description: data.description,
            Resolved: false,
          },
        }),
      }
    );
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

/**
 * Get articles by user ID (through author relation)
 * First finds the author associated with the user, then gets their articles
 */
export async function getUserArticles(
  userId: number,
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  sort: string = 'publishedAt:desc'
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
      articlesSearchParams.append('filters[$or][1][excerpt][$containsi]', searchQuery);
    }
    
    articlesSearchParams.append('sort', sort);
    articlesSearchParams.append('pagination[page]', page.toString());
    articlesSearchParams.append('pagination[pageSize]', pageSize.toString());
    
    // Populate fields
    const populate = ['featuredImage', 'author', 'category', 'tags'];
    populate.forEach((field, index) => {
      articlesSearchParams.append(`populate[${index}]`, field);
    });
    
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
