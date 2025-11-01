import { Metadata } from 'next';
import { config } from './config';
import { Article, Author, Category } from '@/types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: SEOProps = {}): Metadata {
  const siteName = config.site.name;
  const siteUrl = config.site.url;
  const defaultDescription = config.site.description;
  
  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaImage = image || `${siteUrl}/images/hero.jpg`;
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: author ? [{ name: author }] : undefined,
    
    // Open Graph
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: metaUrl,
      siteName: siteName,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        }
      ],
      locale: 'en_US',
      type: type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags
      })
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: author ? `@${author}` : undefined,
    },

    // Canonical URL
    alternates: {
      canonical: metaUrl,
    },

    // Additional meta tags
    other: {
      'article:publisher': siteName,
      ...(publishedTime && { 'article:published_time': publishedTime }),
      ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      ...(section && { 'article:section': section }),
      ...(tags.length > 0 && tags.reduce((acc, tag, index) => {
        acc[`article:tag:${index}`] = tag;
        return acc;
      }, {} as Record<string, string>))
    }
  };

  return metadata;
}

export function generateArticleMetadata(article: Article): Metadata {
  const strapiUrl = config.strapi.url;
  const siteUrl = config.site.url;
  
  const title = (article as any).metaTitle || article.title;
  const description = (article as any).metaDescription || (article as any).excerpt;
  const keywords = (article as any).metaKeywords || 
    ((article as any).tags || []).map((tag: any) => tag.name || tag);
  
  const featuredImage = (article as any).featuredImage || (article as any).socialImage;
  const imageUrl = featuredImage?.url || `${siteUrl}/images/hero.jpg`;
  const image = imageUrl.startsWith('http') ? imageUrl : `${strapiUrl}${imageUrl}`;

  return generateMetadata({
    title,
    description,
    keywords,
    image,
    url: `/articles/${article.slug}`,
    type: 'article',
    author: (article as any).author?.name || 'DUFS Blog',
    publishedTime: article.publishedAt,
    modifiedTime: (article as any).updatedAt,
    section: (article as any).category?.name || 'Blog',
    tags: ((article as any).tags || []).map((tag: any) => tag.name || tag)
  });
}

export function generateAuthorMetadata(author: Author, articlesCount?: number): Metadata {
  const strapiUrl = config.strapi.url;
  
  const name = (author as any).name || 'Author';
  const bio = (author as any).bio;
  const slug = (author as any).slug || 'unknown';
  const avatarUrl = (author as any).avatar?.url;
  const imageUrl = avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `${strapiUrl}${avatarUrl}`) : undefined;

  const title = `${name} - Author Profile`;
  const description = bio || 
    `Read articles by ${name} on ${config.site.name}. ${articlesCount ? `${articlesCount} articles published.` : ''}`;

  return generateMetadata({
    title,
    description,
    image: imageUrl,
    url: `/authors/${slug}`,
    type: 'website'
  });
}

export function generateCategoryMetadata(category: Category, articlesCount?: number): Metadata {
  const name = (category as any).name || 'Category';
  const description = (category as any).description;
  const slug = (category as any).slug || 'unknown';

  const title = `${name} - Browse Articles`;
  const desc = description || 
    `Browse ${name} articles on ${config.site.name}. ${articlesCount ? `${articlesCount} articles available.` : ''}`;

  return generateMetadata({
    title,
    description: desc,
    url: `/browse?category=${slug}`,
    type: 'website'
  });
}

export function generateSearchMetadata(query: string, resultsCount?: number): Metadata {
  const title = `Search Results for "${query}"`;
  const description = `Search results for "${query}" on ${config.site.name}. ${resultsCount ? `${resultsCount} results found.` : ''}`;

  return generateMetadata({
    title,
    description,
    url: `/search?q=${encodeURIComponent(query)}`,
    type: 'website'
  });
}

// JSON-LD structured data generators
export function generateArticleJsonLd(article: Article) {
  const strapiUrl = config.strapi.url;
  const siteUrl = config.site.url;
  
  const featuredImage = (article as any).featuredImage;
  const authorName = (article as any).author?.name || 'DUFS Blog';
  const authorSlug = (article as any).author?.slug || 'unknown';
  const categoryName = (article as any).category?.name || 'Blog';
  const tags = ((article as any).tags || []).map((tag: any) => tag.name || tag);
  const imageUrl = featuredImage?.url ? (featuredImage.url.startsWith('http') ? featuredImage.url : `${strapiUrl}${featuredImage.url}`) : undefined;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: (article as any).excerpt || article.title,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${siteUrl}/authors/${authorSlug}`
    },
    publisher: {
      '@type': 'Organization',
      name: config.site.name,
      url: siteUrl
    },
    datePublished: article.publishedAt,
    dateModified: (article as any).updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${article.slug}`
    },
    articleSection: categoryName,
    keywords: tags,
    wordCount: article.content.split(' ').length,
    ...((article as any).readTime && { timeRequired: `PT${(article as any).readTime}M` })
  };
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${config.site.url}${item.url}`
    }))
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.site.name,
    description: config.site.description,
    url: config.site.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.site.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
} 