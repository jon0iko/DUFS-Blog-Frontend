import { Metadata } from 'next';
import { config } from './config';
import { Article, Author, Category } from '@/types';
import { getArticleImage, getAuthorName, getCategoryName, getAuthorAvatar } from './strapi-helpers';

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
  const siteUrl = config.site.url;
  
  // Strapi v5: Direct field access, article.excerpt doesn't exist in current schema
  const title = article.title;
  const description = article.content.substring(0, 160) + '...'; // Use content preview as description
  
  // Tags are directly accessible in v5, using lowercase 'name'
  const keywords = article.tags ? article.tags.map(tag => tag.name) : [];
  
  // Get featured image URL using helper
  const imageUrl = getArticleImage(article) || `${siteUrl}/images/hero.jpg`;

  // Author and category are directly accessible
  const authorName = article.author ? getAuthorName(article.author) : 'DUFS Blog';
  const categoryName = article.category ? getCategoryName(article.category) : 'Blog';
  const tagNames = article.tags ? article.tags.map(tag => tag.name) : [];

  return generateMetadata({
    title,
    description,
    keywords,
    image: imageUrl,
    url: `/articles/${article.slug}`,
    type: 'article',
    author: authorName,
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    section: categoryName,
    tags: tagNames
  });
}

export function generateAuthorMetadata(author: Author, articlesCount?: number): Metadata {
  // Strapi v5: Backend uses capital N in Name, capital A in Avatar, capital B in Bio
  const name = getAuthorName(author);
  const bio = author.Bio || '';
  const slug = author.slug || 'unknown';
  const avatarUrl = getAuthorAvatar(author);

  const title = `${name} - Author Profile`;
  const description = bio || 
    `Read articles by ${name} on ${config.site.name}. ${articlesCount ? `${articlesCount} articles published.` : ''}`;

  return generateMetadata({
    title,
    description,
    image: avatarUrl || undefined,
    url: `/authors/${slug}`,
    type: 'website'
  });
}

export function generateCategoryMetadata(category: Category, articlesCount?: number): Metadata {
  // Strapi v5: Backend uses capital S in Slug, nameEn or Name for name
  const name = getCategoryName(category);
  const description = category.description || '';
  const slug = category.Slug || 'unknown';

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
  const siteUrl = config.site.url;
  
  // Strapi v5: Direct access to relations and media
  const authorName = article.author ? getAuthorName(article.author) : 'DUFS Blog';
  const authorSlug = article.author?.slug || 'unknown';
  const categoryName = article.category ? getCategoryName(article.category) : 'Blog';
  const tags = article.tags ? article.tags.map(tag => tag.name) : [];
  const imageUrl = getArticleImage(article);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.content.substring(0, 160), // Use content preview
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
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${article.slug}`
    },
    articleSection: categoryName,
    keywords: tags,
    wordCount: article.content.split(' ').length
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