'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, MessageCircle, MoreVertical, Edit, Trash2, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { getFontClass } from '@/lib/fonts';

export interface UserArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  featuredImage?: string;
  category?: string;
  viewCount: number;
  likes: number;
  commentCount: number;
  publishedAt: string;
  BlogDate?: string; // Admin-controlled publish date
  storyState: string;
  language: 'en' | 'bn' | 'both';
}

interface UserArticlesListProps {
  articles: UserArticle[];
  onDelete?: (documentId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const ArticleRow: FC<{ article: UserArticle; onDelete?: (documentId: string) => void }> = ({
  article,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const titleFontClass = getFontClass(article.title);

  const getStatusBadge = (state: string) => {
    const badges = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-gray-100 text-gray-800 dark:bg-brand-black-90 dark:text-gray-400',
      review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[state as keyof typeof badges] || badges.draft;
  };

  return (
    <div className="group bg-white dark:bg-brand-black-90 border border-gray-200 dark:border-gray-500 rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <Link
              href={`/read-article?slug=${article.slug}`}
              
            >
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="128px"
            />
            </Link>
          </div>
        )}

        {/* Article Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <Link
                href={`/read-article?slug=${article.slug}`}
                className={cn(
                  'text-lg font-bold text-black dark:text-white hover:underline line-clamp-2',
                  titleFontClass
                )}
              >
                {article.title}
              </Link>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2d31] transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <Link
                      href={`/editor?article=${article.documentId}`}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#2a2d31] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(article.documentId);
                        }}
                        className="flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(article.storyState))}>
              {article.storyState}
            </span>
            {article.category && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-[#2a2d31] rounded-full text-xs">
                {article.category}
              </span>
            )}
            {(article.BlogDate || article.publishedAt) && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(article.BlogDate || article.publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{article.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{article.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserArticlesList: FC<UserArticlesListProps> = ({ 
  articles, 
  onDelete, 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading = false 
}) => {
  if (articles.length === 0 && !isLoading) {
    return (
      <div className="bg-white dark:bg-brand-black-90 border border-gray-200 dark:border-gray-500 rounded-xl p-12 text-center">
        <Edit className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-black dark:text-white mb-2">No posts yet</h3>
        
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleRow key={article.documentId} article={article} onDelete={onDelete} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-black-90 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-brand-black-80 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === 2 && currentPage > 3) || 
                (page === totalPages - 1 && currentPage < totalPages - 2);

              if (showEllipsis) {
                return (
                  <span key={page} className="px-2 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={cn(
                    "w-10 h-10 rounded-lg font-medium transition-colors",
                    page === currentPage
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-black-90 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-black-80",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-black-90 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-brand-black-80 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserArticlesList;
