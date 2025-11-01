// Base Strapi types
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity {
  id: number;
  attributes: {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface StrapiMedia {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats: {
      thumbnail?: MediaFormat;
      small?: MediaFormat;
      medium?: MediaFormat;
      large?: MediaFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
  };
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// Enhanced Author interface
export interface Author {
  id: number;
  attributes: {
    name: string;
    slug: string;
    bio?: string;
    avatar?: {
      data: StrapiMedia | null;
    };
    email?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      website?: string;
    };
    articlesCount?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Enhanced Category interface
export interface Category {
  id: number;
  attributes: {
    name: string;
    nameEn: string;
    nameBn?: string;
    slug: string;
    description?: string;
    color?: string;
    isActive: boolean;
    sortOrder: number;
    articlesCount?: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Enhanced Tag interface
export interface Tag {
  id: number;
  attributes: {
    name: string;
    slug: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Enhanced Article interface
export interface Article {
  id: number;
  documentId: string;
  title: string;
  titleBn?: string;
  slug: string;
  excerpt: string;
  excerptBn?: string;
  content: string;
  contentBn?: string;
  language: 'en' | 'bn' | 'both';
  featuredImage?: StrapiMedia | null;
  gallery?: StrapiMedia[];
  author?: Author;
  category?: Category;
  tags?: Tag[];
  storyState: 'draft' | 'published' | 'archived' | 'submitted' | 'review';
  isFeatured: boolean;
  isEditorsPick: boolean;
  isHero: boolean;
  publishedAt: string;
  readTime?: number;
  viewCount: number;
  likes: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: StrapiMedia | null;
  createdAt: string;
  updatedAt: string;
}

// Site Configuration
export interface SiteConfig {
  id: number;
  attributes: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logoLight: {
      data: StrapiMedia | null;
    };
    logoDark: {
      data: StrapiMedia | null;
    };
    favicon: {
      data: StrapiMedia | null;
    };
    defaultMetaImage: {
      data: StrapiMedia | null;
    };
    socialLinks: SocialLink[];
    contactEmail: string;
    supportedLanguages: string[];
    defaultLanguage: string;
    gtmId?: string;
    googleAnalyticsId?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Navigation Item
export interface NavigationItem {
  id: number;
  attributes: {
    title: string;
    titleBn?: string;
    href: string;
    isExternal: boolean;
    sortOrder: number;
    isActive: boolean;
    openInNewTab: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Social Link
export interface SocialLink {
  id: number;
  platform: 'youtube' | 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'website';
  href: string;
  icon?: {
    data: StrapiMedia | null;
  };
  isActive: boolean;
  sortOrder: number;
}

// Banner/Announcement
export interface Banner {
  id: number;
  attributes: {
    headline: string;
    headlineBn?: string;
    postTitle: string;
    postTitleBn?: string;
    subtitle: string;
    subtitleBn?: string;
    postUrl: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    priority: number;
    backgroundColor?: string;
    textColor?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// User Submission
export interface Submission {
  id: number;
  attributes: {
    title: string;
    excerpt: string;
    content: string;
    language: 'en' | 'bn' | 'both';
    category: {
      data: Category;
    };
    tags: {
      data: Tag[];
    };
    featuredImage?: {
      data: StrapiMedia | null;
    };
    author: {
      data: Author;
    };
    status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';
    reviewNotes?: string;
    submittedAt: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Comment
export interface Comment {
  id: number;
  attributes: {
    content: string;
    authorName: string;
    authorEmail: string;
    isApproved: boolean;
    article: {
      data: Article;
    };
    parentComment?: {
      data: Comment | null;
    };
    replies?: {
      data: Comment[];
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// API Response types for frontend use
export interface ArticleResponse extends StrapiResponse<Article[]> {}
export interface SingleArticleResponse extends StrapiResponse<Article> {}
export interface AuthorResponse extends StrapiResponse<Author[]> {}
export interface CategoryResponse extends StrapiResponse<Category[]> {}
export interface TagResponse extends StrapiResponse<Tag[]> {}
export interface BannerResponse extends StrapiResponse<Banner[]> {}
export interface NavigationResponse extends StrapiResponse<NavigationItem[]> {}
export interface SiteConfigResponse extends StrapiResponse<SiteConfig> {}

// Legacy types for backward compatibility (will be gradually replaced)
export interface LegacyArticle {
  id: string;
  title: string;
  isBengali: boolean;
  slug: string;
  excerpt: string;
  content?: string;
  imageSrc: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime?: number;
  viewCount?: number;
  tags?: string[];
  isFeatured?: boolean;
  isEditorsPick?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

export interface categories {
  Name: string;
  slug: string;
}