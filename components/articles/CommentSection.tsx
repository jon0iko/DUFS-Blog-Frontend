'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Comment as StrapiComment } from '@/types';
import {
  MessageCircle,
  ThumbsUp,
  Reply,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { strapiAPI } from '@/lib/api';
import { config } from '@/lib/config';
import { getUserAvatarUrl } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

interface CommentSectionProps {
  articleId: number;
  articleDocumentId: string;
  initialComments?: StrapiComment[];
  totalCommentsCount?: number;
}

const COMMENTS_PER_PAGE = 10;

export default function CommentSection({
  articleId,
  articleDocumentId,
  initialComments = [],
  totalCommentsCount: initialTotalCount = 0,
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<StrapiComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [totalCount, setTotalCount] = useState(initialTotalCount || initialComments.length);

  // Relative-time formatter
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }, []);

  // Paginated loader
  const loadComments = useCallback(async (page: number, append = false) => {
    setIsLoadingComments(true);
    try {
      const result = await strapiAPI.getCommentsByArticlePaginated(
        articleDocumentId,
        page,
        COMMENTS_PER_PAGE
      );
      setComments(prev => (append ? [...prev, ...result.comments] : result.comments));
      setTotalCount(result.total);
      setHasMoreComments(page * COMMENTS_PER_PAGE < result.total);
      setCurrentPage(page);
    } catch {
      // silently fail; count still visible
    } finally {
      setIsLoadingComments(false);
    }
  }, [articleDocumentId]);

  // Auto-load on mount
  useEffect(() => {
    if (articleDocumentId) loadComments(1);
  }, [articleDocumentId, loadComments]);

  const handleLoadMore = () => loadComments(currentPage + 1, true);

  const refreshComments = useCallback(async () => {
    await loadComments(1);
  }, [loadComments]);

  // Submit top-level comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await strapiAPI.createComment(articleId, newComment.trim(), user.id);
      const withUser = {
        ...created,
        users_permissions_user: { username: user.username, id: user.id },
        replies: [],
      };
      setComments(prev => [withUser, ...prev]);
      setTotalCount(prev => prev + 1);
      setNewComment('');
    } catch {
      setSubmitError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // â”€â”€â”€ CommentItem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const CommentItem = ({
    comment,
    isReply = false,
    onReplyAdded,
  }: {
    comment: StrapiComment;
    isReply?: boolean;
    onReplyAdded?: () => void;
  }) => {
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const [localReplies, setLocalReplies] = useState<StrapiComment[]>(comment.replies || []);

    // Resolve display name + avatar from relation
    const userInfo = (() => {
      if (!comment.users_permissions_user) return { name: 'Anonymous', avatar: null };
      if (typeof comment.users_permissions_user === 'object') {
        const u = comment.users_permissions_user as {
          username?: string;
          Avatar?: { url?: string } | null;
        };
        let avatarUrl: string | null = null;
        if (u.Avatar?.url) {
          avatarUrl = u.Avatar.url.startsWith('http')
            ? u.Avatar.url
            : `${config.strapi.url}${u.Avatar.url}`;
        }
        return { name: u.username || 'Anonymous', avatar: avatarUrl };
      }
      return { name: 'Anonymous', avatar: null };
    })();

    const isOwner = Boolean(
      user &&
        comment.users_permissions_user &&
        typeof comment.users_permissions_user === 'object' &&
        (comment.users_permissions_user as { id?: number }).id === user.id
    );

    const AvatarEl = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
      const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
      const imgSrc = userInfo.avatar || '/images/avatarPlaceholder.png';
      return (
        <div className={cn('flex-shrink-0 rounded-full overflow-hidden relative', dim)}>
          <Image src={imgSrc} alt={userInfo.name} fill className="object-cover" />
        </div>
      );
    };

    const handleLike = async () => {
      if (!isAuthenticated) return;
      const next = hasLiked ? likeCount - 1 : likeCount + 1;
      setHasLiked(!hasLiked);
      setLikeCount(next);
      try {
        await strapiAPI.updateCommentLikes(comment.documentId, next);
      } catch {
        setHasLiked(hasLiked);
        setLikeCount(likeCount);
      }
    };

    const handleSubmitReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyContent.trim() || !isAuthenticated || !user) return;
      setIsSubmittingReply(true);
      try {
        const created = await strapiAPI.createCommentReply(
          comment.id,
          articleId,
          replyContent.trim(),
          user.id
        );
        const withUser = {
          ...created,
          users_permissions_user: { username: user.username, id: user.id },
        };
        setLocalReplies(prev => [...prev, withUser]);
        setReplyContent('');
        setShowReplyForm(false);
        setTotalCount(prev => prev + 1);
        onReplyAdded?.();
      } catch {
        // could surface toast
      } finally {
        setIsSubmittingReply(false);
      }
    };

    const handleDelete = async () => {
      if (!confirm('Delete this comment?')) return;
      try {
        await strapiAPI.deleteComment(comment.documentId);
        setTotalCount(prev => prev - 1 - localReplies.length);
        refreshComments();
      } catch {
        // silently fail
      }
    };

    return (
      <div className={cn(isReply && 'ml-10 pl-4 border-l-2 border-border')}>
        <div className="flex gap-3 group">
          <AvatarEl />
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {userInfo.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.CommentDateTime)}
                </span>
              </div>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 p-0.5 rounded shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Body */}
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
              {comment.Content}
            </p>

            {/* Action row */}
            <div className="flex items-center gap-1 mt-2.5">
              {/* Like */}
              <button
                onClick={handleLike}
                disabled={!isAuthenticated}
                className={cn(
                  'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors',
                  hasLiked
                    ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  !isAuthenticated && 'opacity-50 cursor-default'
                )}
                title={!isAuthenticated ? 'Sign in to like' : undefined}
              >
                <ThumbsUp className={cn('w-3.5 h-3.5', hasLiked && 'fill-current')} />
                {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
              </button>

              {/* Reply */}
              {!isReply && comment.isReplyable !== false && (
                <button
                  onClick={() => setShowReplyForm(v => !v)}
                  disabled={!isAuthenticated}
                  className={cn(
                    'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors',
                    showReplyForm
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    !isAuthenticated && 'opacity-50 cursor-default'
                  )}
                  title={!isAuthenticated ? 'Sign in to reply' : undefined}
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
              )}

              {/* Toggle replies */}
              {!isReply && localReplies.length > 0 && (
                <button
                  onClick={() => setShowReplies(v => !v)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-primary hover:bg-primary/10 transition-colors"
                >
                  {showReplies ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {localReplies.length}{' '}
                  {localReplies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>

            {/* Inline reply composer */}
            {showReplyForm && isAuthenticated && (
              <form onSubmit={handleSubmitReply} className="mt-3">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden relative mt-0.5">
                    <Image
                      src={getUserAvatarUrl(user)}
                      alt={user?.username || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${userInfo.name}â€¦`}
                      rows={2}
                      className={cn(
                        'w-full p-2.5 rounded-lg border text-sm resize-none',
                        'bg-secondary/50 border-border',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        'placeholder:text-muted-foreground'
                      )}
                    />
                    <div className="flex justify-end gap-2 mt-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => { setShowReplyForm(false); setReplyContent(''); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!replyContent.trim() || isSubmittingReply}
                        className="h-7 text-xs px-3 gap-1.5"
                      >
                        {isSubmittingReply
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Send className="w-3 h-3" />}
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Threaded replies */}
        {!isReply && showReplies && localReplies.length > 0 && (
          <div className="mt-4 space-y-4">
            {localReplies.map(reply => (
              <CommentItem key={reply.id || reply.documentId} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <section className="space-y-8">
      {/* Heading */}
      <div className="flex items-center gap-2.5">
        <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
        <h2 className="text-lg font-bold text-foreground">
          Discussion
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({totalCount})
            </span>
          )}
        </h2>
      </div>

      {/* Composer */}
      <div className="rounded-xl border border-border bg-card p-4">
        {isAuthenticated && user ? (
          <form onSubmit={handleSubmitComment}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden relative">
                <Image src={getUserAvatarUrl(user)} alt={user.username} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughtsâ€¦"
                  rows={3}
                  className={cn(
                    'w-full p-3 rounded-lg border text-sm resize-none',
                    'bg-secondary/40 border-border',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    'placeholder:text-muted-foreground'
                  )}
                />
                {submitError && (
                  <p className="text-xs text-red-500 mt-1">{submitError}</p>
                )}
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || isSubmitting}
                    className="gap-2 px-4"
                  >
                    {isSubmitting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-4 py-1">
            <MessageCircle className="w-8 h-8 text-muted-foreground/30 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Join the discussion and share your thoughts.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/signin">Sign in to comment</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {isLoadingComments && comments.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No comments yet â€” be the first!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem
              key={comment.id || comment.documentId}
              comment={comment}
              onReplyAdded={refreshComments}
            />
          ))}

          {hasMoreComments && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingComments}
                className="gap-2 rounded-full text-xs"
              >
                {isLoadingComments
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <ChevronDown className="w-3.5 h-3.5" />}
                Load more comments
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

