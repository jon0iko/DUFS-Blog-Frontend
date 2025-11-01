import { config } from './config';
import {
  ArticleResponse,
  SingleArticleResponse,
  AuthorResponse,
  CategoryResponse,
  TagResponse,
  BannerResponse,
  NavigationResponse,
  SiteConfigResponse,
  Article,
  Category,
  Author,
  Tag,
  Banner,
  NavigationItem,
  SiteConfig,
  Submission
} from '@/types';

class StrapiAPI {
  private baseURL: string;
  private apiToken: string;

  constructor() {
    this.baseURL = config.strapi.url;
    this.apiToken = config.strapi.apiToken;
  }

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
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Article API methods
  async getArticles(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    language?: 'en' | 'bn' | 'both';
    featured?: boolean;
    editorsPick?: boolean;
    status?: string;
    sort?: string;
    populate?: string[];
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('pagination[page]', params.page.toString());
    if (params?.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    if (params?.category) searchParams.append('filters[category][slug][$eq]', params.category);
    if (params?.tag) searchParams.append('filters[tags][slug][$in]', params.tag);
    if (params?.language) searchParams.append('filters[language][$eq]', params.language);
    if (params?.featured) searchParams.append('filters[isFeatured][$eq]', 'true');
    if (params?.editorsPick) searchParams.append('filters[isEditorsPick][$eq]', 'true');
    if (params?.status) searchParams.append('filters[status][$eq]', params.status);
    if (params?.sort) searchParams.append('sort', params.sort);
    
    // Default populate
    const populate = params?.populate || [
      'featuredImage',
      'author',
      'author.avatar',
      'category',
      'tags'
    ];
    populate.forEach(field => searchParams.append('populate', field));

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  async getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    const populate = [
      'featuredImage',
      'gallery',
      'author',
      'author.avatar',
      'category',
      'tags',
      'socialImage'
    ];
    populate.forEach(field => searchParams.append('populate', field));

    return this.request<SingleArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  async getFeaturedArticles(limit: number = 4): Promise<ArticleResponse> {
    return this.getArticles({
      featured: true,
      pageSize: limit,
      status: 'published',
      sort: 'publishedAt:desc'
    });
  }

  async getEditorsChoiceArticles(limit: number = 4): Promise<ArticleResponse> {
    return this.getArticles({
      editorsPick: true,
      pageSize: limit,
      status: 'published',
      sort: 'publishedAt:desc'
    });
  }

  async getHeroArticle(): Promise<SingleArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isHero][$eq]', 'true');
    searchParams.append('filters[status][$eq]', 'published');
    
    const populate = ['featuredImage', 'author', 'category'];
    populate.forEach(field => searchParams.append('populate', field));

    return this.request<SingleArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  async getRelatedArticles(articleId: number, categoryId: number, limit: number = 3): Promise<ArticleResponse> {
    return this.getArticles({
      pageSize: limit,
      status: 'published',
      sort: 'publishedAt:desc'
    });
  }

  // Author API methods
  async getAuthors(): Promise<AuthorResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('populate', 'avatar');
    searchParams.append('filters[isActive][$eq]', 'true');
    
    return this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${searchParams.toString()}`
    );
  }

  async getAuthorBySlug(slug: string): Promise<AuthorResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    searchParams.append('populate', 'avatar');
    
    return this.request<AuthorResponse>(
      `${config.strapi.endpoints.authors}?${searchParams.toString()}`
    );
  }

  async getAuthorArticles(authorId: number, page: number = 1, pageSize: number = 12): Promise<ArticleResponse> {
    return this.getArticles({
      page,
      pageSize,
      status: 'published',
      sort: 'publishedAt:desc'
    });
  }

  // Category API methods
  async getCategories(): Promise<CategoryResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    searchParams.append('sort', 'sortOrder:asc');
    
    return this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${searchParams.toString()}`
    );
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    return this.request<CategoryResponse>(
      `${config.strapi.endpoints.categories}?${searchParams.toString()}`
    );
  }

  // Tag API methods
  async getTags(): Promise<TagResponse> {
    return this.request<TagResponse>(config.strapi.endpoints.tags);
  }

  async getTagBySlug(slug: string): Promise<TagResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[slug][$eq]', slug);
    
    return this.request<TagResponse>(
      `${config.strapi.endpoints.tags}?${searchParams.toString()}`
    );
  }

  // Banner API methods
  async getActiveBanners(): Promise<BannerResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    
    const currentDate = new Date().toISOString();
    searchParams.append('filters[startDate][$lte]', currentDate);
    searchParams.append('filters[endDate][$gte]', currentDate);
    searchParams.append('sort', 'priority:desc');
    
    return this.request<BannerResponse>(
      `${config.strapi.endpoints.banners}?${searchParams.toString()}`
    );
  }

  // Navigation API methods
  async getNavigationItems(): Promise<NavigationResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    searchParams.append('sort', 'sortOrder:asc');
    
    return this.request<NavigationResponse>(
      `${config.strapi.endpoints.navigation}?${searchParams.toString()}`
    );
  }

  // Site Configuration API methods
  async getSiteConfig(): Promise<SiteConfigResponse> {
    const searchParams = new URLSearchParams();
    const populate = [
      'logoLight',
      'logoDark',
      'favicon',
      'defaultMetaImage',
      'socialLinks'
    ];
    populate.forEach(field => searchParams.append('populate', field));
    
    return this.request<SiteConfigResponse>(
      `${config.strapi.endpoints.siteConfig}?${searchParams.toString()}`
    );
  }

  // Submission API methods
  async createSubmission(submissionData: {
    title: string;
    excerpt: string;
    content: string;
    language: 'en' | 'bn' | 'both';
    categoryId: number;
    tagIds: number[];
    authorId: number;
  }, featuredImage?: File): Promise<any> {
    const formData = new FormData();
    
    formData.append('data', JSON.stringify({
      title: submissionData.title,
      excerpt: submissionData.excerpt,
      content: submissionData.content,
      language: submissionData.language,
      category: submissionData.categoryId,
      tags: submissionData.tagIds,
      author: submissionData.authorId,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    }));

    if (featuredImage) {
      formData.append('files.featuredImage', featuredImage);
    }

    return this.request<any>(config.strapi.endpoints.submissions, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData
    });
  }

  // Search API method
  async searchContent(query: string, filters?: {
    contentType?: 'articles' | 'authors';
    category?: string;
    language?: 'en' | 'bn' | 'both';
  }): Promise<ArticleResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[$or][0][title][$containsi]', query);
    searchParams.append('filters[$or][1][excerpt][$containsi]', query);
    searchParams.append('filters[$or][2][content][$containsi]', query);
    
    if (filters?.category) {
      searchParams.append('filters[category][slug][$eq]', filters.category);
    }
    
    if (filters?.language) {
      searchParams.append('filters[language][$eq]', filters.language);
    }

    const populate = ['featuredImage', 'author', 'author.avatar', 'category', 'tags'];
    populate.forEach(field => searchParams.append('populate', field));

    return this.request<ArticleResponse>(
      `${config.strapi.endpoints.articles}?${searchParams.toString()}`
    );
  }

  // Analytics methods (if you implement view tracking)
  async trackArticleView(articleId: number): Promise<void> {
    try {
      await this.request(`/api/articles/${articleId}/view`, {
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

// Utility functions for transforming Strapi data to legacy format (for gradual migration)
export const transformStrapiArticleToLegacy = (strapiArticle: Article) => {
  const featuredImage = (strapiArticle as any).featuredImage;
  const imageUrl = featuredImage?.url 
    ? (featuredImage.url.startsWith('http') ? featuredImage.url : `${config.strapi.url}${featuredImage.url}`)
    : '/images/hero.jpg';
  
  const author = (strapiArticle as any).author || {};
  const authorAvatar = author.avatar?.url
    ? (author.avatar.url.startsWith('http') ? author.avatar.url : `${config.strapi.url}${author.avatar.url}`)
    : undefined;
  
  const category = (strapiArticle as any).category || {};
  const categoryName = typeof category === 'object' && 'name' in category 
    ? category.name 
    : 'Blog';
  
  const tags = ((strapiArticle as any).tags || []).map((tag: any) => tag.name || tag);
  
  return {
    id: strapiArticle.id.toString(),
    title: strapiArticle.title,
    isBengali: strapiArticle.language === 'bn',
    slug: strapiArticle.slug,
    excerpt: (strapiArticle as any).excerpt,
    content: strapiArticle.content,
    imageSrc: imageUrl,
    category: categoryName,
    author: {
      name: author.name || 'DUFS Blog',
      avatar: authorAvatar
    },
    publishedAt: new Date(strapiArticle.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    readTime: (strapiArticle as any).readTime,
    viewCount: strapiArticle.viewCount,
    tags: tags,
    isFeatured: strapiArticle.isFeatured,
    isEditorsPick: strapiArticle.isEditorsPick
  };
};

export default strapiAPI; 