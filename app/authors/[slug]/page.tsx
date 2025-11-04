import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverStrapiAPI } from '@/lib/server-api';
import AuthorPageClient from '@/components/authors/AuthorPageClient';
import type { Author, Article } from '@/types';

// Helper function to generate a slug from an author's name
const generateSlugFromName = (name: string): string => {
  const hasBengaliChars = /[\u0980-\u09FF]/.test(name);
  let slug: string;
  if (hasBengaliChars) {
    slug = name.replace(/\s+/g, '-');
  } else {
    slug = name.toLowerCase().replace(/\s+/g, '-');
  }
  return slug;
};

// Function to generate static paths for all authors
export async function generateStaticParams() {
  try {
    const authorsResponse = await serverStrapiAPI.getAuthors();
    const authors = authorsResponse.data || [];
    
    return authors.map((author: Author) => ({
      slug: author.slug || generateSlugFromName(author.Name || ''),
    }));
  } catch (error) {
    console.error('Error generating author paths:', error);
    return [];
  }
}

// Fetch author details and their articles
async function getAuthorDataBySlug(slug: string): Promise<{ author: Author | null; articles: Article[] }> {
  try {
    const author = await serverStrapiAPI.getAuthorBySlug(slug);
    
    if (!author) {
      return { author: null, articles: [] };
    }
    
    // Fetch articles by this author
    const articlesResponse = await serverStrapiAPI.getArticlesByAuthor(author.documentId);
    
    return {
      author,
      articles: articlesResponse.data || []
    };
  } catch (error) {
    console.error('Error fetching author data:', error);
    return { author: null, articles: [] };
  }
}

// Generate metadata dynamically for the author page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { author } = await getAuthorDataBySlug(params.slug);

  if (!author) {
    return {
      title: 'Author Not Found | DUFS Blog',
      description: 'The author profile you are looking for could not be found.',
    };
  }

  const authorName = author.Name;

  return {
    title: `${authorName} - Author Profile | DUFS Blog`,
    description: `Read articles and learn more about ${authorName} on DUFS Blog.`,
  };
}

// The main server component for the author page
export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const { author, articles } = await getAuthorDataBySlug(params.slug);

  if (!author) {
    notFound();
  }

  return <AuthorPageClient author={author} articles={articles} />;
}