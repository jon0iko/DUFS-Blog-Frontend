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
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { strapiAPI } from '@/lib/api';
import { config } from '@/lib/config';
import { getUserAvatarUrl, UserData } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

interface CommentSectionProps {
  articleId: number;
  articleDocumentId: string;
  initialComments?: StrapiComment[];
  totalCommentsCount?: number;
}

const COMMENTS_PER_PAGE = 10;
const INITIAL_REPLIES_VISIBLE = 2;

// ─── CommentItem (module-level) ────────────────────────────────────────────────
// Must NOT be defined inside CommentSection. If it were, React would see a new
// component type on every parent re-render (e.g. each keystroke in the textarea),
// causing every CommentItem to unmount+remount and losing all local state
// (likeCount, hasLiked, localReplies, reply form content, etc.).

interface CommentItemProps {
  comment: StrapiComment;
  isReply?: boolean;
  onReplyAdded?: () => void;
  onDeleted?: (documentId: string) => void;
  articleId: number;
  articleDocumentId: string;
  user: UserData | null;
  userId?: number;
  isAuthenticated: boolean;
  formatDate: (dateString: string) => string;
  refreshComments: () => void;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
}

function CommentItem({
  comment,
  isReply = false,
  onReplyAdded,
  onDeleted,
  articleId,
  articleDocumentId,
  user,
  userId,
  isAuthenticated,
  formatDate,
  refreshComments,
  setTotalCount,
}: CommentItemProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeDocumentId, setLikeDocumentId] = useState<string | null>(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [localReplies, setLocalReplies] = useState<StrapiComment[]>(comment.replies || []);
  const [showReplies, setShowReplies] = useState(true);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredReplies = localReplies.filter(r => !r.HideComment);

  // Load persisted like state for this comment
  useEffect(() => {
    if (!isAuthenticated || !userId || !comment.id) return;
    strapiAPI.hasUserLikedComment(userId, comment.id).then(result => {
      if (result.liked) {
        setHasLiked(true);
        setLikeDocumentId(result.likeId ?? null);
      }
    });
  }, [isAuthenticated, userId, comment.id]);
  const visibleReplies = showAllReplies
    ? filteredReplies
    : filteredReplies.slice(0, INITIAL_REPLIES_VISIBLE);
  const hiddenRepliesCount = filteredReplies.length - INITIAL_REPLIES_VISIBLE;

  // Resolve display name + avatar; fall back to logged-in user data when the
  // server omits username (Strapi populate not returning the field for that comment).
  const userInfo = (() => {
    if (!comment.users_permissions_user) return { name: 'Anonymous', avatar: null };
    if (typeof comment.users_permissions_user === 'object') {
      const u = comment.users_permissions_user as {
        id?: number;
        username?: string;
        Avatar?: { url?: string } | null;
      };
      const isCurrentUser = user != null && u.id === user.id;
      const resolvedName = u.username || (isCurrentUser ? user.username : 'Anonymous');
      let avatarUrl: string | null = null;
      if (u.Avatar?.url) {
        avatarUrl = u.Avatar.url.startsWith('http')
          ? u.Avatar.url
          : `${config.strapi.url}${u.Avatar.url}`;
      } else if (isCurrentUser) {
        avatarUrl = getUserAvatarUrl(user);
      }
      return { name: resolvedName, avatar: avatarUrl };
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
    if (!isAuthenticated || !userId || isLikeLoading) return;
    setIsLikeLoading(true);
    if (hasLiked && likeDocumentId) {
      // Optimistic update
      setHasLiked(false);
      setLikeCount(c => c - 1);
      setLikeDocumentId(null);
      const [unliked] = await Promise.all([
        strapiAPI.unlikeComment(likeDocumentId),
        strapiAPI.updateCommentLikes(comment.documentId, likeCount - 1),
      ]);
      if (!unliked) {
        // Revert
        setHasLiked(true);
        setLikeCount(c => c + 1);
        setLikeDocumentId(likeDocumentId);
      }
    } else {
      // Optimistic update
      setHasLiked(true);
      setLikeCount(c => c + 1);
      const [result] = await Promise.all([
        strapiAPI.likeComment(userId, comment.id),
        strapiAPI.updateCommentLikes(comment.documentId, likeCount + 1),
      ]);
      if (result.success && result.likeId) {
        setLikeDocumentId(result.likeId);
      } else {
        // Revert
        setHasLiked(false);
        setLikeCount(c => c - 1);
      }
    }
    setIsLikeLoading(false);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !isAuthenticated || !user) return;
    setIsSubmittingReply(true);
    try {
      const created = await strapiAPI.createCommentReply(
        comment.documentId,
        articleDocumentId,
        replyContent.trim(),
        user.id
      );
      const withUser = {
        ...created,
        users_permissions_user: { username: user.username, id: user.id },
      };
      setLocalReplies(prev => [...prev, withUser]);
      setShowAllReplies(true);
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
    setIsDeleting(true);
    try {
      await strapiAPI.deleteComment(comment.documentId);
      setShowDeleteDialog(false);
      setTotalCount(prev => prev - 1 - filteredReplies.length);
      toastSuccess('Comment deleted.');
      onDeleted?.(comment.documentId);
    } catch {
      toastError('Failed to delete comment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !isDeleting && setShowDeleteDialog(false)}
        >
          <div
            className="bg-background rounded-2xl shadow-xl border border-border p-6 max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete comment?</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This will permanently remove your comment{localReplies.length > 0 ? ` and its ${localReplies.length} ${localReplies.length === 1 ? 'reply' : 'replies'}` : ''}. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
                className="gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
      <div className="flex gap-3 group">
        <AvatarEl />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground leading-none">
                {userInfo.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.CommentDateTime)}
              </span>
            </div>
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
              disabled={!isAuthenticated || isLikeLoading}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors',
                hasLiked
                  ? 'text-black bg-brand-accent dark:brand-accent'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                (!isAuthenticated || isLikeLoading) && 'opacity-50 cursor-default'
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
            {!isReply && filteredReplies.length > 0 && (
              <button
                onClick={() => {
                  if (showReplies) setShowAllReplies(false);
                  setShowReplies(v => !v);
                }}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-primary hover:bg-primary/10 transition-colors"
              >
                {showReplies ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> Hide replies</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> {filteredReplies.length} {filteredReplies.length === 1 ? 'reply' : 'replies'}</>
                )}
              </button>
            )}

            {/* Delete */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Inline reply composer */}
          {showReplyForm && isAuthenticated && user && (
            <form onSubmit={handleSubmitReply} className="mt-3">
              <div className="flex gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden relative mt-0.5">
                  <Image
                    src={getUserAvatarUrl(user)}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${userInfo.name}\u2026`}
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
                        : 'Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Threaded replies */}
      {!isReply && showReplies && filteredReplies.length > 0 && (
        <div className="mt-3 ml-[18px] border-l-2 border-border">
          <div className="pl-5 pt-3 space-y-4">
            {visibleReplies.map(reply => (
              <CommentItem
                key={reply.id || reply.documentId}
                comment={reply}
                isReply
                articleId={articleId}
                articleDocumentId={articleDocumentId}
                userId={user?.id}
                user={user}
                isAuthenticated={isAuthenticated}
                formatDate={formatDate}
                refreshComments={refreshComments}
                setTotalCount={setTotalCount}
                onDeleted={(docId) => setLocalReplies(prev => prev.filter(r => r.documentId !== docId))}
              />
            ))}
            {filteredReplies.length > INITIAL_REPLIES_VISIBLE && (
              <button
                onClick={() => setShowAllReplies(v => !v)}
                className="text-xs text-primary hover:underline pb-1"
              >
                {showAllReplies
                  ? 'Show fewer'
                  : `+${hiddenRepliesCount} more ${hiddenRepliesCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

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
      const created = await strapiAPI.createComment(articleDocumentId, newComment.trim(), user.id);
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


  return (
    <section className="space-y-8">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-foreground">
        Comments
        {totalCount > 0 && (
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({totalCount})
          </span>
        )}
      </h2>

      {/* Composer */}
      {isAuthenticated && user ? (
        <form onSubmit={handleSubmitComment}>
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden relative mt-0.5">
              <Image src={getUserAvatarUrl(user)} alt={user.username} fill className="object-cover" />
            </div>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className={cn(
                'flex-1 p-3 rounded-lg border text-sm resize-none',
                'bg-background border-border',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>
          {submitError && (
            <p className="text-xs text-red-500 mt-1 ml-13">{submitError}</p>
          )}
          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              variant="outline"
              disabled={!newComment.trim() || isSubmitting}
              className="px-12 rounded-md uppercase tracking-widest text-xs font-semibold h-10 border-foreground"
            >
              {isSubmitting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : 'Submit'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex justify-center items-center py-1">
          {/* <MessageCircle className="w-8 h-8 text-muted-foreground/30 flex-shrink-0" /> */}
          <div>
            {/* <p className="text-sm text-muted-foreground mb-2">
              Join the discussion and share your thoughts.
            </p> */}
            <Button asChild size="sm" variant="outline" className='border-foreground shadow-lg dark:shadow-lg dark:shadow-accent/40'>
              <Link href="/auth/signin">Sign in to comment</Link>
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoadingComments && comments.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-0 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No discussions yet. Start one!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.filter(c => !c.HideComment).map(comment => (
            <CommentItem
              key={comment.id || comment.documentId}
              comment={comment}
              onReplyAdded={refreshComments}
              onDeleted={(docId) => setComments(prev => prev.filter(c => c.documentId !== docId))}
              articleId={articleId}
              articleDocumentId={articleDocumentId}
              userId={user?.id}
              user={user}
              isAuthenticated={isAuthenticated}
              formatDate={formatDate}
              refreshComments={refreshComments}
              setTotalCount={setTotalCount}
            />
          ))}

          {(hasMoreComments || currentPage > 1) && (
            <div className="flex items-center justify-center gap-3 pt-2">
              {currentPage > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadComments(1)}
                  disabled={isLoadingComments}
                  className="gap-2 rounded-full text-xs text-muted-foreground"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show less
                </Button>
              )}
              {hasMoreComments && (
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
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

