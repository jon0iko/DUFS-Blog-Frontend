import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import { config } from "@/lib/config";
import { getAuthorAvatar } from "@/lib/strapi-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Tag } from "lucide-react";

// Hooks
import { useArticleData } from "@/hooks/useArticleData";
import { useViewCount } from "@/hooks/useViewCount";
import { useArticleInteractions } from "@/hooks/useArticleInteractions";
import { useMobileBarVisibility } from "@/hooks/useMobileBarVisibility";
import { useArticleReadProgress } from "@/hooks/useArticleReadProgress";

// Sub-components
import ArticleHTMLContent from "./ArticleHTMLContent";
import CommentSection from "./CommentSection";
import RelatedArticles from "./RelatedArticles";
import ReadingProgressBar from "./ReadingProgressBar";
import FilmProgressWheel from "./FilmProgressWheel";
import ArticleHero from "./ArticleHero";
import ArticleSidebarActions from "./ArticleSidebarActions";
import ArticleRightSidebar from "./ArticleRightSidebar";
import ArticleMobileActionsBar from "./ArticleMobileActionsBar";
import ArticleAuthorSection from "./ArticleAuthorSection";

gsap.registerPlugin(ScrollToPlugin);

type FontSize = "small" | "medium" | "large";

interface ArticleContentClientProps {
  slug: string;
}

export default function ArticleContentClient({ slug }: ArticleContentClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const toast = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = useState<FontSize>("large");
  const [isSepiaMode, setIsSepiaMode] = useState(false);

  const { article, relatedArticles, loading, error } = useArticleData(slug);
  const viewCount = useViewCount(article, slug);
  const {
    likes,
    hasLiked,
    isLikeLoading,
    isBookmarked,
    isBookmarkLoading,
    handleLike,
    handleBookmark,
  } = useArticleInteractions({ article, userId: user?.id, isAuthenticated, isAuthLoading });
  const showMobileBar = useMobileBarVisibility(!!article);

  // Restore article read progress once content is in the DOM
  useArticleReadProgress({
    slug,
    contentRef,
    isReady: !loading && !!article,
  });

  // Scroll to top whenever the slug changes (restore will override if there
  // is a saved position, since it runs after article data loads)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  const copyToClipboard = async (url: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts (e.g. LAN IP on Android during dev)
        const el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.cssText = "position:absolute;left:-9999px;top:-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        // Pass only `url` — most universally accepted by iOS Safari, Android Chrome, etc.
        await navigator.share({ url });
      } catch (err: unknown) {
        // AbortError = user dismissed the share sheet; not a real failure
        if (err instanceof Error && err.name !== "AbortError") {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const handleDiscuss = () => {
    const el = document.getElementById("comment-section");
    if (el) {
      gsap.to(window, { duration: 0.95, scrollTo: { y: el, offsetY: 60 }, ease: "power2.inOut" });
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
            {error || "The article you are looking for does not exist."}
          </p>
          <Button onClick={() => router.push("/")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = article.featuredImage?.url
    ? article.featuredImage.url.startsWith("http")
      ? article.featuredImage.url
      : `${config.strapi.url}${article.featuredImage.url}`
    : "/images/placeholder.jpg";

  const authorAvatar = article.author ? getAuthorAvatar(article.author) : undefined;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  const shortPublishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "";

  // Shared action props passed to both sidebar and mobile bar
  const actionProps = {
    likes,
    hasLiked,
    isLikeLoading,
    isBookmarked,
    isBookmarkLoading,
    isAuthenticated,
    fontSize,
    onLike: handleLike,
    onBookmark: handleBookmark,
    onShare: handleShare,
    onDiscuss: handleDiscuss,
    onFontSizeChange: setFontSize,
  };

  return (
    <div className={isSepiaMode ? "sepia-article min-h-screen" : undefined}>
      <ReadingProgressBar className="lg:hidden" targetId="article-content" />
      <FilmProgressWheel targetId="article-content" />

      <article className="relative">
        <ArticleHero
          article={article}
          imageUrl={imageUrl}
          authorAvatar={authorAvatar}
          publishedDate={publishedDate}
          shortPublishedDate={shortPublishedDate}
          viewCount={viewCount}
        />

        <div className="container px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[56px_1fr] xl:grid-cols-[56px_1fr_220px] gap-8">
            <ArticleSidebarActions
              {...actionProps}
              isSepiaMode={isSepiaMode}
              onSepiaChange={setIsSepiaMode}
            />

            {/* Main Article Content */}
            <div className="min-w-0 pb-10 lg:pb-4">
              <div className="max-w-[800px]">
                <div id="article-content" ref={contentRef}>
                  <ArticleHTMLContent content={article.content} fontSize={fontSize} />
                </div>

                {/* Tags - mobile / non-xl only */}
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
                          <span className="inline-block text-xs px-2.5 py-1 rounded-md border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer">
                            #{tag.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {article.author && (
                  <ArticleAuthorSection author={article.author} authorAvatar={authorAvatar} />
                )}

                <div id="comment-section" className="mt-12">
                  <CommentSection
                    articleId={article.id}
                    articleDocumentId={article.documentId}
                  />
                </div>
              </div>
            </div>

            <ArticleRightSidebar article={article} />
          </div>
        </div>

        {relatedArticles.length > 0 && (
          <div className={`py-14 ${isSepiaMode ? "bg-secondary" : "bg-secondary dark:bg-brand-black-90"}`}>
            <div className="container mx-auto px-4">
              <RelatedArticles articles={relatedArticles} />
            </div>
          </div>
        )}

        <ArticleMobileActionsBar
          show={showMobileBar}
          {...actionProps}
          isSepiaMode={isSepiaMode}
          onSepiaChange={setIsSepiaMode}
        />
      </article>
    </div>
  );
}
