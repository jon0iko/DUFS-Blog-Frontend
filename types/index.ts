export interface Article {
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
  
  export interface SocialLink {
    platform: 'youtube' | 'twitter' | 'instagram' | 'facebook';
    href: string;
    icon: string;
  }

  export interface categories {
    Name: string;
    slug: string;
  }