'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Trash2, Edit3, Loader2, Clock, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Draft } from '@/types';
import { strapiAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';

interface DraftsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft?: (documentId: string) => void;
}

export default function DraftsListModal({
  isOpen,
  onClose,
  onLoadDraft,
  onDeleteDraft,
}: DraftsListModalProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch drafts when modal opens
  const fetchDrafts = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userDrafts = await strapiAPI.getDraftsForUser(user.id);
      setDrafts(userDrafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchDrafts();
    }
  }, [isOpen, user?.id, fetchDrafts]);

  // Format date to relative time
  const formatDate = (dateString: string) => {
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
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Handle draft deletion
  const handleDelete = async (draft: Draft, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${draft.name}"?`)) {
      return;
    }

    setDeletingId(draft.documentId);
    
    try {
      await strapiAPI.deleteDraft(draft.documentId);
      setDrafts(prev => prev.filter(d => d.documentId !== draft.documentId));
      onDeleteDraft?.(draft.documentId);
      toast.success(`Draft "${draft.name}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting draft:', err);
      toast.error('Failed to delete draft', 'Delete Failed');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle loading a draft
  const handleLoadDraft = (draft: Draft) => {
    onLoadDraft(draft);
    onClose();
  };

  // Get word count from content
  const getWordCount = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-lg mx-4 rounded-2xl",
        "bg-white dark:bg-brand-black-90",
        "border border-gray-200 dark:border-gray-700",
        "shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        "max-h-[80vh] flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Your Drafts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {drafts.length > 0 ? `${drafts.length} saved draft${drafts.length > 1 ? 's' : ''}` : 'Manage your saved drafts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full",
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-brand-black-90",
              "transition-colors"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Loading drafts...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchDrafts}>
                Try Again
              </Button>
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-brand-black-90 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No drafts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                Start writing and save your work as a draft to continue later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div
                  key={draft.documentId}
                  onClick={() => handleLoadDraft(draft)}
                  className={cn(
                    "group p-4 rounded-xl cursor-pointer",
                    "bg-gray-50 dark:bg-brand-black-90/50",
                    "border border-gray-100 dark:border-gray-700/50",
                    "hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10",
                    "transition-all duration-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Edit3 className="w-4 h-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {draft.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(draft.updatedAt)}
                        </span>
                        <span>•</span>
                        <span>{getWordCount(draft.content)} words</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(draft, e)}
                      disabled={deletingId === draft.documentId}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      )}
                    >
                      {deletingId === draft.documentId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
