'use client'

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Comment as StrapiComment } from '@/types';
import { MessageCircle, ThumbsUp, Reply, Send, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { strapiAPI } from '@/lib/api';

interface CommentSectionProps {
  articleId: number;
  articleDocumentId: string;
  initialComments?: StrapiComment[];
}

export default function CommentSection({ 
  articleId, 
  articleDocumentId,
  initialComments = [] 
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<StrapiComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date to relative time
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }, []);

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' || !isAuthenticated || !user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const createdComment = await strapiAPI.createComment(
        articleId,
        newComment.trim(),
        user.id
      );
      
      // Add the new comment with user info
      const commentWithUser = {
        ...createdComment,
        users_permissions_user: { username: user.username, id: user.id },
        replies: [],
      };
      
      setComments(prev => [commentWithUser, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh comments from server
  const refreshComments = useCallback(async () => {
    try {
      const freshComments = await strapiAPI.getCommentsByArticle(articleDocumentId);
      setComments(freshComments);
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  }, [articleDocumentId]);

  // Comment Item Component
  const CommentItem = ({ 
    comment, 
    isReply = false,
    onReplyAdded
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

    // Extract username from users_permissions_user relation
    const userName = (() => {
      if (!comment.users_permissions_user) return 'Anonymous';
      if (typeof comment.users_permissions_user === 'object') {
        return (comment.users_permissions_user as { username?: string }).username || 'Anonymous';
      }
      return 'Anonymous';
    })();

    // Check if current user owns this comment
    const isOwner = user && comment.users_permissions_user && 
      typeof comment.users_permissions_user === 'object' &&
      (comment.users_permissions_user as { id?: number }).id === user.id;

    // Generate avatar with gradient based on name
    const getAvatar = (name: string) => {
      const colors = [
        'from-blue-500 to-purple-600',
        'from-emerald-500 to-teal-600',
        'from-pink-500 to-rose-600',
        'from-amber-500 to-orange-600',
        'from-indigo-500 to-violet-600',
        'from-cyan-500 to-blue-600',
        'from-fuchsia-500 to-pink-600',
        'from-lime-500 to-green-600',
      ];
      const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      const initial = name.charAt(0).toUpperCase();
      
      return (
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
          "bg-gradient-to-br shadow-md",
          colors[colorIndex]
        )}>
          {initial}
        </div>
      );
    };

    // Handle like
    const handleLike = async () => {
      if (!isAuthenticated) return;
      
      const newLikeCount = hasLiked ? likeCount - 1 : likeCount + 1;
      setHasLiked(!hasLiked);
      setLikeCount(newLikeCount);
      
      try {
        await strapiAPI.updateCommentLikes(comment.documentId, newLikeCount);
      } catch (err) {
        console.error('Error updating likes:', err);
        // Revert on error
        setHasLiked(hasLiked);
        setLikeCount(likeCount);
      }
    };

    // Handle reply submission
    const handleSubmitReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (replyContent.trim() === '' || !isAuthenticated || !user) return;

      setIsSubmittingReply(true);

      try {
        const createdReply = await strapiAPI.createCommentReply(
          comment.id,
          articleId,
          replyContent.trim(),
          user.id
        );

        const replyWithUser = {
          ...createdReply,
          users_permissions_user: { username: user.username, id: user.id },
        };

        setLocalReplies(prev => [...prev, replyWithUser]);
        setReplyContent('');
        setShowReplyForm(false);
        onReplyAdded?.();
      } catch (err) {
        console.error('Error creating reply:', err);
      } finally {
        setIsSubmittingReply(false);
      }
    };

    // Handle delete
    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this comment?')) return;

      try {
        await strapiAPI.deleteComment(comment.documentId);
        refreshComments();
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    };

    const repliesCount = localReplies.length;

    return (
      <div className={cn(
        "group",
        isReply && "ml-12 mt-4"
      )}>
        <div className={cn(
          "flex gap-4 p-5 rounded-xl transition-all duration-200",
          "bg-white dark:bg-gray-800/50",
          "border border-gray-100 dark:border-gray-700/50",
          "hover:border-gray-200 dark:hover:border-gray-600/50",
          "hover:shadow-sm",
          isReply && "bg-gray-50/50 dark:bg-gray-900/30"
        )}>
          {/* Avatar */}
          {getAvatar(userName)}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {userName}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  •
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.CommentDateTime)}
                </span>
                {isReply && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    Reply
                  </span>
                )}
              </div>

              {/* Delete button for owner */}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Comment Content */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {comment.Content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs gap-1.5 rounded-full",
                  hasLiked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-500"
                )}
                onClick={handleLike}
                disabled={!isAuthenticated}
                title={!isAuthenticated ? "Sign in to like" : undefined}
              >
                <ThumbsUp className={cn(
                  "w-3.5 h-3.5",
                  hasLiked && "fill-current"
                )} />
                <span>{likeCount > 0 ? likeCount : ''}</span>
              </Button>

              {!isReply && comment.isReplyable !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 rounded-full text-gray-500"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? "Sign in to reply" : undefined}
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </Button>
              )}

              {/* Show/Hide Replies Toggle */}
              {!isReply && repliesCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 rounded-full text-primary"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && isAuthenticated && (
              <form onSubmit={handleSubmitReply} className="mt-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {getAvatar(user?.username || 'U')}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${userName}...`}
                      className={cn(
                        "w-full p-3 rounded-lg border text-sm resize-none",
                        "bg-gray-50 dark:bg-gray-900",
                        "border-gray-200 dark:border-gray-700",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        "placeholder:text-gray-400"
                      )}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={replyContent.trim() === '' || isSubmittingReply}
                        className="gap-2"
                      >
                        {isSubmittingReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Replies List */}
        {!isReply && showReplies && localReplies.length > 0 && (
          <div className="space-y-3 mt-3">
            {localReplies.map((reply) => (
              <CommentItem 
                key={reply.id || reply.documentId} 
                comment={reply} 
                isReply={true} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalCommentsCount = comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Discussion
          {totalCommentsCount > 0 && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({totalCommentsCount})
            </span>
          )}
        </h2>
      </div>

      {/* Comment Form */}
      <div className={cn(
        "p-5 rounded-xl",
        "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50",
        "border border-gray-200 dark:border-gray-700"
      )}>
        {isAuthenticated && user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className={cn(
                    "w-full min-h-[100px] p-4 rounded-xl border text-sm",
                    "bg-white dark:bg-gray-900",
                    "border-gray-200 dark:border-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "placeholder:text-gray-400 resize-none"
                  )}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-500 ml-14">{error}</p>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={newComment.trim() === '' || isSubmitting}
                className="gap-2 rounded-full px-6"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Join the discussion! Share your thoughts with the community.
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <a href="/auth/signin">Sign in to comment</a>
            </Button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No comments yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id || comment.documentId} 
              comment={comment}
              onReplyAdded={refreshComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
