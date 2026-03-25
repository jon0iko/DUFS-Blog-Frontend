// Base Strapi v5 types - FLATTENED response format (no nested attributes)
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

// Strapi v5 media format - simplified and flattened
export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
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
  createdAt: string;
  updatedAt: string;
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

// Author interface - FLATTENED format matching backend schema
// Backend schema uses: Name, Avatar, Bio, slug (not nested in attributes)
export interface Author {
  id: number;
  documentId: string;
  Name: string; // Backend uses capital N
  slug: string;
  Bio?: string; // Backend uses capital B
  Avatar?: StrapiMedia;
  users_permissions_user?: {
    id?: number;
    username?: string;
    Avatar?: { url?: string } | null;
  };
  email?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  articlesCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Category interface - FLATTENED format matching backend schema
// Backend schema uses: Name, Slug, nameEn, nameBn, isActive (capital letters)
export interface Category {
  id: number;
  documentId: string;
  Name: string; // Backend uses capital N
  nameEn: string;
  nameBn?: string;
  Slug: string; // Backend uses capital S
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Tag interface - FLATTENED format matching backend schema
export interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Article interface - FLATTENED format matching backend schema
// In Strapi v5, all fields are at the root level, no nested attributes
export interface Article {
  id: number;
  documentId: string; // Strapi v5 uses documentId as the unique identifier
  title: string;
  titleBn?: string;
  slug: string;
  excerpt: string;
  excerptBn?: string;
  content: string; // Rich text content
  contentBn?: string;
  language: 'en' | 'bn' | 'both';
  featuredImage?: StrapiMedia;
  gallery?: StrapiMedia[];
  author?: Author; // Populated relation
  publication_author_name?: string; // Author name for publication pieces
  publication_issue?: Publication_Issue; // Populated relation for articles in issues
  category?: Category; // Populated relation
  tags?: Tag[]; // Populated relation
  storyState: 'published' | 'draft' | 'archived'; 
  isFeatured: boolean;
  isEditorsPick: boolean;
  isHero: boolean;
  DisableComments?: boolean;
  publishedAt?: string;
  readTime?: number;
  viewCount: number;
  likes: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: StrapiMedia;
  createdAt: string;
  updatedAt: string;
  locale?: string;
}

// Site Configuration - FLATTENED format
export interface SiteConfig {
  id: number;
  documentId: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoLight?: StrapiMedia;
  logoDark?: StrapiMedia;
  favicon?: StrapiMedia;
  defaultMetaImage?: StrapiMedia;
  socialLinks?: SocialLink[];
  contactEmail: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  gtmId?: string;
  googleAnalyticsId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Navigation Item - FLATTENED format
export interface NavigationItem {
  id: number;
  documentId: string;
  title: string;
  titleBn?: string;
  href: string;
  isExternal: boolean;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Social Link - typically a component, not a content type
export interface SocialLink {
  id: number;
  platform: 'youtube' | 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'website';
  href: string;
  icon?: StrapiMedia;
  isActive: boolean;
  sortOrder: number;
}

// Banner/Announcement - FLATTENED format matching backend schema
export interface Banner {
  id: number;
  documentId: string;
  headline: string;
  postTitle: string;
  subtitle: string;
  postUrl: string;
  Active: boolean;
  EndDate?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Publication interface - FLATTENED format matching backend schema
// Backend fields observed: TitleEnglish, TitleBangla, Description, Image, Color, ShowInHome, Hide, HasVolumes
export interface Publication {
  id: number;
  documentId: string;
  TitleEnglish: string;
  TitleBangla: string;
  Description?: string;
  Image?: StrapiMedia;
  Color?: string;
  ShowInHome: boolean;
  Hide: boolean;
  HasVolumes?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Issue interface - FLATTENED format matching backend schema
export interface Publication_Issue
 {
  id: number;
  documentId: string;
  Title: string;
  Details: string; // Rich text
  CoverImage?: StrapiMedia;
  PublishedDate: string;
  publication?: Publication; 
  Pieces?: Article[]; 
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// User Submission - FLATTENED format
export interface Submission {
  id: number;
  documentId: string;
  title: string;
  excerpt: string;
  content: string;
  language: 'en' | 'bn' | 'both';
  category?: Category;
  tags?: Tag[];
  featuredImage?: StrapiMedia;
  author?: Author;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Comment - FLATTENED format matching Strapi schema
export interface Comment {
  id: number;
  documentId: string;
  Content: string; // Backend uses capital C
  CommentDateTime: string; // Backend uses this field name
  users_permissions_user?: unknown; // Relation to user (if logged in)
  article?: Article; // Relation to article
  HideComment?: boolean; // Admin can hide inappropriate comments
  isReplyable?: boolean; // Whether this comment can have replies
  likeCount?: number; // Number of likes on this comment
  parentComment?: Comment; // Parent comment if this is a reply
  replies?: Comment[]; // Replies to this comment
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Comment response from API
export type CommentResponse = StrapiResponse<Comment[]>;

// Draft - for saving editor content
export interface Draft {
  id: number;
  documentId: string;
  name: string;
  content: string;
  users_permissions_user?: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Draft response from API
export type DraftResponse = StrapiResponse<Draft[]>;

// API Response types - using type aliases instead of empty interfaces
export type ArticleResponse = StrapiResponse<Article[]>;
export type SingleArticleResponse = StrapiResponse<Article>;
export type AuthorResponse = StrapiResponse<Author[]>;
export type CategoryResponse = StrapiResponse<Category[]>;
export type TagResponse = StrapiResponse<Tag[]>;
export type BannerResponse = StrapiResponse<Banner>;
export type PublicationResponse = StrapiResponse<Publication[]>;
export type IssueResponse = StrapiResponse<Publication_Issue[]>;
export type NavigationResponse = StrapiResponse<NavigationItem[]>;
export type SocialLinkResponse = StrapiResponse<SocialLink[]>;
export type SiteConfigResponse = StrapiResponse<SiteConfig>;

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