'use client'

import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleActionsProps {
  articleId: string;
}

export default function ArticleActions({ articleId }: ArticleActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42); // Dummy initial count
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex gap-6">
        <button 
          onClick={handleLike}
          className="flex items-center gap-2 group"
          aria-label={liked ? "Unlike" : "Like"}
        >
          <span className={cn(
            "p-2 rounded-full transition-colors",
            liked ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : 
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400"
          )}>
            <ThumbsUp size={18} className={cn(liked && "fill-current")} />
          </span>
          <span className="text-sm font-medium">{likeCount}</span>
        </button>
        
        <a 
          href="#comments" 
          className="flex items-center gap-2 group"
        >
          <span className="p-2 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
            <MessageSquare size={18} />
          </span>
          <span className="text-sm font-medium">12</span>
        </a>
      </div>
      
      <button 
        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
        aria-label="Report article"
      >
        <Flag size={16} />
        <span>Report</span>
      </button>
    </div>
  );
}
