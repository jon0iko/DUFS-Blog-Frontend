'use client'

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
}

const dummyComments: Comment[] = [
  {
    id: '1',
    author: { 
      name: 'Ashwin',
      avatar: 'https://via.placeholder.com/40'
    },
    content: 'What a brilliant essay - thank you for this insightful analysis!',
    date: '3 days ago',
    likes: 5,
  },
  {
    id: '2',
    author: { 
      name: 'Munira Ahmed',
      avatar: 'https://via.placeholder.com/40'
    },
    content: 'I especially appreciated the cultural context section. It helped me understand the film from a different perspective.',
    date: '1 week ago',
    likes: 12,
    replies: [
      {
        id: '2-1',        author: { 
          name: 'Joya',
          avatar: 'https://via.placeholder.com/40'
        },
        content: 'Absolutely! I think the director\'s background in documentary filmmaking really shows through in those sequences.',
        date: '5 days ago',
        likes: 3,
      }
    ]
  }
];

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(dummyComments);
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // In a real app, this would come from auth context

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newComment.trim() === '') return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Guest User',
        avatar: 'https://via.placeholder.com/40',
      },
      content: newComment,
      date: 'Just now',
      likes: 0,
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={cn("flex gap-4", isReply && "ml-12 mt-4")}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image 
          src={comment.author.avatar || 'https://via.placeholder.com/40'} 
          alt={comment.author.name}
          className="rounded-full"
          fill
        />
      </div>
      
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium">{comment.author.name}</h4>
            <span className="text-xs text-gray-500">{comment.date}</span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
        
        <div className="flex gap-4 mt-2 text-sm">
          <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Like ({comment.likes})
          </button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Reply
          </button>
        </div>
        
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <section id="comments" className="pt-4">
      <h3 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h3>
      
      <div className="mb-8">
        {isLoggedIn ? (          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Commenting as <strong>Guest User</strong></span>
              <button 
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sign Out
              </button>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 transition"
              rows={3}
              required
            />
            <div className="flex justify-end mt-3">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center mb-8">
            <p className="mb-3">Sign in to join the conversation</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsLoggedIn(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Sign In
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded font-medium transition">
                Create Account
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </section>
  );
}
