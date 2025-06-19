import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { featuredArticles, editorsChoiceArticles } from '@/data/dummy-data';
import AuthorPageClient from '@/components/authors/AuthorPageClient';

// Define or ensure you have these types that match your dummy data structure
interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  // Add other relevant author fields
}

interface Article {
  id: string | number;
  slug: string;
  title: string;
  author: Author; // Ensure your article data nests an Author object
  date: string;
  excerpt?: string;
  imageUrl?: string;
  // Add other relevant article fields
  [key: string]: any; // Allows for other properties if not strictly typed
}

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
  const allArticles: Article[] = [...featuredArticles, ...editorsChoiceArticles] as Article[];
  const authorSlugs = new Set<string>();

  allArticles.forEach(article => {
    if (article.author && article.author.name) {
      authorSlugs.add(generateSlugFromName(article.author.name));
    }
  });

  return Array.from(authorSlugs).map(slug => ({
    slug: slug,
  }));
}

// Simulate fetching author details and their articles
async function getAuthorDataBySlug(slug: string): Promise<{ author: Author | null; articles: Article[] }> {
  const allArticles: Article[] = [...featuredArticles, ...editorsChoiceArticles] as Article[];
  let foundAuthor: Author | null = null;

  for (const article of allArticles) {
    if (article.author && article.author.name) {
      const currentAuthorSlug = generateSlugFromName(article.author.name);
      if (currentAuthorSlug === slug) {
        foundAuthor = article.author;
        break; 
      }
    }
  }

  if (!foundAuthor) {
    return { author: null, articles: [] };
  }

  const authorArticles = allArticles.filter(
    article => article.author && article.author.name === foundAuthor?.name
  );

  return { author: foundAuthor, articles: authorArticles };
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

  const authorName = author.name;

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