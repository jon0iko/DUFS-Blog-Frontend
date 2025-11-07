import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { strapiAPI } from '@/lib/api';
import { Article, Comment as StrapiComment } from '@/types';
import { config } from '@/lib/config';
import { getAuthorAvatar } from '@/lib/strapi-helpers';
import { getFontClass } from '@/lib/fonts';
import ArticleHTMLContent from './ArticleHTMLContent';
import CommentSection from './CommentSection';
import RelatedArticles from './RelatedArticles';
import ReadingProgressBar from './ReadingProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark,
  ChevronLeft,
  Calendar,
  User,
  Tag,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleContentClientProps {
  slug: string;
}

export default function ArticleContentClient({ slug }: ArticleContentClientProps) {
  const router = useRouter();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<StrapiComment[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch article
        const articleData = await strapiAPI.getArticleBySlug(slug);
        
        if (!articleData) {
          setError('Article not found');
          setLoading(false);
          return;
        }

        setArticle(articleData);
        console.log('Article set in state:', articleData);
        setLikes(articleData.likes || 0);

        // Fetch comments
        if (articleData.documentId) {
          const commentsData = await strapiAPI.getCommentsByArticle(articleData.documentId);
          setComments(commentsData);
        }

        // Fetch related articles
        if (articleData.category?.Slug && articleData.documentId) {
          const relatedData = await strapiAPI.getRelatedArticles(
            articleData.documentId,
            articleData.category.Slug,
            4
          );
          setRelatedArticles(relatedData.data || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticleData();
    }
  }, [slug]);

  // Client-side scroll progress tracking for article content only
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate how much of the content is visible
      // When top of content is at bottom of viewport: 0% progress
      // When bottom of content is at top of viewport: 100% progress
      let progress = 0;

      if (elementTop + elementHeight <= viewportHeight) {
        // Content is fully visible
        progress = 100;
      } else if (elementTop >= viewportHeight) {
        // Content hasn't entered viewport yet
        progress = 0;
      } else {
        // Content is partially visible
        const visiblePortion = viewportHeight - elementTop;
        progress = (visiblePortion / elementHeight) * 100;
      }

      progress = Math.max(0, Math.min(100, progress));
      setScrollProgress(Math.round(progress));

      // Log when user has scrolled through 50%, 75%, and 100% of content
      if (progress === 100) {
        console.log('User completed reading article content');
      } else if (progress >= 75 && scrollProgress < 75) {
        console.log('User scrolled 75% through article');
      } else if (progress >= 50 && scrollProgress < 50) {
        console.log('User scrolled 50% through article');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress]);

  const handleLike = () => {
    if (!hasLiked && article) {
      const newLikesCount = likes + 1;
      setLikes(newLikesCount);
      setHasLiked(true);
      
      // Persist like count to Strapi
      strapiAPI.updateArticleLikes(article.documentId, newLikesCount)
        .catch(err => {
          console.error('Failed to update likes:', err);
          // Revert optimistic update on error
          setLikes(likes);
          setHasLiked(false);
        });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Call API to persist bookmark
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || 'The article you are looking for does not exist.'}
          </p>
          <Button onClick={() => router.push('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = article.featuredImage?.url
    ? (article.featuredImage.url.startsWith('http')
        ? article.featuredImage.url
        : `${config.strapi.url}${article.featuredImage.url}`)
    : '/images/placeholder.jpg';

  const authorAvatar = article.author ? getAuthorAvatar(article.author) : undefined;
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <>
      <ReadingProgressBar />
      
      <article className="relative">
        {/* Hero Section with Cinematic Feel */}
        <div className="relative h-[60vh] min-h-[500px] bg-black overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          
          {/* Film Grain Overlay */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="container max-w-7xl mx-auto px-4 pb-16">
              <div className="max-w-4xl">
                {/* Category Badge */}
                {article.category && (
                  <Badge 
                    className="mb-4 text-sm px-4 py-1 bg-black text-white"
                  >
                    <span className={getFontClass(article.category.Name)}>
                      {article.category.Name}
                    </span>
                  </Badge>
                )}

                {/* Title with Cinematic Typography */}
                <h1 className={cn("text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight", getFontClass(article.title))}>
                  {article.title}
                </h1>

                {/* Excerpt */}
                <p className={cn("text-xl text-gray-300 mb-8 leading-relaxed", getFontClass(article.excerpt))}>
                  {article.excerpt}
                </p>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  {article.author && (
                    <div className="flex items-center gap-3">
                      {authorAvatar && (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                          <Image
                            src={authorAvatar}
                            alt={article.author.Name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className={cn("font-medium text-white", getFontClass(article.author.Name))}>{article.author.Name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{publishedDate}</span>
                  </div>

                  {article.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime} min read</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.viewCount?.toLocaleString() || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="flex gap-8 lg:gap-12">
            {/* Left Sidebar - Share & Actions (Desktop) */}
            <aside className="hidden lg:block sticky top-24 h-fit w-16">
              <div className="flex flex-col items-center gap-4">
                {/* Font Size Control */}
                <div className="flex flex-col items-center gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 mb-1">Font</span>
                  <Button
                    variant={fontSize === 'small' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => setFontSize('small')}
                    title="Small font"
                  >
                    <span className="text-xs font-bold">A</span>
                  </Button>
                  <Button
                    variant={fontSize === 'medium' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-12 h-12 p-0"
                    onClick={() => setFontSize('medium')}
                    title="Medium font"
                  >
                    <span className="text-base font-bold">A</span>
                  </Button>
                  <Button
                    variant={fontSize === 'large' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-14 h-14 p-0"
                    onClick={() => setFontSize('large')}
                    title="Large font"
                  >
                    <span className="text-lg font-bold">A</span>
                  </Button>
                </div>

                {/* Social Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-12 h-12 p-0 flex flex-col gap-1",
                    hasLiked && "text-red-500"
                  )}
                  onClick={handleLike}
                  title="Like article"
                >
                  <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
                  <span className="text-xs">{likes}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-12 h-12 p-0",
                    isBookmarked && "text-amber-500"
                  )}
                  onClick={handleBookmark}
                  title="Bookmark"
                >
                  <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={handleShare}
                  title="Share article"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </aside>

            {/* Main Article Content */}
            <div className="flex-1 max-w-4xl" ref={contentRef}>
              <ArticleHTMLContent 
                content={article.content} 
                fontSize={fontSize}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="lg:hidden  mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        className="text-sm"
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              {article.author && (
                <div className="mt-12 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-4">
                    {authorAvatar && (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={authorAvatar}
                          alt={article.author.Name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className={cn("text-xl font-semibold mb-2", getFontClass(article.author.Name))}>{article.author.Name}</h3>
                      {article.author.Bio && (
                        <p className={cn("text-gray-600 dark:text-gray-400", getFontClass(article.author.Bio))}>
                          {article.author.Bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-16">
                <CommentSection 
                  articleId={article.documentId}
                  comments={comments}
                />
              </div>
            </div>

            {/* Right Sidebar - Category & Tags (Desktop) */}
            <aside className="hidden xl:block sticky top-24 h-fit w-64 space-y-6">
              {/* Category */}
              {article.category && (
                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    <FolderOpen className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                  <Link 
                    href={`/browse?category=${article.category.Slug}`}
                    className="block"
                  >
                    <Badge 
                      className={cn("w-full justify-center py-2 text-sm cursor-pointer hover:opacity-80 transition bg-brand-accent hover:bg-brand-accent", getFontClass(article.category.Name))}
                    >
                      {article.category.Name}
                    </Badge>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Click to explore more
                  </p>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        className="text-xs cursor-default"
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 py-16">
            <div className="container max-w-7xl mx-auto px-4">
              <RelatedArticles articles={relatedArticles} />
            </div>
          </div>
        )}

        

        {/* Mobile Actions Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex flex-col gap-1", hasLiked && "text-red-500")}
              onClick={handleLike}
              title="Like article"
            >
              <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
              <span className="text-xs">{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(isBookmarked && "text-amber-500")}
              onClick={handleBookmark}
              title="Bookmark"
            >
              <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              title="Share article"
            >
              <Share2 className="w-5 h-5" />
            </Button>

            {/* Font Size Selector for Mobile */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
              title="Change font size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </article>
    </>
  );
}
