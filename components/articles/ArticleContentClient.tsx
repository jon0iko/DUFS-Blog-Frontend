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
  
  // View count state
  const [viewCount, setViewCount] = useState(0);

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
        setViewCount(articleData.viewCount || 0);

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

  // Fire-and-forget view count increment (once per session per slug)
  useEffect(() => {
    if (!article?.documentId) return;

    const key = `viewed_${slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      fetch(`${config.strapi.url}/api/articles/${slug}/view`, { method: 'POST' })
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data?.viewCount !== undefined) {
            setViewCount(data.viewCount);
          }
        })
        .catch(() => {
          // Silently ignore errors — view count is non-critical
        });
    }
  }, [article?.documentId, slug]);

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
        <div className="relative h-[60vh] min-h-[510px] bg-black overflow-hidden">
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
                    className="md:hidden mb-4 text-sm px-4 py-1 bg-white text-black cursor-pointer hover:bg-black hover:text-white"
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
                <p className={cn("text-base md:text-lg text-gray-300 mb-6 leading-relaxed max-w-2xl", getFontClass(article.excerpt))}>
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
                    <span>{viewCount.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[56px_1fr] xl:grid-cols-[56px_1fr_220px] gap-8">
            {/* Left Sidebar - Share & Actions (Desktop) */}
            <aside className="hidden lg:flex flex-col items-center sticky top-24 self-start h-fit gap-3">
              {/* Font Size Control */}
              <div className="flex flex-col items-center gap-1.5 pb-4 border-b border-border w-full">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Font</span>
                <div className="flex flex-col items-center gap-1 w-full">
                  <Button
                    variant={fontSize === 'small' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-10 h-8 p-0 font-bold"
                    onClick={() => setFontSize('small')}
                    title="Small font"
                  >
                    <span className="text-xs">A</span>
                  </Button>
                  <Button
                    variant={fontSize === 'medium' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-10 h-8 p-0 font-bold"
                    onClick={() => setFontSize('medium')}
                    title="Medium font"
                  >
                    <span className="text-sm">A</span>
                  </Button>
                  <Button
                    variant={fontSize === 'large' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-10 h-8 p-0 font-bold"
                    onClick={() => setFontSize('large')}
                    title="Large font"
                  >
                    <span className="text-base">A</span>
                  </Button>
                </div>
              </div>

              {/* Like */}
              <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLikeLoading}
                className={cn(
                  "flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-xl transition-all",
                  hasLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground",
                  (!isAuthenticated) && "opacity-50"
                )}
                title={isAuthenticated ? (hasLiked ? "Unlike" : "Like") : "Sign in to like"}
              >
                <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
                <span className="text-xs font-medium tabular-nums">{likes}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                disabled={!isAuthenticated || isBookmarkLoading}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                  isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground",
                  (!isAuthenticated) && "opacity-50"
                )}
                title={isAuthenticated ? (isBookmarked ? "Remove bookmark" : "Bookmark") : "Sign in to bookmark"}
              >
                <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                title="Share article"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </aside>

            {/* Main Article Content */}
            <div className="min-w-0 pb-24 lg:pb-4">
              <div className="max-w-[900px]">
                {/* Article content with ID for progress tracking */}
                <div id="article-content" ref={contentRef}>
                  <ArticleHTMLContent 
                    content={article.content} 
                    fontSize={fontSize}
                  />
                </div>

                {/* Tags - mobile only */}
                {article.tags && article.tags.length > 0 && (
                  <div className="xl:hidden mt-10 pt-8 border-t border-border">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <Link 
                          key={tag.id}
                          href={`/browse?search=${encodeURIComponent(tag.name)}&category=all`}
                        >
                          <span className="inline-block text-xs px-2.5 py-1 rounded-full border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer">
                            #{tag.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Bio */}
                {article.author && (
                  <div className="mt-10 rounded-xl border border-border bg-card overflow-hidden">
                    <Link 
                      href={`/author?slug=${article.author.slug}`}
                      className="flex gap-4 p-5 group"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-border group-hover:border-primary transition-colors">
                        <Image
                          src={authorAvatar || '/images/avatarPlaceholder.png'}
                          alt={article.author.Name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Written by</p>
                        <h3 className={cn("text-base font-semibold group-hover:text-primary transition-colors", getFontClass(article.author.Name))}>{article.author.Name}</h3>
                        {article.author.Bio && (
                          <p className={cn("text-sm text-muted-foreground mt-1 line-clamp-2", getFontClass(article.author.Bio))}>
                            {article.author.Bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                )}

              {/* Comments Section */}
              <div className="mt-12">
                <CommentSection 
                  articleId={article.id}
                  articleDocumentId={article.documentId}
                />
              </div>
              </div>{/* end max-w-[700px] */}
            </div>{/* end main column */}

            {/* Right Sidebar - Category & Tags (Desktop) */}
            <aside className="hidden xl:flex flex-col sticky top-24 self-start h-fit space-y-4">
              {/* Category */}
              {article.category && (
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Category</span>
                  </div>
                  <Link 
                    href={`/browse?category=${article.category.Slug}`}
                    className="block"
                  >
                    <div className={cn(
                      "w-full text-center py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-80",
                      "bg-foreground text-background",
                      getFontClass(article.category.Name)
                    )}>
                      {article.category.Name}
                    </div>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Click to explore more
                  </p>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <Link 
                        key={tag.id}
                        href={`/browse?search=${encodeURIComponent(tag.name)}&category=all`}
                      >
                        <span className="inline-block text-xs px-2.5 py-1 rounded-full border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer">
                          #{tag.name}
                        </span>
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
          <div className="bg-secondary dark:bg-brand-black-90 py-14">
            <div className="container mx-auto px-4">
              <RelatedArticles articles={relatedArticles} />
            </div>
          </div>
        )}

        {/* Mobile Actions Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          {/* safe area inset for notched phones */}
          <div className="bg-card/95 backdrop-blur-md border-t border-border shadow-2xl px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex items-center justify-around max-w-sm mx-auto">
              {/* Like */}
              <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLikeLoading}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                  hasLiked ? "text-red-500" : "text-muted-foreground",
                  !isAuthenticated && "opacity-50"
                )}
              >
                <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
                <span className="text-[11px] font-medium tabular-nums">{likes}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                disabled={!isAuthenticated || isBookmarkLoading}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                  isBookmarked ? "text-amber-500" : "text-muted-foreground",
                  !isAuthenticated && "opacity-50"
                )}
              >
                <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
                <span className="text-[11px] font-medium">Save</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-[11px] font-medium">Share</span>
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-border mx-1" />

              {/* Font Size */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-muted-foreground">A</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                    className="text-xs font-medium border border-border rounded-md px-1 py-1 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none pr-4"
                  >
                    <option value="small">S</option>
                    <option value="medium">M</option>
                    <option value="large">L</option>
                  </select>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">Font</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
