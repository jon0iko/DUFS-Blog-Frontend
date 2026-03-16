import { useState, useEffect, useCallback } from "react";
import { strapiAPI } from "@/lib/api";
import { Article } from "@/types";
import { useToast } from "@/components/ui/toast";

interface UseArticleInteractionsOptions {
  article: Article | null;
  userId?: number;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

interface UseArticleInteractionsResult {
  likes: number;
  hasLiked: boolean;
  isLikeLoading: boolean;
  isBookmarked: boolean;
  isBookmarkLoading: boolean;
  handleLike: () => Promise<void>;
  handleBookmark: () => Promise<void>;
}

export function useArticleInteractions({
  article,
  userId,
  isAuthenticated,
  isAuthLoading,
}: UseArticleInteractionsOptions): UseArticleInteractionsResult {
  const toast = useToast();

  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeDocumentId, setLikeDocumentId] = useState<string | null>(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkDocumentId, setBookmarkDocumentId] = useState<string | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Sync initial likes count from article
  useEffect(() => {
    if (article?.likes !== undefined) {
      setLikes(article.likes);
    }
    // article?.id gates this so it only runs when a new article loads,
    // not on every likes update from user interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  // Check whether the current user has already liked / bookmarked
  useEffect(() => {
    const checkUserInteractions = async () => {
      if (isAuthLoading || !userId || !article?.id) return;

      try {
        const likeStatus = await strapiAPI.hasUserLikedArticle(userId, article.id);
        setHasLiked(likeStatus.liked);
        if (likeStatus.likeId) setLikeDocumentId(likeStatus.likeId);

        const bookmarkStatus = await strapiAPI.hasUserBookmarkedArticle(userId, article.id);
        setIsBookmarked(bookmarkStatus.bookmarked);
        if (bookmarkStatus.bookmarkId) setBookmarkDocumentId(bookmarkStatus.bookmarkId);
      } catch (err) {
        console.error("Error checking user interactions:", err);
      }
    };

    checkUserInteractions();
  }, [isAuthLoading, userId, article?.id]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      toast.info("Sign in to like articles");
      return;
    }
    if (!article?.id || isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      if (hasLiked && likeDocumentId) {
        const success = await strapiAPI.unlikeArticle(likeDocumentId);
        if (success) {
          const newCount = Math.max(0, likes - 1);
          setLikes(newCount);
          setHasLiked(false);
          setLikeDocumentId(null);
          await strapiAPI.updateArticleLikes(article.documentId, newCount);
        }
      } else {
        const result = await strapiAPI.likeArticle(userId, article.id);
        if (result.success) {
          const newCount = likes + 1;
          setLikes(newCount);
          setHasLiked(true);
          if (result.likeId) setLikeDocumentId(result.likeId);
          await strapiAPI.updateArticleLikes(article.documentId, newCount);
        }
      }
    } catch (err) {
      console.error("Error handling like:", err);
    } finally {
      setIsLikeLoading(false);
    }
  }, [
    isAuthenticated,
    userId,
    article?.id,
    article?.documentId,
    hasLiked,
    likeDocumentId,
    likes,
    isLikeLoading,
    toast,
  ]);

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      toast.info("Sign in to save articles");
      return;
    }
    if (!article?.id || isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      if (isBookmarked && bookmarkDocumentId) {
        const success = await strapiAPI.removeBookmark(bookmarkDocumentId);
        if (success) {
          setIsBookmarked(false);
          setBookmarkDocumentId(null);
        }
      } else {
        const result = await strapiAPI.bookmarkArticle(userId, article.id);
        if (result.success) {
          setIsBookmarked(true);
          if (result.bookmarkId) setBookmarkDocumentId(result.bookmarkId);
        }
      }
    } catch (err) {
      console.error("Error handling bookmark:", err);
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [
    isAuthenticated,
    userId,
    article?.id,
    isBookmarked,
    bookmarkDocumentId,
    isBookmarkLoading,
    toast,
  ]);

  return {
    likes,
    hasLiked,
    isLikeLoading,
    isBookmarked,
    isBookmarkLoading,
    handleLike,
    handleBookmark,
  };
}
