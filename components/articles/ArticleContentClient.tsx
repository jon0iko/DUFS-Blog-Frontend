import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { strapiAPI } from '@/lib/api';
import { Article } from '@/types';
import { config } from '@/lib/config';
import { getAuthorAvatar } from '@/lib/strapi-helpers';
import { getFontClass } from '@/lib/fonts';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Like state
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeDocumentId, setLikeDocumentId] = useState<string | null>(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkDocumentId, setBookmarkDocumentId] = useState<string | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Fetch article data
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
        setLikes(articleData.likes || 0);

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

  // Check if user has liked/bookmarked the article
  useEffect(() => {
    const checkUserInteractions = async () => {
      // Wait for auth to finish loading and ensure we have user and article
      if (isAuthLoading || !user?.id || !article?.id) return;

      try {
        // Check like status
        const likeStatus = await strapiAPI.hasUserLikedArticle(user.id, article.id);
        setHasLiked(likeStatus.liked);
        if (likeStatus.likeId) {
          setLikeDocumentId(likeStatus.likeId);
        }

        // Check bookmark status
        const bookmarkStatus = await strapiAPI.hasUserBookmarkedArticle(user.id, article.id);
        setIsBookmarked(bookmarkStatus.bookmarked);
        if (bookmarkStatus.bookmarkId) {
          setBookmarkDocumentId(bookmarkStatus.bookmarkId);
        }
      } catch (err) {
        console.error('Error checking user interactions:', err);
      }
    };

    checkUserInteractions();
  }, [isAuthLoading, user?.id, article?.id]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !article?.id || isLikeLoading) return;

    setIsLikeLoading(true);

    try {
      if (hasLiked && likeDocumentId) {
        // Unlike
        const success = await strapiAPI.unlikeArticle(likeDocumentId);
        if (success) {
          const newLikesCount = Math.max(0, likes - 1);
          setLikes(newLikesCount);
          setHasLiked(false);
          setLikeDocumentId(null);
          // Update article likes count
          await strapiAPI.updateArticleLikes(article.documentId, newLikesCount);
        }
      } else {
        // Like
        const result = await strapiAPI.likeArticle(user.id, article.id);
        if (result.success) {
          const newLikesCount = likes + 1;
          setLikes(newLikesCount);
          setHasLiked(true);
          if (result.likeId) {
            setLikeDocumentId(result.likeId);
          }
          // Update article likes count
          await strapiAPI.updateArticleLikes(article.documentId, newLikesCount);
        }
      }
    } catch (err) {
      console.error('Error handling like:', err);
    } finally {
      setIsLikeLoading(false);
    }
  }, [isAuthenticated, user?.id, article?.id, article?.documentId, hasLiked, likeDocumentId, likes, isLikeLoading]);

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !article?.id || isBookmarkLoading) return;

    setIsBookmarkLoading(true);

    try {
      if (isBookmarked && bookmarkDocumentId) {
        // Remove bookmark
        const success = await strapiAPI.removeBookmark(bookmarkDocumentId);
        if (success) {
          setIsBookmarked(false);
          setBookmarkDocumentId(null);
        }
      } else {
        // Add bookmark
        const result = await strapiAPI.bookmarkArticle(user.id, article.id);
        if (result.success) {
          setIsBookmarked(true);
          if (result.bookmarkId) {
            setBookmarkDocumentId(result.bookmarkId);
          }
        }
      }
    } catch (err) {
      console.error('Error handling bookmark:', err);
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [isAuthenticated, user?.id, article?.id, isBookmarked, bookmarkDocumentId, isBookmarkLoading]);

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
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
      <div className="container m-20 max-w-7xl mx-auto px-4 py-12 pt-18">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Error!</h1>
          <p className="text-muted-foreground mb-8">
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
      {/* Reading progress bar - tracks only the article content */}
      <ReadingProgressBar targetId="article-content" />
      
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
                    className="mb-4 text-sm px-4 py-1 bg-black text-white cursor-pointer transition"
                  >
                    <Link href={`/browse/?category=${article.category.Slug}`}>
                    <span className={getFontClass(article.category.Name)}>
                      {article.category.Name}
                    </span>
                    </Link>
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
                    <Link 
                      href={`/author?slug=${article.author.slug}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
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
                          <span className={cn("font-medium text-white hover:underline", getFontClass(article.author.Name))}>{article.author.Name}</span>
                        </div>
                      </div>
                    </Link>
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
                <div className="flex flex-col items-center gap-2 pb-4 border-b border-border">
                  <span className="text-xs text-muted-foreground mb-1">Font</span>
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
                  disabled={!isAuthenticated || isLikeLoading}
                  title={isAuthenticated ? "Like article" : "Sign in to like"}
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
                  disabled={!isAuthenticated || isBookmarkLoading}
                  title={isAuthenticated ? "Bookmark" : "Sign in to bookmark"}
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
            <div className="flex-1 max-w-4xl">
              {/* Article content with ID for progress tracking */}
              <div id="article-content" ref={contentRef}>
                <ArticleHTMLContent 
                  content={article.content} 
                  fontSize={fontSize}
                />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="lg:hidden  mt-12 pt-8 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link 
                        key={tag.id}
                        href={`/browse?search=${encodeURIComponent(tag.name)}&category=all`}
                      >
                        <Badge 
                          variant="outline"
                          className="text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              {article.author && (
                <div className="mt-12 p-6 rounded-lg bg-secondary dark:bg-secondary border border-border">
                  <Link 
                    href={`/author?slug=${article.author.slug}`}
                    className="flex gap-4 group"
                  >
                    {authorAvatar && (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 group-hover:opacity-80 transition-opacity">
                        <Image
                          src={authorAvatar}
                          alt={article.author.Name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className={cn("text-xl font-semibold mb-2 group-hover:text-primary transition-colors", getFontClass(article.author.Name))}>{article.author.Name}</h3>
                      {article.author.Bio && (
                        <p className={cn("text-muted-foreground", getFontClass(article.author.Bio))}>
                          {article.author.Bio}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-16">
                <CommentSection 
                  articleId={article.id}
                  articleDocumentId={article.documentId}
                />
              </div>
            </div>

            {/* Right Sidebar - Category & Tags (Desktop) */}
            <aside className="hidden xl:block sticky top-24 h-fit w-64 space-y-6">
              {/* Category */}
              {article.category && (
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Click to explore more
                  </p>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link 
                        key={tag.id}
                        href={`/browse?search=${encodeURIComponent(tag.name)}&category=all`}
                      >
                        <Badge 
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-secondary dark:bg-brand-black-90 py-16">
            <div className="container max-w-7xl mx-auto px-4">
              <RelatedArticles articles={relatedArticles} />
            </div>
          </div>
        )}

        

        {/* Mobile Actions Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 z-40 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLikeLoading}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all",
                hasLiked 
                  ? "text-red-500" 
                  : "text-muted-foreground",
                !isAuthenticated && "opacity-50"
              )}
              title={isAuthenticated ? (hasLiked ? "Unlike article" : "Like article") : "Sign in to like"}
            >
              <Heart className={cn("w-6 h-6", hasLiked && "fill-current")} />
              <span className="text-xs font-medium">{likes}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              disabled={!isAuthenticated || isBookmarkLoading}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all",
                isBookmarked 
                  ? "text-amber-500" 
                  : "text-muted-foreground",
                !isAuthenticated && "opacity-50"
              )}
              title={isAuthenticated ? (isBookmarked ? "Remove bookmark" : "Add bookmark") : "Sign in to bookmark"}
            >
              <Bookmark className={cn("w-6 h-6", isBookmarked && "fill-current")} />
              <span className="text-xs font-medium">Save</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-muted-foreground transition-all"
              title="Share article"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-xs font-medium">Share</span>
            </button>

            {/* Font Size Selector */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-base font-bold">A</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="text-sm font-medium border border-border rounded-lg px-1.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  title="Change font size"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Font</span>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
