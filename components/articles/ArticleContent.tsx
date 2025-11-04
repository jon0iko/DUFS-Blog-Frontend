import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import ShareButtons from '@/components/articles/ShareButtons';
import AuthorInfo from '@/components/articles/AuthorInfo';
import CommentSection from '@/components/articles/CommentSection';
import ReadingProgressBar from '@/components/articles/ReadingProgressBar';
import { serverStrapiAPI } from '@/lib/server-api';
import { getArticleImage, formatPublishDate, getAuthorName, getCategoryName, getAuthorAvatar } from '@/lib/strapi-helpers';
import { notFound } from 'next/navigation';

interface ArticleContentProps {
  slug: string;
}

export default async function ArticleContent({ slug }: ArticleContentProps) {
  try {
    // Strapi v5: getArticleBySlug returns Article | null
    const article = await serverStrapiAPI.getArticleBySlug(slug);

    if (!article) {
      notFound();
    }

    const isBengali = article.language === 'bn' || article.language === 'both';
    const imageSrc = getArticleImage(article);
    const authorName = getAuthorName(article.author);
    const categoryName = getCategoryName(article.category);

    return (
      <>
        <ReadingProgressBar />
        
        <article className="min-h-screen bg-background">
          <div className="container max-w-5xl py-10 px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/browse" className="hover:text-foreground">
                Articles
              </Link>
              <span>/</span>
              <Link href={`/browse?category=${categoryName.toLowerCase()}`} className="hover:text-foreground">
                {categoryName}
              </Link>
              <span>/</span>
              <span>{article.title}</span>
            </div>

            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block bg-black text-white text-xs px-3 py-1 uppercase font-medium">
                {categoryName}
              </span>
            </div>

            {/* Title */}
            <h1 className={cn(
              'text-4xl md:text-5xl font-bold mb-6 leading-tight',
              isBengali && 'font-kalpurush'
            )}>
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
              <span>By <Link href={`/authors/${article.author?.slug || ''}`} className="text-foreground hover:underline font-medium">{authorName}</Link></span>
              <span>•</span>
              <time dateTime={article.publishedAt}>
                {formatPublishDate(article.publishedAt)}
              </time>
              <span>•</span>
              <span>{article.readTime || 5} min read</span>
              {article.viewCount > 0 && (
                <>
                  <span>•</span>
                  <span>{article.viewCount.toLocaleString()} views</span>
                </>
              )}
            </div>

            {/* Featured Image */}
            <div className="mb-10 -mx-4 sm:mx-0">
              <div className="relative w-full h-[400px] md:h-[500px]">
                <Image
                  src={imageSrc}
                  alt={article.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Share Buttons */}
                <div className="mb-8">
                  <ShareButtons 
                    title={article.title} 
                    url={`/articles/${article.slug}`}
                  />
                </div>

                {/* Article Content */}
                <div className={cn(
                  'prose prose-sm sm:prose md:prose-lg dark:prose-invert max-w-none mb-8',
                  isBengali && 'font-kalpurush'
                )}>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: article.content 
                    }} 
                  />
                </div>

                <Separator className="my-8" />

                {/* Tags */}
                {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.documentId}
                          href={`/browse?tag=${tag.slug}`}
                          className="inline-block px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-8" />

                {/* Author Info */}
                {article.author && (
                  <AuthorInfo 
                    author={{
                      name: article.author.Name,
                      avatar: getAuthorAvatar(article.author),
                    }}
                  />
                )}

                <Separator className="my-8" />

                {/* Comments */}
                <CommentSection articleId={article.documentId} />
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                {/* Related Articles could go here */}
              </aside>
            </div>
          </div>
        </article>
      </>
    );
  } catch (error) {
    console.error('Failed to load article:', error);
    notFound();
  }
}
