'use client'

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Comment as StrapiComment } from '@/types';
import { MessageCircle, ThumbsUp, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  articleId: string;
  comments: StrapiComment[];
}

export default function CommentSection({ articleId, comments }: CommentSectionProps) {
  const [localComments] = useState<StrapiComment[]>(comments);
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn] = useState(false); // TODO: Connect to auth context

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    // TODO: Call Strapi API to create comment
    console.log('Submitting comment:', newComment, 'for article:', articleId);
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: StrapiComment; isReply?: boolean }) => {
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [showReply, setShowReply] = useState(false);

    // Extract username from users_permissions_user relation or use anonymous
    const userName = typeof comment.users_permissions_user === 'object' && comment.users_permissions_user !== null
      ? ((comment.users_permissions_user as { username?: string }).username || 'Anonymous')
      : 'Anonymous';

    // Generate anonymous avatar with gradient
    const getAnonymousAvatar = (name: string) => {
      const colors = [
        'from-blue-500 to-purple-500',
        'from-green-500 to-teal-500',
        'from-pink-500 to-red-500',
        'from-yellow-500 to-orange-500',
        'from-indigo-500 to-blue-500',
      ];
      const colorIndex = name.charCodeAt(0) % colors.length;
      const initial = name.charAt(0).toUpperCase();
      
      return (
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
          "bg-gradient-to-br",
          colors[colorIndex]
        )}>
          {initial}
        </div>
      );
    };

    const handleLike = async () => {
      if (!isLoggedIn) return;
      
      const newLikeCount = hasLiked ? likeCount - 1 : likeCount + 1;
      setHasLiked(!hasLiked);
      setLikeCount(newLikeCount);
      
      // TODO: Call API to update comment likes
      console.log('Updating comment likes:', comment.documentId, newLikeCount);
    };

    return (
      <div className={cn(
        "flex gap-4 p-6 rounded-lg bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800",
        isReply && "ml-8 bg-gray-50 dark:bg-gray-900/20"
      )}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {getAnonymousAvatar(userName)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {userName}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.CommentDateTime)}
            </span>
            {isReply && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                Reply
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {comment.Content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs gap-2",
                hasLiked && "text-red-500"
              )}
              onClick={handleLike}
              disabled={!isLoggedIn}
            >
              <ThumbsUp className={cn(
                "w-4 h-4",
                hasLiked && "fill-current"
              )} />
              <span>{likeCount > 0 ? likeCount : 'Like'}</span>
            </Button>

            {comment.isReplyable !== false && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-2"
                onClick={() => setShowReply(!showReply)}
              >
                <Reply className="w-4 h-4" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply Form (shown when Reply clicked) */}
          {showReply && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <textarea
                placeholder="Write a reply..."
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                rows={3}
                disabled={!isLoggedIn}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReply(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" disabled={!isLoggedIn}>
                  {isLoggedIn ? 'Post Reply' : 'Sign in to reply'}
                </Button>
              </div>
            </div>
          )}

          {/* Replies List */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">
          Comments {localComments.length > 0 && `(${localComments.length})`}
        </h2>
      </div>

      {/* Comment Form */}
      <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isLoggedIn ? "Share your thoughts..." : "Sign in to comment..."}
            disabled={!isLoggedIn}
            className={cn(
              "w-full min-h-[120px] p-4 rounded-lg border bg-white dark:bg-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-gray-300 dark:border-gray-600"
            )}
          />
          <div className="flex justify-between items-center">
            {!isLoggedIn && (
              <p className="text-sm text-gray-500">
                <a href="/auth/signin" className="text-primary hover:underline">
                  Sign in
                </a>{' '}
                to join the discussion
              </p>
            )}
            <div className="ml-auto">
              <Button type="submit" disabled={!isLoggedIn || newComment.trim() === ''}>
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {localComments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {localComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
