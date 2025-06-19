import type { Metadata } from 'next'

interface PageParams {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  // In a real app, fetch author data from an API
  let authorName = "Author";
  
  // Check if params and slug exist before trying to process them
  if (params && params.slug) {
    // Handle both hyphenated and non-hyphenated slugs
    if (params.slug.includes('-')) {
      try {
        authorName = params.slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } catch (error) {
        console.error("Error formatting author slug:", error);
        authorName = params.slug; // Use slug as is if formatting fails
      }
    } else {
      // For non-hyphenated slugs (like Bengali names), use as is
      authorName = params.slug;
    }
  }

  return {
    title: `${authorName} - Author Profile | DUFS Blog`,
    description: `Read articles written by ${authorName} on DUFS Blog.`,
  }
}

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">{children}</div>
  )
}
